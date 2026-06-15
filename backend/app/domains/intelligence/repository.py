from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.strategy import Driver, Team

class DriverRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, driver_id: str) -> Optional[Driver]:
        result = await self.session.execute(
            select(Driver).where(Driver.id == driver_id)
        )
        return result.scalar_one_or_none()

    async def list_all(self) -> List[Driver]:
        result = await self.session.execute(select(Driver))
        return list(result.scalars().all())

class TeamRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, team_id: str) -> Optional[Team]:
        result = await self.session.execute(
            select(Team).where(Team.id == team_id)
        )
        return result.scalar_one_or_none()

    async def list_all(self) -> List[Team]:
        result = await self.session.execute(select(Team))
        return list(result.scalars().all())
