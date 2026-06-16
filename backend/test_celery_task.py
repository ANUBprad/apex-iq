"""Debug: Run the Celery task logic and check for errors."""
import traceback
from backend.app.domains.simulation.tasks import run_monte_carlo_simulation, _execute_job
import asyncio
from uuid import UUID

# Test 1: Direct execution
print("=== Test 1: Direct _execute_job ===")
try:
    asyncio.run(_execute_job(
        UUID("00000000-0000-0000-0000-000000000000"),
        {"base_position": 3, "iterations": 500, "circuit_id": "monaco", "driver_id": "charles-leclerc"}
    ))
    print("Direct execution: OK")
except Exception as e:
    traceback.print_exc()

# Test 2: Via Celery task function (but not via Celery worker)
print("\n=== Test 2: Task function directly ===")
try:
    run_monte_carlo_simulation(
        "00000000-0000-0000-0000-000000000000",
        {"base_position": 3, "iterations": 500, "circuit_id": "monaco", "driver_id": "charles-leclerc"}
    )
    print("Task function: OK")
except Exception as e:
    traceback.print_exc()
