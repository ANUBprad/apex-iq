import asyncio
from typing import Optional
from fastapi import HTTPException
from backend.app.domains.strategy.service import StrategyService
from backend.app.domains.simulation.service import SimulationService
from backend.app.domains.history.service import HistoricalAnalysisService
from backend.app.domains.intelligence.repository import DriverRepository, TeamRepository
from backend.app.api.schemas.dashboard import (
    DashboardAggregateResponse,
    DriverSummary,
    TeamSummary,
    StrategySummary,
    SimulationSummary,
    HistorySummary,
    DashboardAggregateParams
)

class DashboardAggregatorService:
    def __init__(
        self,
        strategy_service: StrategyService,
        simulation_service: SimulationService,
        history_service: HistoricalAnalysisService,
        driver_repo: DriverRepository,
        team_repo: TeamRepository
    ):
        self.strategy_service = strategy_service
        self.simulation_service = simulation_service
        self.history_service = history_service
        self.driver_repo = driver_repo
        self.team_repo = team_repo

    async def get_dashboard_payload(self, params: DashboardAggregateParams) -> DashboardAggregateResponse:
        """
        Orchestrates parallel data fetching from multiple domains to provide a 
        unified dashboard signal.
        """
        # Concurrent execution of all intelligence streams
        driver_task = self.driver_repo.get_by_id(params.driver_id)
        # Note: In Phase 1, these might return None or dummy data until the Engine is linked
        
        # In a real scenario, we'd find the team from the driver
        # For now, we fetch concurrently
        
        results = await asyncio.gather(
            driver_task,
            self.history_service.get_circuit_history(params.circuit_id),
            # Mocking strategy/sim for Phase 1 as the engine linkage is Phase 3
            return_exceptions=True
        )
        
        driver = results[0]
        history_list = results[1]
        
        if not driver:
            raise HTTPException(status_code=404, detail=f"Driver {params.driver_id} not found")

        # Map to DTOs
        driver_summary = DriverSummary(
            id=driver.id,
            name=driver.name,
            aggression=driver.aggression,
            consistency=driver.consistency
        )

        # Team lookup (mocked linkage for now)
        team = await self.team_repo.get_by_id(driver.team_id)
        team_summary = TeamSummary(
            id=team.id if team else "unknown",
            name=team.name if team else "Unknown Team",
            risk_tolerance=team.risk_tolerance if team else 50
        )

        # Placeholder Strategy (Engine integration comes in Phase 3)
        strategy_summary = StrategySummary(
            action="STAY",
            optimal_lap=params.tyre_age + 5,
            confidence=0.85,
            reasoning="Strategy engine integration pending Phase 3. Calculating based on historical averages."
        )

        # Placeholder History
        history_summary = HistorySummary(
            similarity=0.92,
            historical_strategy="1-STOP",
            success_rate=0.75
        )

        return DashboardAggregateResponse(
            driver=driver_summary,
            team=team_summary,
            strategy=strategy_summary,
            history=history_summary,
            status="success"
        )
