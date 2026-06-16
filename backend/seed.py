import asyncio
import json
import os
from pathlib import Path

from sqlalchemy import select
from backend.app.db.session import AsyncSessionLocal
from backend.app.models.strategy import Team, Driver, Circuit, HistoricalRace

DATA_DIR = Path(__file__).resolve().parent / "data"

def slug(name: str) -> str:
    return name.lower().replace(" ", "-")

async def seed():
    async with AsyncSessionLocal() as session:
        # --- Teams ---
        with open(DATA_DIR / "teams.json") as f:
            teams_data = json.load(f)
        for t in teams_data:
            existing = await session.execute(
                select(Team).where(Team.id == slug(t["name"]))
            )
            if existing.scalar_one_or_none():
                continue
            team = Team(
                id=slug(t["name"]),
                name=t["name"],
                aggression=t.get("aggression", 50),
                undercut_bias=t.get("undercut_bias", 50),
                risk_tolerance=t.get("risk_tolerance", 50),
                tyre_focus=t.get("tyre_focus", 50),
                weather_adaptability=t.get("weather_adaptability", 50),
            )
            session.add(team)
        await session.flush()

        # --- Drivers ---
        with open(DATA_DIR / "drivers.json") as f:
            drivers_data = json.load(f)
        drivers_data.extend([
            {
                "name": "Charles Leclerc",
                "team": "Ferrari",
                "aggression": 92,
                "tyre_management": 88,
                "wet_weather": 90,
                "overtaking": 91,
            },
            {
                "name": "Carlos Sainz",
                "team": "Ferrari",
                "aggression": 85,
                "tyre_management": 87,
                "wet_weather": 84,
                "overtaking": 86,
            },
        ])
        for d in drivers_data:
            existing = await session.execute(
                select(Driver).where(Driver.id == slug(d["name"]))
            )
            if existing.scalar_one_or_none():
                continue
            team_id = slug(d["team"])
            driver = Driver(
                id=slug(d["name"]),
                name=d["name"],
                team_id=team_id,
                aggression=d.get("aggression", 50),
                tyre_management=d.get("tyre_management", 50),
                overtake_efficiency=d.get("overtaking", 50),
                wet_weather_skill=d.get("wet_weather", 50),
                consistency=d.get("consistency", 80),
                racecraft=d.get("racecraft", 80),
            )
            session.add(driver)
        await session.flush()

        # --- Circuits ---
        circuits = [
            Circuit(id="monaco", name="Monaco", laps=78, length_km=3.337, avg_pit_loss=18.0, characteristics=None),
            Circuit(id="singapore", name="Singapore", laps=62, length_km=4.940, avg_pit_loss=22.0, characteristics=None),
            Circuit(id="monza", name="Monza", laps=53, length_km=5.793, avg_pit_loss=16.0, characteristics=None),
            Circuit(id="spa", name="Spa-Francorchamps", laps=44, length_km=7.004, avg_pit_loss=15.5, characteristics=None),
            Circuit(id="silverstone", name="Silverstone", laps=52, length_km=5.891, avg_pit_loss=16.5, characteristics=None),
        ]
        for c in circuits:
            existing = await session.execute(
                select(Circuit).where(Circuit.id == c.id)
            )
            if not existing.scalar_one_or_none():
                session.add(c)
        await session.flush()

        # --- Historical Races ---
        with open(DATA_DIR / "historical" / "races.json") as f:
            races_data = json.load(f)
        for r in races_data:
            circuit_slug = slug(r.get("circuit", "monaco"))
            winner_slug = slug(r.get("winner", "unknown"))
            existing = await session.execute(
                select(HistoricalRace).where(
                    HistoricalRace.circuit_id == circuit_slug,
                    HistoricalRace.season == r.get("season", 2024),
                )
            )
            if existing.scalar_one_or_none():
                continue
            race = HistoricalRace(
                circuit_id=circuit_slug,
                season=r.get("season", 2024),
                winner_id=winner_slug,
                winning_strategy=r.get("winning_strategy", "1-STOP"),
                pit_stop_lap=r.get("pit_stop_lap", 25),
                starting_grid={},
                weather=r.get("weather", "Dry"),
                fastest_lap=None,
                winning_gap=None,
                tyre_strategy={},
                race_pace_metrics={},
                safety_cars=r.get("safety_cars", 0),
            )
            session.add(race)

        await session.commit()
        print("Seed data inserted successfully.")

if __name__ == "__main__":
    asyncio.run(seed())
