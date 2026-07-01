from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.strategy import SimulationJob


class SimulationJobRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, job: SimulationJob) -> SimulationJob:
        self.session.add(job)
        await self.session.flush()
        await self.session.refresh(job)
        return job

    async def get_by_id(self, job_id: UUID) -> Optional[SimulationJob]:
        result = await self.session.execute(
            select(SimulationJob).where(SimulationJob.id == job_id)
        )
        return result.scalar_one_or_none()

    async def save(self, job: SimulationJob) -> SimulationJob:
        await self.session.flush()
        await self.session.refresh(job)
        return job
