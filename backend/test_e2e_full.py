"""
Full E2E test: POST /api/v2/simulations/run -> Celery worker -> GET /api/v2/simulations/{job_id}
"""
import json
import subprocess
import sys
import time
import os

TESTER = """
import json, sys, time
sys.path.insert(0, '.')
from backend.main import app
from fastapi.testclient import TestClient

if sys.argv[1] == 'post':
    body = {"circuit_id": "monaco", "driver_id": "max-verstappen", "compound": "SOFT", "tyre_age": 12, "laps_remaining": 45, "iterations": 5000}
    client = TestClient(app)
    r = client.post('/api/v2/simulations/run', json=body)
    print(json.dumps(r.json()))
elif sys.argv[1] == 'get':
    jid = sys.argv[2]
    client = TestClient(app)
    for i in range(30):
        r = client.get('/api/v2/simulations/' + jid)
        data = r.json()
        if data.get('status') in ('COMPLETED', 'FAILED'):
            print(json.dumps(data))
            sys.exit(0)
        time.sleep(1)
    print(json.dumps({"status": "TIMEOUT"}))
"""


def run_python(cmd_args):
    env = os.environ.copy()
    env["PYTHONPATH"] = "."
    proc = subprocess.run(
        [sys.executable, "-c", TESTER] + cmd_args,
        capture_output=True,
        text=True,
        cwd=".",
        env=env,
    )
    for line in proc.stdout.strip().split("\n"):
        line = line.strip()
        if line.startswith("{"):
            return json.loads(line)
    return {"error": proc.stderr.strip()[:300]}


if __name__ == "__main__":
    print("=== Phase 2 E2E Test ===")
    print(f"[1] POST /api/v2/simulations/run")
    result = run_python(["post"])
    jid = result.get("job_id")
    status = result.get("status")
    print(f"    job_id={jid}, status={status}")
    assert jid, f"POST failed: {result}"
    assert status == "PENDING", f"Expected PENDING, got {status}"

    print(f"[2] GET /api/v2/simulations/{jid} (polling for completion)")
    result2 = run_python(["get", jid])
    final_status = result2.get("status")
    print(f"    final_status={final_status}")

    if final_status == "COMPLETED":
        r = result2.get("result", {})
        print(f"    win_prob={r.get('win_prob')}%")
        print(f"    podium_prob={r.get('podium_prob')}%")
        print(f"    avg_finish={r.get('avg_finish')}")
        print(f"    best_case={r.get('best_case')}")
        print(f"    worst_case={r.get('worst_case')}")
        print(f"    iterations={r.get('iteration_count')}")
        print(f"    exec_time={r.get('execution_time_ms')}ms")
        assert r.get("win_prob") is not None, "Missing win_prob"
        assert r.get("iteration_count") == 5000, "Wrong iteration count"
        print("\n=== ALL CHECKS PASSED ===")
    elif final_status == "FAILED":
        print(f"    ERROR: {result2.get('error_message')}")
        print("\n=== JOB FAILED ===")
    else:
        print(f"    Final status: {final_status}")
        print("\n=== TIMEOUT - worker may not have processed the job ===")
