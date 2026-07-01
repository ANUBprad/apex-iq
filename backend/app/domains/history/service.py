from typing import List
from backend.app.domains.history.repository import HistoricalRaceRepository
from backend.app.models.strategy import HistoricalRace


class HistoricalAnalysisService:
    def __init__(self, historical_repo: HistoricalRaceRepository):
        self.historical_repo = historical_repo

    async def get_circuit_history(self, circuit_id: str) -> List[HistoricalRace]:
        return await self.historical_repo.list_by_circuit(circuit_id)

    async def analyze_strategy_similarity(self, circuit_id: str, current_strategy: str) -> dict:
        races = await self.historical_repo.list_by_circuit(circuit_id)
        if not races:
            return {"similarity": 0.0, "success_rate": 0.0, "recommended_strategy": "UNKNOWN", "sample_size": 0}

        winning_strategies = [r.winning_strategy for r in races]
        total = len(winning_strategies)
        exact_matches = sum(1 for s in winning_strategies if s == current_strategy)
        similarity = exact_matches / total if total else 0.0

        success_rate = sum(1 for r in races if r.winning_strategy == current_strategy) / total if total else 0.0

        from collections import Counter
        strategy_counts = Counter(winning_strategies)
        most_common = strategy_counts.most_common(1)
        recommended = most_common[0][0] if most_common else "UNKNOWN"

        return {
            "similarity": round(similarity, 2),
            "success_rate": round(success_rate, 2),
            "recommended_strategy": recommended,
            "sample_size": total,
        }