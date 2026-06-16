import json
import subprocess
import sys

TESTER = r"""
import json, sys
sys.path.insert(0, '.')
from backend.main import app
from fastapi.testclient import TestClient
client = TestClient(app)

if sys.argv[1] == 'post':
    body = {"circuit_id": "monaco", "driver_id": "max-verstappen", "compound": "SOFT", "tyre_age": 12, "laps_remaining": 45}
    r = client.post('/api/v2/simulations/run', json=body)
    print(json.dumps(r.json()))
elif sys.argv[1] == 'get':
    jid = sys.argv[2]
    r = client.get(f'/api/v2/simulations/{jid}')
    print(json.dumps(r.json()))
"""

def run(cmd):
    r = subprocess.run(
        [sys.executable, '-c', TESTER] + cmd,
        capture_output=True, text=True,
        cwd='.',
        env={**__import__('os').environ, 'PYTHONPATH': '.'},
    )
    lines = [l for l in r.stdout.strip().split('\n') if l.startswith('{')]
    if lines:
        return json.loads(lines[-1])
    return {"error": r.stderr.strip()}

if __name__ == "__main__":
    # POST
    result = run(['post'])
    jid = result['job_id']
    print(f"POST /api/v2/simulations/run -> {result}")

    # GET
    result2 = run(['get', jid])
    print(f"GET /api/v2/simulations/{jid} -> {result2}")
