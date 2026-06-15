from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.strategy import Circuit, StrategyMemory, RaceSession

class CircuitRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, circuit_id: str) -> Optional[Circuit]:
        result = await self.session.execute(
            select(Circuit).where(Circuit.id == circuit_id)
        )
        return result.scalar_one_or_none()

    async def list_all(self) -> List[Circuit]:
        result = await self.session.execute(select(Circuit))
        return list(result.scalars().all())

class StrategyMemoryRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, memory: StrategyMemory) -> StrategyMemory:
        self.session.add(memory)
        await self.session.flush()
        return memory

    async def list_by_circuit(self, circuit_id: str) -> List[StrategyMemory]:
        result = await self.session.execute(
            select(StrategyMemory).where(StrategyMemory.circuit_id == circuit_id)
        )
        return list(result.scalars().all())

class RaceSessionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, race_session: RaceSession) -> RaceSession:
        self.session.add(race_session)
        await self.session.flush()
        return race_session

    async def get_by_id(self, session_id: UUID) -> Optional[RaceSession]:
        result = await self.session.execute(
            select(RaceSession).where(RaceSession.id == session_id)
        )
        return result.scalar_one_or_none()
