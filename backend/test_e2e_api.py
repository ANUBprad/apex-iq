"""E2E API test: POST simulation job, wait, GET result."""
import requests
import json
import time

BASE = "http://127.0.0.1:8000"

resp = requests.post(f"{BASE}/api/v2/simulations/run", json={
    "circuit_id": "monaco",
    "driver_id": "charles-leclerc",
    "compound": "SOFT",
    "tyre_age": 5,
    "laps_remaining": 30,
    "gap_ahead": 1.2,
    "gap_behind": 0.8,
    "base_position": 3,
    "iterations": 5000,
})
print("POST status:", resp.status_code)
data = resp.json()
print("Response:", json.dumps(data, indent=2))
job_id = data["job_id"]

for i in range(30):
    time.sleep(2)
    resp = requests.get(f"{BASE}/api/v2/simulations/{job_id}")
    d = resp.json()
    st = d["status"]
    print(f"  [{i*2}s] status={st}")
    if st in ("COMPLETED", "FAILED"):
        print(json.dumps(d, indent=2, default=str))
        break
else:
    print("TIMEOUT")
