from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from uuid import UUID

from backend.app.api.deps import get_db
from backend.app.api.schemas.simulation import (
    SimulationRunRequest,
    SimulationRunResponse,
    SimulationJobStatusResponse,
    SimulationResultData,
)
from backend.app.domains.simulation.job_repository import SimulationJobRepository
from backend.app.domains.simulation.tasks import run_monte_carlo_simulation
from backend.app.models.strategy import SimulationJob

router = APIRouter()


@router.post("/run", response_model=SimulationRunResponse)
async def run_simulation(
    body: SimulationRunRequest,
    db: AsyncSession = Depends(get_db),
):
    job_repo = SimulationJobRepository(db)
    job = SimulationJob(params=body.model_dump())
    job = await job_repo.create(job)
    await db.commit()

    run_monte_carlo_simulation.delay(str(job.id), body.model_dump())

    return SimulationRunResponse(job_id=job.id, status=job.status.value)


@router.get("/{job_id}", response_model=SimulationJobStatusResponse)
async def get_simulation_job(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SimulationJob)
        .where(SimulationJob.id == job_id)
        .options(selectinload(SimulationJob.result))
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    result_data = None
    if job.result_id and job.result:
        r = job.result
        result_data = SimulationResultData(
            win_prob=r.win_prob,
            podium_prob=r.podium_prob,
            avg_finish=r.avg_finish,
            best_case=r.best_case,
            worst_case=r.worst_case,
            iteration_count=r.iteration_count,
            execution_time_ms=r.execution_time_ms,
        )

    return SimulationJobStatusResponse(
        job_id=job.id,
        status=job.status.value,
        created_at=job.created_at,
        completed_at=job.completed_at,
        result=result_data,
        error_message=job.error_message,
    )
