"""
Final Phase 2 E2E Test
Tests Monte Carlo logic + full job lifecycle without Celery worker dependency.
"""
import asyncio
from sqlalchemy import select
from backend.app.db.session import AsyncSessionLocal
from backend.app.models.strategy import SimulationJob, SimulationResult, JobStatus
from backend.app.domains.simulation.tasks import _run_monte_carlo, _execute_job


async def test():
    # 1. Test Monte Carlo logic
    mc = _run_monte_carlo(base_position=3, iterations=5000)
    win = mc["win_probability"]
    podium = mc["podium_probability"]
    avg = mc["average_finish"]
    print(f"Monte Carlo: win={win}%, podium={podium}%, avg={avg}")
    assert 0 <= win <= 100, f"win_prob out of range: {win}"
    assert win <= podium, f"win_prob {win} > podium_prob {podium}"
    assert 1 <= avg <= 20, f"avg_finish out of range: {avg}"

    # 2. Create a job
    async with AsyncSessionLocal() as db:
        job = SimulationJob(params={"circuit_id": "monaco", "driver_id": "charles-leclerc", "base_position": 3, "iterations": 500})
        db.add(job)
        await db.flush()
        await db.commit()
        jid = job.id
        print(f"Created job: {jid}")

    # 3. Execute job (simulates Celery worker)
    await _execute_job(jid, {"circuit_id": "monaco", "driver_id": "charles-leclerc", "base_position": 3, "iterations": 500})
    print("Job execution completed")

    # 4. Verify result
    async with AsyncSessionLocal() as db:
        r = await db.execute(
            select(SimulationJob).where(SimulationJob.id == jid)
        )
        job = r.scalar_one()
        print(f"Job status: {job.status.value}")
        assert job.status == JobStatus.COMPLETED, f"Expected COMPLETED, got {job.status}"

        r2 = await db.execute(
            select(SimulationResult).where(SimulationResult.id == job.result_id)
        )
        sr = r2.scalar_one()
        print(f"Result: win={sr.win_prob}%, podium={sr.podium_prob}%, avg={sr.avg_finish}")
        print(f"  iterations={sr.iteration_count}, exec_time={sr.execution_time_ms}ms")
        assert sr.win_prob >= 0
        assert sr.iteration_count == 500

    print("ALL CHECKS PASSED")


if __name__ == "__main__":
    asyncio.run(test())
