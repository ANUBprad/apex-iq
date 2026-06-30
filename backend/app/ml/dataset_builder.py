import asyncio
import pandas as pd
import json
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import AsyncSessionLocal
from backend.app.models.strategy import HistoricalRace, StrategyMemory, SimulationResult, Driver, Team, Circuit, RaceSession
from backend.app.ml.features import FeatureGenerator
from backend.app.ml.schemas import FeatureVector, FeatureContext

class DatasetBuilder:
    def __init__(self):
        self.feature_names = FeatureGenerator.get_feature_names()
        self.target_names = ["victory", "podium", "top5", "finish_position"]
        self.stats = {
            "rows_total": 0,
            "rows_used": 0,
            "rows_skipped": 0,
            "skip_reasons": {},
            "tables_used": ["historical_races", "strategy_memory", "simulation_results"],
            "sources": {
                "Driver": False,
                "Team": False,
                "Circuit": False,
                "HistoricalRace": False,
                "StrategyMemory": False,
                "RaceSession": False,
                "SimulationResult": False
            }
        }

    async def build_dataset(self) -> pd.DataFrame:
        async with AsyncSessionLocal() as session:
            # 1. Gather all required data
            drivers = await self._get_all(session, Driver)
            teams = await self._get_all(session, Team)
            circuits = await self._get_all(session, Circuit)
            memories = await self._get_all(session, StrategyMemory)
            historical = await self._get_all(session, HistoricalRace)
            sim_results = await self._get_all(session, SimulationResult)
            sessions = await self._get_all(session, RaceSession)
            
            driver_map = {d.id: d for d in drivers}
            team_map = {t.id: t for t in teams}
            circuit_map = {c.id: c for c in circuits}
            session_map = {s.id: s for s in sessions}

            self.stats["sources"]["Driver"] = len(drivers) > 0
            self.stats["sources"]["Team"] = len(teams) > 0
            self.stats["sources"]["Circuit"] = len(circuits) > 0
            self.stats["sources"]["HistoricalRace"] = len(historical) > 0
            self.stats["sources"]["StrategyMemory"] = len(memories) > 0
            self.stats["sources"]["SimulationResult"] = len(sim_results) > 0
            self.stats["sources"]["RaceSession"] = len(sessions) > 0

            rows = []
            
            # 2. Process StrategyMemory
            for m in memories:
                self.stats["rows_total"] += 1
                row = self._process_memory(m, driver_map, team_map, circuit_map)
                if row:
                    rows.append(row)
                    self.stats["rows_used"] += 1
                else:
                    self.stats["rows_skipped"] += 1

            # 3. Process HistoricalRace
            for h in historical:
                self.stats["rows_total"] += 1
                row = self._process_historical(h, driver_map, team_map, circuit_map)
                if row:
                    rows.append(row)
                    self.stats["rows_used"] += 1
                else:
                    self.stats["rows_skipped"] += 1

            # 4. Process SimulationResult
            for s in sim_results:
                self.stats["rows_total"] += 1
                row = self._process_simulation(s, session_map, driver_map, team_map, circuit_map)
                if row:
                    rows.append(row)
                    self.stats["rows_used"] += 1
                else:
                    self.stats["rows_skipped"] += 1

            # 5. Create DataFrame
            df = pd.DataFrame(rows, columns=self.feature_names + self.target_names)
            
            initial_len = len(df)
            df = df.drop_duplicates()
            dropped_duplicates = initial_len - len(df)
            if dropped_duplicates > 0:
                self.stats["skip_reasons"]["duplicates"] = dropped_duplicates

            df = df.fillna(0)

            return df

    def _process_memory(self, m, driver_map, team_map, circuit_map) -> Optional[list]:
        driver = driver_map.get(m.driver_id)
        circuit = circuit_map.get(m.circuit_id)
        if not driver or not circuit:
            reason = "missing_driver" if not driver else "missing_circuit"
            self.stats["skip_reasons"][reason] = self.stats["skip_reasons"].get(reason, 0) + 1
            return None
            
        team = team_map.get(driver.team_id)

        ctx = FeatureContext(
            current_position=m.outcome_metadata.get("start_position", 5),
            laps_remaining=m.outcome_metadata.get("laps_remaining", 20),
            compound=m.strategy.split("-")[0] if "-" in m.strategy else "MEDIUM",
            tyre_age=5,
            driver_aggression=driver.aggression,
            driver_consistency=driver.consistency,
            driver_racecraft=driver.racecraft,
            driver_overtake_efficiency=driver.overtake_efficiency,
            driver_tyre_management=driver.tyre_management,
            driver_wet_weather_skill=driver.wet_weather_skill,
            team_risk_tolerance=team.risk_tolerance if team else 50,
            team_undercut_bias=team.undercut_bias if team else 50,
            team_tyre_focus=team.tyre_focus if team else 50,
            team_weather_adaptability=team.weather_adaptability if team else 50,
            track_length=circuit.length_km,
            track_lap_count=circuit.laps,
            track_pit_loss=circuit.avg_pit_loss
        )

        vector = FeatureGenerator.generate_vector(ctx)
        features = FeatureGenerator.to_array(vector)
        
        victory = 1 if m.outcome_metadata.get("winner") or m.success_score >= 0.9 else 0
        podium = 1 if victory or m.success_score >= 0.7 else 0
        top5 = 1 if podium or m.success_score >= 0.5 else 0
        finish_pos = m.outcome_metadata.get("finish_position", 1 if victory else 3 if podium else 5 if top5 else 10)

        return features + [victory, podium, top5, finish_pos]

    def _process_historical(self, h, driver_map, team_map, circuit_map) -> Optional[list]:
        driver = driver_map.get(h.winner_id)
        circuit = circuit_map.get(h.circuit_id)
        if not driver or not circuit:
            reason = "hist_missing_driver" if not driver else "hist_missing_circuit"
            self.stats["skip_reasons"][reason] = self.stats["skip_reasons"].get(reason, 0) + 1
            return None
            
        team = team_map.get(driver.team_id)

        ctx = FeatureContext(
            current_position=h.starting_grid.get("position", 1) if isinstance(h.starting_grid, dict) else 1,
            laps_remaining=circuit.laps,
            compound=h.tyre_strategy.get("start_compound", "SOFT") if isinstance(h.tyre_strategy, dict) else "SOFT",
            tyre_age=0,
            driver_aggression=driver.aggression,
            driver_consistency=driver.consistency,
            driver_racecraft=driver.racecraft,
            driver_overtake_efficiency=driver.overtake_efficiency,
            driver_tyre_management=driver.tyre_management,
            driver_wet_weather_skill=driver.wet_weather_skill,
            team_risk_tolerance=team.risk_tolerance if team else 50,
            team_undercut_bias=team.undercut_bias if team else 50,
            team_tyre_focus=team.tyre_focus if team else 50,
            team_weather_adaptability=team.weather_adaptability if team else 50,
            track_length=circuit.length_km,
            track_lap_count=circuit.laps,
            track_pit_loss=circuit.avg_pit_loss
        )

        vector = FeatureGenerator.generate_vector(ctx)
        features = FeatureGenerator.to_array(vector)
        
        victory = 1
        podium = 1
        top5 = 1
        finish_pos = 1

        return features + [victory, podium, top5, finish_pos]

    def _process_simulation(self, s, session_map, driver_map, team_map, circuit_map) -> Optional[list]:
        session = session_map.get(s.session_id)
        if not session:
            self.stats["skip_reasons"]["sim_missing_session"] = self.stats["skip_reasons"].get("sim_missing_session", 0) + 1
            return None
            
        driver = driver_map.get(session.driver_id)
        circuit = circuit_map.get(session.circuit_id)
        if not driver or not circuit:
            self.stats["skip_reasons"]["sim_missing_metadata"] = self.stats["skip_reasons"].get("sim_missing_metadata", 0) + 1
            return None

        team = team_map.get(driver.team_id)

        ctx = FeatureContext(
            current_position=session.config.get("current_position", 5),
            laps_remaining=session.config.get("laps_remaining", 20),
            compound=session.config.get("compound", "MEDIUM"),
            tyre_age=session.config.get("tyre_age", 5),
            driver_aggression=driver.aggression,
            driver_consistency=driver.consistency,
            driver_racecraft=driver.racecraft,
            driver_overtake_efficiency=driver.overtake_efficiency,
            driver_tyre_management=driver.tyre_management,
            driver_wet_weather_skill=driver.wet_weather_skill,
            team_risk_tolerance=team.risk_tolerance if team else 50,
            team_undercut_bias=team.undercut_bias if team else 50,
            team_tyre_focus=team.tyre_focus if team else 50,
            team_weather_adaptability=team.weather_adaptability if team else 50,
            track_length=circuit.length_km,
            track_lap_count=circuit.laps,
            track_pit_loss=circuit.avg_pit_loss
        )

        vector = FeatureGenerator.generate_vector(ctx)
        features = FeatureGenerator.to_array(vector)
        
        victory = 1 if s.win_prob > 0.5 else 0
        podium = 1 if victory or s.podium_prob > 0.5 else 0
        top5 = 1 if podium or s.avg_finish <= 5 else 0
        finish_pos = int(s.avg_finish)

        return features + [victory, podium, top5, finish_pos]


    async def _get_all(self, session: AsyncSession, model):
        result = await session.execute(select(model))
        return result.scalars().all()

    def save_dataset(self, df: pd.DataFrame, path: str = "backend/app/ml/training_dataset.parquet"):
        df.to_parquet(path)
        with open("backend/app/ml/dataset_report.json", "w") as f:
            json.dump(self.stats, f, indent=2)
        print(f"Dataset saved to {path}. Rows: {len(df)}")

if __name__ == "__main__":
    builder = DatasetBuilder()
    df = asyncio.run(builder.build_dataset())
    builder.save_dataset(df)
