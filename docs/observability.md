# Observability

## Health Check

**`GET /health`**

```json
{
  "status": "healthy",
  "version": "4.5.0",
  "build": "2025-Q2",
  "timestamp": "2025-06-20T12:00:00Z",
  "uptime_seconds": null
}
```

Returns service health. Status is `"healthy"` when the API is reachable. Uptime tracking is available via `/metrics`.

---

## Version Info

**`GET /version`**

```json
{
  "version": "4.5.0",
  "build": "2025-Q2",
  "name": "APEXiq Strategy OS",
  "description": "Real-time F1 strategy intelligence engine",
  "python_version": "3.12.4"
}
```

Returns build metadata, app name, and the Python runtime version.

---

## Metrics

**`GET /metrics`**

```json
{
  "uptime_seconds": 1234.56,
  "version": "4.5.0",
  "build": "2025-Q2",
  "python_version": "3.12.4",
  "endpoints": ["/health", "/version", "/metrics", ...],
  "memory_mb": null
}
```

Returns uptime (seconds since server start), version info, a list of registered endpoints, and memory usage (when available).

---

## Endpoint Summary

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | Service health + version |
| `/version` | GET | Build metadata |
| `/metrics` | GET | Uptime, endpoint list, runtime info |
| `/strategy` | POST | Primary strategy recommendation |
| `/simulate` | POST | Stay-out vs. pit simulation |
| `/strategy-comparison` | POST | Multi-compound comparison |
| `/monte-carlo` | POST | Monte Carlo outcome distribution |
| `/race-outcome` | POST | Projected finish position |
| `/safety-car-analysis` | POST | Safety car impact |
| `/rain-strategy` | POST | Rain crossover analysis |
| `/replay-intelligence/{lap}/{total}` | GET | Lap replay insights |
| `/api/v2/dashboard/aggregate` | POST | Full dashboard aggregation |
| `/api/v2/simulations/run` | POST | Simulation engine run |

---

## Logging

The backend uses standard Python `print()` for request logging. Log level can be configured via the `LOG_LEVEL` environment variable (`info`, `debug`, `warning`, `error`).
