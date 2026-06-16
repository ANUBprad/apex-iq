"""Debug: check Celery task results in Redis."""
import redis, json
r = redis.from_url("redis://localhost:6379/0")
keys = r.keys("celery-task-meta-*")
print(f"{len(keys)} results")
for k in sorted(keys)[-5:]:
    val = r.get(k)
    d = json.loads(val.decode())
    rid = k.decode().split("-")[-1][:8]
    status = d.get("status", "?")
    result = d.get("result", {})
    if isinstance(result, dict):
        exc = result.get("exc_message", "")
    else:
        exc = str(result)[:200]
    print(f"  ...{rid}: status={status} err={exc}")
