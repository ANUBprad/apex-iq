from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.strategy import SimulationResult

class SimulationResultRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, result: SimulationResult) -> SimulationResult:
        self.session.add(result)
        await self.session.flush()
        return result

    async def get_by_session(self, session_id: UUID) -> List[SimulationResult]:
        result = await self.session.execute(
            select(SimulationResult).where(SimulationResult.session_id == session_id)
        )
        return list(result.scalars().all())
