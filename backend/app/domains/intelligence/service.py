import asyncio
from uuid import uuid4, UUID
from typing import List, Optional, Dict, Any
from fastapi import HTTPException

from backend.app.domains.strategy.service import StrategyService
from backend.app.domains.simulation.service import SimulationService
from backend.app.domains.history.service import HistoricalAnalysisService
from backend.app.domains.intelligence.repository import DriverRepository, TeamRepository
from backend.app.models.strategy import Driver, Team, RaceSession
from backend.app.api.schemas.dashboard import ReasoningItem
from backend.app.ml.prediction_service import PredictionService
from backend.app.ml.explainability import PredictionExplanationService
from backend.app.ml.features import FeatureGenerator
from backend.app.ml.schemas import FeatureVector, FeatureContext
from backend.app.core.config import settings


class StrategyIntelligenceService:
    def __init__(
        self,
        strategy_service: StrategyService,
        simulation_service: SimulationService,
        history_service: HistoricalAnalysisService,
        driver_repo: DriverRepository,
        team_repo: TeamRepository,
        prediction_service: PredictionService,
        explanation_service: PredictionExplanationService,
    ):
        self.strategy_service = strategy_service
        self.simulation_service = simulation_service
        self.history_service = history_service
        self.driver_repo = driver_repo
        self.team_repo = team_repo
        self.prediction_service = prediction_service
        self.explanation_service = explanation_service

    async def generate_recommendation(
        self,
        circuit_id: str,
        driver_id: str,
        compound: str,
        tyre_age: int,
        laps_remaining: int,
        current_position: int = 5,
        iterations: int = 1000
    ) -> Dict[str, Any]:
        # 1. Gather all intelligence data in parallel
        driver_task = self.driver_repo.get_by_id(driver_id)
        history_task = self.history_service.get_circuit_history(circuit_id)
        memory_task = self.strategy_service.get_circuit_memories(circuit_id)
        circuit_task = self.strategy_service.circuit_repo.get_by_id(circuit_id)
        
        # Default to 1-STOP for similarity check if not specified
        history_analysis_task = self.history_service.analyze_strategy_similarity(circuit_id, "1-STOP")

        results = await asyncio.gather(
            driver_task,
            history_task,
            memory_task,
            history_analysis_task,
            circuit_task,
            return_exceptions=True,
        )

        driver = results[0] if not isinstance(results[0], Exception) else None
        history_list = results[1] if not isinstance(results[1], Exception) else []
        memories = results[2] if not isinstance(results[2], Exception) else []
        historical_analysis = results[3] if not isinstance(results[3], Exception) else {}
        circuit = results[4] if not isinstance(results[4], Exception) else None

        if not driver:
            raise HTTPException(status_code=404, detail=f"Driver {driver_id} not found")
        if not circuit:
            raise HTTPException(status_code=404, detail=f"Circuit {circuit_id} not found")

        team = await self.team_repo.get_by_id(driver.team_id)

        # 2. ML Prediction Layer (Identity-Aware for context)
        ctx = FeatureContext(
            current_position=current_position,
            laps_remaining=laps_remaining,
            compound=compound,
            tyre_age=tyre_age,
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
        feature_vector = FeatureGenerator.generate_vector(ctx)
        
        ml_win_task = self.explanation_service.explain_prediction(feature_vector, "victory")
        ml_podium_task = self.explanation_service.explain_prediction(feature_vector, "podium")
        ml_top5_task = self.explanation_service.explain_prediction(feature_vector, "top5")
        
        ml_results = await asyncio.gather(ml_win_task, ml_podium_task, ml_top5_task)
        ml_win = ml_results[0]
        ml_podium = ml_results[1]
        ml_top5 = ml_results[2]

        # 3. Simulation Integration (Identity-Agnostic)
        # Simulation depends ONLY on race-state inputs
        session = await self.strategy_service.create_session(
            circuit_id=circuit_id,
            driver_id=driver_id,
            config={
                "compound": compound,
                "tyre_age": tyre_age,
                "laps_remaining": laps_remaining,
                "current_position": current_position
            }
        )
        
        sim_input = {
            "base_position": current_position,
            "iterations": iterations,
            "compound": compound,
            "tyre_age": tyre_age,
            "laps_remaining": laps_remaining,
        }
        simulation_result = await self.simulation_service.run_monte_carlo(session.id, sim_input)
        
        # 4. Strategy Memory Integration
        memory_analysis = await self.strategy_service.analyze_memories(circuit_id)

        # 5. Calculate Unified Command Signal
        win_prob_sim = simulation_result.win_prob
        podium_prob_sim = simulation_result.podium_prob
        avg_finish = simulation_result.avg_finish
        distribution = simulation_result.raw_output.get("distribution", [])

        hist_success_rate = historical_analysis.get("success_rate", 0.0)
        memory_success_rate = memory_analysis.get("memory_success_rate", 0.0)
        
        win_prob_ml = ml_win["prediction"]
        podium_prob_ml = ml_podium["prediction"]

        # Blended Confidence with Weight Tracking
        confidence_weights = [
            {"source": "Simulation", "weight": settings.WEIGHT_SIMULATION, "value": win_prob_sim / 100.0},
            {"source": "ML Prediction", "weight": settings.WEIGHT_ML, "value": win_prob_ml / 100.0},
            {"source": "History", "weight": settings.WEIGHT_HISTORY, "value": hist_success_rate},
            {"source": "Memory", "weight": settings.WEIGHT_MEMORY, "value": memory_success_rate}
        ]
        
        confidence = sum(w["weight"] * w["value"] for w in confidence_weights)
        confidence = round(min(1.0, max(0.0, confidence)), 2)

        # Decision Logic
        if win_prob_sim >= 30 or win_prob_ml >= 40:
            recommendation = "ATTACK"
        elif confidence >= 0.6 and hist_success_rate >= 0.5:
            recommendation = "STAY"
        elif avg_finish >= 10 and win_prob_ml <= 10:
            recommendation = "PIT"
        else:
            recommendation = "DEFEND"

        risk_level = self._compute_risk_level(driver, team, win_prob_sim, win_prob_ml, hist_success_rate)
        pit_window = self._compute_pit_window(tyre_age, laps_remaining, recommendation)

        # 6. Explainability Engine
        reasoning = self._build_explainability_chain(
            driver=driver,
            team=team,
            win_prob_sim=win_prob_sim,
            win_prob_ml=win_prob_ml,
            ml_factors=[f["friendly_name"] for f in ml_win["factors"][:3]],
            hist_success_rate=hist_success_rate,
            memory_success_rate=memory_success_rate,
            memory_match_count=memory_analysis.get("memory_match_count", 0),
            recommendation=recommendation,
            confidence=confidence,
            avg_finish=avg_finish
        )

        return {
            "recommendation": recommendation,
            "confidence": confidence,
            "confidence_weights": confidence_weights,
            "pit_window": pit_window,
            "risk_level": risk_level,
            "historical_success_rate": round(hist_success_rate, 2),
            "memory_success_rate": round(memory_success_rate, 2),
            "memory_match_count": memory_analysis.get("memory_match_count", 0),
            "win_probability": round(win_prob_sim, 1),
            "win_probability_ml": round(win_prob_ml, 1),
            "podium_probability_ml": round(podium_prob_ml, 1),
            "top5_probability_ml": round(ml_top5["prediction"], 1),
            "prediction_explanation": ml_win,
            "reasoning": reasoning,
            "driver_data": driver,
            "team_data": team,
            "simulation_data": {
                "win_prob": win_prob_sim,
                "podium_prob": podium_prob_sim,
                "avg_finish": avg_finish,
                "distribution": distribution,
                "best_case": simulation_result.best_case,
                "worst_case": simulation_result.worst_case,
                "variance": simulation_result.raw_output.get("variance", 0.0),
                "confidence_interval": simulation_result.raw_output.get("confidence_interval", [0.0, 0.0]),
                "sample_size": simulation_result.raw_output.get("sample_size", iterations)
            },
            "history_data": historical_analysis
        }


    def _compute_risk_level(self, driver: Driver, team: Optional[Team], win_sim: float, win_ml: float, hist_rate: float) -> str:
        risk_score = 0.0
        risk_score += (100 - driver.consistency) / 100.0 * 2
        # Volatility between Sim and ML
        risk_score += abs(win_sim - win_ml) / 10.0
        risk_score += (1.0 - hist_rate) * 2

        if risk_score >= 7: return "high"
        if risk_score >= 4: return "medium"
        return "low"

    def _compute_pit_window(self, tyre_age: int, laps_remaining: int, recommendation: str) -> Optional[int]:
        if recommendation == "PIT": return max(1, tyre_age + 2)
        if recommendation == "ATTACK": return max(1, laps_remaining // 3)
        return None

    def _build_explainability_chain(
        self,
        driver: Driver,
        team: Optional[Team],
        win_prob_sim: float,
        win_prob_ml: float,
        ml_factors: List[str],
        hist_success_rate: float,
        memory_success_rate: float,
        memory_match_count: int,
        recommendation: str,
        confidence: float,
        avg_finish: float
    ) -> List[ReasoningItem]:
        reasoning: List[ReasoningItem] = []

        # ML Evidence
        reasoning.append(ReasoningItem(
            source="ml_prediction",
            detail=f"Predictive model projects {win_prob_ml:.1f}% win probability. Top factors: {', '.join(ml_factors)}.",
            impact="positive" if win_prob_ml >= 20 else "neutral"
        ))

        # Simulation Evidence
        reasoning.append(ReasoningItem(
            source="simulation",
            detail=f"Monte Carlo simulation projects P{round(avg_finish)} finish with {win_prob_sim:.1f}% win certainty.",
            impact="positive" if win_prob_sim >= 20 else "negative"
        ))

        # Historical/Memory
        if memory_match_count > 0:
            reasoning.append(ReasoningItem(
                source="strategy_memory",
                detail=f"Memory bank success rate: {memory_success_rate:.0%}. Historical circuit success: {hist_success_rate:.0%}.",
                impact="positive" if memory_success_rate >= 0.5 else "negative"
            ))

        # Decision
        reasoning.append(ReasoningItem(
            source="intelligence_layer",
            detail=f"Recommendation: {recommendation} ({confidence:.0%} confidence). Blended signal from simulation, historical data, and ML projections.",
            impact="positive"
        ))

        return reasoning
