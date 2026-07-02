from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

_prediction_service = None
_explanation_service = None


async def get_db():
    from backend.app.db.session import AsyncSessionLocal
    async with AsyncSessionLocal() as session:
        yield session


def get_driver_repo(db: AsyncSession = Depends(get_db)):
    from backend.app.domains.intelligence.repository import DriverRepository
    return DriverRepository(db)


def get_team_repo(db: AsyncSession = Depends(get_db)):
    from backend.app.domains.intelligence.repository import TeamRepository
    return TeamRepository(db)


def get_circuit_repo(db: AsyncSession = Depends(get_db)):
    from backend.app.domains.strategy.repository import CircuitRepository
    return CircuitRepository(db)


def get_strategy_memory_repo(db: AsyncSession = Depends(get_db)):
    from backend.app.domains.strategy.repository import StrategyMemoryRepository
    return StrategyMemoryRepository(db)


def get_race_session_repo(db: AsyncSession = Depends(get_db)):
    from backend.app.domains.strategy.repository import RaceSessionRepository
    return RaceSessionRepository(db)


def get_simulation_repo(db: AsyncSession = Depends(get_db)):
    from backend.app.domains.simulation.repository import SimulationResultRepository
    return SimulationResultRepository(db)


def get_historical_repo(db: AsyncSession = Depends(get_db)):
    from backend.app.domains.history.repository import HistoricalRaceRepository
    return HistoricalRaceRepository(db)


def get_strategy_service(
    race_session_repo=None,
    strategy_memory_repo=None,
    circuit_repo=None,
):
    from backend.app.domains.strategy.service import StrategyService
    return StrategyService(race_session_repo, strategy_memory_repo, circuit_repo)


def get_simulation_service(simulation_repo=None):
    from backend.app.domains.simulation.service import SimulationService
    return SimulationService(simulation_repo)


def get_history_service(historical_repo=None):
    from backend.app.domains.history.service import HistoricalAnalysisService
    return HistoricalAnalysisService(historical_repo)


def get_prediction_service():
    global _prediction_service
    if _prediction_service is None:
        from backend.app.ml.prediction_service import PredictionService
        _prediction_service = PredictionService()
    return _prediction_service


def get_explanation_service():
    global _explanation_service
    if _explanation_service is None:
        from backend.app.ml.explainability import PredictionExplanationService
        _explanation_service = PredictionExplanationService(get_prediction_service())
    return _explanation_service


def get_intelligence_service(
    strategy_service=None,
    simulation_service=None,
    history_service=None,
    driver_repo=None,
    team_repo=None,
    prediction_service=None,
    explanation_service=None,
):
    from backend.app.domains.intelligence.service import StrategyIntelligenceService
    return StrategyIntelligenceService(
        strategy_service,
        simulation_service,
        history_service,
        driver_repo,
        team_repo,
        prediction_service,
        explanation_service,
    )


def get_aggregator_service(
    intelligence_service=None,
    driver_repo=None,
    team_repo=None,
):
    from backend.app.domains.dashboard.service import DashboardAggregatorService
    return DashboardAggregatorService(
        intelligence_service,
        driver_repo,
        team_repo,
    )
