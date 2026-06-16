import asyncio
import time
from datetime import datetime
from random import gauss
from typing import Optional
from uuid import UUID

from sqlalchemy import select

from backend.app.celery_app import celery_app
from backend.app.models.strategy import SimulationJob, SimulationResult, RaceSession, JobStatus
from backend.app.db.session import AsyncSessionLocal

_loop: Optional[asyncio.AbstractEventLoop] = None


def _get_event_loop() -> asyncio.AbstractEventLoop:
    global _loop
    if _loop is None or _loop.is_closed():
        _loop = asyncio.new_event_loop()
        asyncio.set_event_loop(_loop)
    return _loop


def _run_monte_carlo(base_position: int, iterations: int) -> dict:
    positions = []
    for _ in range(iterations):
        variation = gauss(0, 2)
        finish = max(1, round(base_position + variation))
        positions.append(finish)

    win_prob = (len([p for p in positions if p == 1]) / iterations) * 100
    podium_prob = (len([p for p in positions if p <= 3]) / iterations) * 100
    avg_finish = sum(positions) / iterations

    return {
        "win_probability": round(win_prob, 1),
        "podium_probability": round(podium_prob, 1),
        "average_finish": round(avg_finish, 1),
        "best_case": min(positions),
        "worst_case": max(positions),
        "iterations": iterations,
    }


async def _execute_job(job_id: UUID, params: dict):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(SimulationJob).where(SimulationJob.id == job_id)
        )
        job = result.scalar_one_or_none()
        if not job:
            return

        job.status = "RUNNING"
        await session.flush()

        try:
            start_ms = int(time.time() * 1000)
            mc = _run_monte_carlo(
                base_position=params.get("base_position", 3),
                iterations=params.get("iterations", 1000),
            )
            elapsed_ms = int(time.time() * 1000) - start_ms

            race_session = RaceSession(
                circuit_id=params.get("circuit_id", "monaco"),
                driver_id=params.get("driver_id", "charles-leclerc"),
                config={},
            )
            session.add(race_session)
            await session.flush()

            sim_result = SimulationResult(
                session_id=race_session.id,
                win_prob=mc["win_probability"],
                podium_prob=mc["podium_probability"],
                avg_finish=mc["average_finish"],
                best_case=mc["best_case"],
                worst_case=mc["worst_case"],
                iteration_count=mc["iterations"],
                execution_time_ms=elapsed_ms,
                raw_output=mc,
            )
            session.add(sim_result)
            await session.flush()

            job.status = "COMPLETED"
            job.result_id = sim_result.id
            job.completed_at = datetime.utcnow()
            await session.flush()

        except Exception as exc:
            job.status = "FAILED"
            job.error_message = str(exc)
            await session.flush()

        await session.commit()


@celery_app.task(bind=True, name="run_monte_carlo_simulation")
def run_monte_carlo_simulation(self, job_id: str, params: dict):
    loop = _get_event_loop()
    loop.run_until_complete(_execute_job(UUID(job_id), params))
