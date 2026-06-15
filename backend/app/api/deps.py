from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db

# Repositories
from backend.app.domains.intelligence.repository import DriverRepository, TeamRepository
from backend.app.domains.strategy.repository import CircuitRepository, StrategyMemoryRepository, RaceSessionRepository
from backend.app.domains.simulation.repository import SimulationResultRepository
from backend.app.domains.history.repository import HistoricalRaceRepository

# Services
from backend.app.domains.strategy.service import StrategyService
from backend.app.domains.simulation.service import SimulationService
from backend.app.domains.history.service import HistoricalAnalysisService
from backend.app.domains.dashboard.service import DashboardAggregatorService

# Repository Dependencies
def get_driver_repo(db: AsyncSession = Depends(get_db)):
    return DriverRepository(db)

def get_team_repo(db: AsyncSession = Depends(get_db)):
    return TeamRepository(db)

def get_circuit_repo(db: AsyncSession = Depends(get_db)):
    return CircuitRepository(db)

def get_strategy_memory_repo(db: AsyncSession = Depends(get_db)):
    return StrategyMemoryRepository(db)

def get_race_session_repo(db: AsyncSession = Depends(get_db)):
    return RaceSessionRepository(db)

def get_simulation_repo(db: AsyncSession = Depends(get_db)):
    return SimulationResultRepository(db)

def get_historical_repo(db: AsyncSession = Depends(get_db)):
    return HistoricalRaceRepository(db)

# Service Dependencies
def get_strategy_service(
    race_session_repo = Depends(get_race_session_repo),
    strategy_memory_repo = Depends(get_strategy_memory_repo),
    circuit_repo = Depends(get_circuit_repo)
):
    return StrategyService(race_session_repo, strategy_memory_repo, circuit_repo)

def get_simulation_service(simulation_repo = Depends(get_simulation_repo)):
    return SimulationService(simulation_repo)

def get_history_service(historical_repo = Depends(get_historical_repo)):
    return HistoricalAnalysisService(historical_repo)

def get_aggregator_service(
    strategy_service = Depends(get_strategy_service),
    simulation_service = Depends(get_simulation_service),
    history_service = Depends(get_history_service),
    driver_repo = Depends(get_driver_repo),
    team_repo = Depends(get_team_repo)
):
    return DashboardAggregatorService(
        strategy_service,
        simulation_service,
        history_service,
        driver_repo,
        team_repo
    )
