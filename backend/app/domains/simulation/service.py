from uuid import UUID
from backend.app.domains.simulation.repository import SimulationResultRepository
from backend.app.models.strategy import SimulationResult

class SimulationService:
    def __init__(self, simulation_repo: SimulationResultRepository):
        self.simulation_repo = simulation_repo

    async def run_monte_carlo(self, session_id: UUID, input_data: dict):
        # Calculation logic here
        # Return SimulationResult entity
        pass

    async def get_session_results(self, session_id: UUID):
        return await self.simulation_repo.get_by_session(session_id)
