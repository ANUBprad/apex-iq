import asyncio
import time
from uuid import uuid4, UUID
from typing import List, Optional
from fastapi import HTTPException

from backend.app.domains.intelligence.repository import DriverRepository, TeamRepository
from backend.app.domains.intelligence.service import StrategyIntelligenceService
from backend.app.api.schemas.dashboard import (
    DashboardAggregateResponse,
    ReasoningItem,
    DriverSummary,
    TeamSummary,
    StrategySummary,
    SimulationSummary,
    HistorySummary,
    DashboardAggregateRequest,
)
from backend.app.models.strategy import Driver, Team, RaceSession


class DashboardAggregatorService:
    def __init__(
        self,
        intelligence_service: StrategyIntelligenceService,
        driver_repo: DriverRepository,
        team_repo: TeamRepository,
    ):
        self.intelligence_service = intelligence_service
        self.driver_repo = driver_repo
        self.team_repo = team_repo

    async def get_dashboard_payload(self, params: DashboardAggregateRequest) -> DashboardAggregateResponse:
        # Delegate recommendation logic to Intelligence Layer
        intel = await self.intelligence_service.generate_recommendation(
            circuit_id=params.circuit_id,
            driver_id=params.driver_id,
            compound=params.compound,
            tyre_age=params.tyre_age,
            laps_remaining=params.laps_remaining,
            current_position=params.current_position,
            iterations=params.iterations
        )

        driver = intel["driver_data"]
        team = intel["team_data"]
        simulation_result = intel["simulation_data"]
        historical_analysis = intel["history_data"]

        driver_summary = DriverSummary(
            id=driver.id,
            name=driver.name,
            aggression=driver.aggression,
            consistency=driver.consistency,
        )
        team_summary = TeamSummary(
            id=team.id if team else "unknown",
            name=team.name if team else "Unknown Team",
            risk_tolerance=team.risk_tolerance if team else 50,
        )

        return DashboardAggregateResponse(
            circuit_id=params.circuit_id,
            recommendation=intel["recommendation"],
            confidence=intel["confidence"],

            confidence_weights=intel["confidence_weights"],
            pit_window=intel["pit_window"],
            risk_level=intel["risk_level"],
            historical_success_rate=intel["historical_success_rate"],
            memory_success_rate=intel["memory_success_rate"],
            memory_match_count=intel["memory_match_count"],
            win_probability=intel["win_probability"],
            win_probability_ml=intel["win_probability_ml"],
            podium_probability_ml=intel["podium_probability_ml"],
            top5_probability_ml=intel["top5_probability_ml"],
            prediction_explanation=intel["prediction_explanation"],
            reasoning=intel["reasoning"],
            driver=driver_summary,
            team=team_summary,
            strategy=StrategySummary(
                action=intel["recommendation"],
                optimal_lap=intel["pit_window"] or params.tyre_age + 10,
                confidence=intel["confidence"],
                reasoning="; ".join(r.detail for r in intel["reasoning"][:3]),
            ),
            simulation=SimulationSummary(
                win_prob=simulation_result["win_prob"],
                podium_prob=simulation_result["podium_prob"],
                avg_finish=simulation_result["avg_finish"],
                distribution=simulation_result["distribution"],
                best_case=simulation_result["best_case"],
                worst_case=simulation_result["worst_case"],
            ),
            history=HistorySummary(
                similarity=historical_analysis.get("similarity", 0.0),
                historical_strategy=historical_analysis.get("recommended_strategy", "UNKNOWN"),
                success_rate=historical_analysis.get("success_rate", 0.0),
            ),
            status="success",
        )

