"""Debug: Test Celery task execution matching worker conditions."""
import asyncio
from uuid import UUID
from sqlalchemy import select
from backend.app.db.session import AsyncSessionLocal
from backend.app.models.strategy import SimulationJob
from backend.app.domains.simulation.tasks import _execute_job

async def main():
    # Create a real job first
    async with AsyncSessionLocal() as db:
        job = SimulationJob(params={"circuit_id": "monaco", "driver_id": "charles-leclerc", "base_position": 3, "iterations": 500})
        db.add(job)
        await db.flush()
        await db.commit()
        jid = job.id
        print(f"Created job: {jid}")
    
    # Now execute
    await _execute_job(jid, {"circuit_id": "monaco", "driver_id": "charles-leclerc", "base_position": 3, "iterations": 500})
    
    # Verify
    async with AsyncSessionLocal() as db:
        r = await db.execute(select(SimulationJob).where(SimulationJob.id == jid))
        job = r.scalar_one()
        print(f"Status: {job.status.value}")
        if job.status.value == "COMPLETED":
            print("SUCCESS")
        else:
            print(f"Error: {job.error_message}")

asyncio.run(main())
