from typing import List
from backend.app.domains.history.repository import HistoricalRaceRepository
from backend.app.models.strategy import HistoricalRace

class HistoricalAnalysisService:
    def __init__(self, historical_repo: HistoricalRaceRepository):
        self.historical_repo = historical_repo

    async def get_circuit_history(self, circuit_id: str) -> List[HistoricalRace]:
        return await self.historical_repo.list_by_circuit(circuit_id)

    async def analyze_strategy_similarity(self, circuit_id: str, current_strategy: str):
        # Comparison logic here
        pass
