from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.strategy import HistoricalRace

class HistoricalRaceRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_by_circuit(self, circuit_id: str) -> List[HistoricalRace]:
        result = await self.session.execute(
            select(HistoricalRace).where(HistoricalRace.circuit_id == circuit_id)
        )
        return list(result.scalars().all())

    async def get_by_id(self, race_id: str) -> Optional[HistoricalRace]:
        result = await self.session.execute(
            select(HistoricalRace).where(HistoricalRace.id == race_id)
        )
        return result.scalar_one_or_none()
