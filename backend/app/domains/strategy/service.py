from typing import List, Optional
from backend.app.domains.strategy.repository import RaceSessionRepository, StrategyMemoryRepository, CircuitRepository
from backend.app.models.strategy import RaceSession, StrategyMemory
from backend.app.api.schemas.strategy import StrategyInput # Need to create this schema

class StrategyService:
    def __init__(
        self,
        race_session_repo: RaceSessionRepository,
        strategy_memory_repo: StrategyMemoryRepository,
        circuit_repo: CircuitRepository
    ):
        self.race_session_repo = race_session_repo
        self.strategy_memory_repo = strategy_memory_repo
        self.circuit_repo = circuit_repo

    async def create_session(self, circuit_id: str, driver_id: str, config: dict) -> RaceSession:
        session = RaceSession(
            circuit_id=circuit_id,
            driver_id=driver_id,
            config=config,
            status="LIVE"
        )
        return await self.race_session_repo.create(session)

    async def get_strategy_analysis(self, session_id: str):
        pass

    async def get_circuit_memories(self, circuit_id: str) -> List[StrategyMemory]:
        return await self.strategy_memory_repo.list_by_circuit(circuit_id)

    async def analyze_memories(self, circuit_id: str) -> dict:
        memories = await self.strategy_memory_repo.list_by_circuit(circuit_id)
        if not memories:
            return {"memory_success_rate": 0.0, "memory_match_count": 0, "top_strategies": []}

        successful = [m for m in memories if m.success_score >= 0.5]
        memory_success_rate = len(successful) / len(memories) if memories else 0.0

        strategy_counts = {}
        for m in memories:
            strategy_counts[m.strategy] = strategy_counts.get(m.strategy, 0) + 1
        top_strategies = sorted(strategy_counts.items(), key=lambda x: x[1], reverse=True)

        return {
            "memory_success_rate": round(memory_success_rate, 2),
            "memory_match_count": len(memories),
            "top_strategies": [{"strategy": s, "count": c} for s, c in top_strategies[:3]],
        }
