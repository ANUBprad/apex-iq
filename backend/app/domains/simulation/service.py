import time
import math
import random
from uuid import UUID
from collections import Counter

from backend.app.domains.simulation.repository import SimulationResultRepository
from backend.app.models.strategy import SimulationResult


class SimulationService:
    def __init__(self, simulation_repo: SimulationResultRepository):
        self.simulation_repo = simulation_repo

    async def run_monte_carlo(self, session_id: UUID, input_data: dict) -> SimulationResult:
        base_position = input_data.get("base_position", 3)
        iterations = input_data.get("iterations", 1000)
        seed = input_data.get("seed")
        
        # Identity-Agnostic Race State Inputs
        compound = input_data.get("compound", "MEDIUM")
        tyre_age = input_data.get("tyre_age", 0)
        laps_remaining = input_data.get("laps_remaining", 50)
        weather = input_data.get("weather", "DRY")
        fuel_load = input_data.get("fuel_load", 50.0)
        degradation_rate = input_data.get("degradation_rate", 0.05)

        # Deterministic seed support for reproducibility
        rng = random.Random(seed) if seed is not None else random.Random()

        positions = []
        for _ in range(iterations):
            # 1. Base Gaussian variation (inherent race randomness)
            variation = rng.gauss(0, 1.2)
            
            # 2. Tyre degradation impact: older tyres increase expected finish position
            # SOFT tyres degrade faster, impacting stability more
            compound_mult = 1.5 if compound == "SOFT" else 1.0
            tyre_impact = (tyre_age * degradation_rate * compound_mult)
            
            # 3. Weather impact: Rain increases variance and potential position loss
            weather_impact = 0.0
            weather_variance = 0.0
            if weather.upper() in ["RAIN", "WET"]:
                weather_impact = rng.uniform(0.5, 2.0)
                weather_variance = rng.gauss(0, 1.0)
            
            # 4. Fuel load impact: Heavier cars are slightly slower/less agile
            fuel_impact = (fuel_load / 110.0) * 0.4
            
            # 5. Laps remaining: More laps mean more cumulative variance
            lap_variance = rng.gauss(0, (laps_remaining / 60.0))
            
            finish = max(1, round(base_position + variation + tyre_impact + weather_impact + weather_variance + fuel_impact + lap_variance))
            positions.append(finish)

        sample_size = iterations
        win_prob = (len([p for p in positions if p == 1]) / sample_size) * 100
        podium_prob = (len([p for p in positions if p <= 3]) / sample_size) * 100
        avg_finish = sum(positions) / sample_size

        # Variance Reporting & Statistical Stability
        variance = sum((p - avg_finish) ** 2 for p in positions) / (sample_size - 1)
        std_dev = math.sqrt(variance)
        std_err = std_dev / math.sqrt(sample_size)
        
        # 95% Confidence Interval for Average Finish
        confidence_interval = [
            max(1.0, round(avg_finish - 1.96 * std_err, 3)),
            round(avg_finish + 1.96 * std_err, 3)
        ]

        counts = dict(Counter(positions))
        # Ensure distribution covers the range of results
        distribution = [{"position": pos, "frequency": counts.get(pos, 0)} for pos in range(1, max(positions) + 1)]

        raw_output = {
            "distribution": distribution,
            "variance": round(variance, 3),
            "std_dev": round(std_dev, 3),
            "confidence_interval": confidence_interval,
            "sample_size": sample_size,
            "win_prob": round(win_prob, 2),
            "podium_prob": round(podium_prob, 2),
            "avg_finish": round(avg_finish, 2),
            "reproducible": seed is not None
        }

        result = SimulationResult(
            session_id=session_id,
            win_prob=round(win_prob, 1),
            podium_prob=round(podium_prob, 1),
            avg_finish=round(avg_finish, 1),
            best_case=min(positions),
            worst_case=max(positions),
            iteration_count=iterations,
            execution_time_ms=0,
            raw_output=raw_output,
        )

        return await self.simulation_repo.create(result)

    async def get_session_results(self, session_id: UUID):
        return await self.simulation_repo.get_by_session(session_id)
