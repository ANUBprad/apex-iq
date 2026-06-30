# Security

## Authentication

V3 endpoints support optional API key authentication via `X-API-Key` header.

- Set `APEXIQ_API_KEY` environment variable to enable
- All POST endpoints (`/query`, `/recommend`) require auth when enabled
- All GET endpoints (`/memory/recall`, `/memory/{circuit}`) require auth when enabled
- `/health` and `/metrics` endpoints remain public

## Rate Limiting

- 60 requests per minute per IP address
- Applied via `_rate_limit` dependency on all authenticated endpoints
- Returns 429 when exceeded

## Input Validation

- Pydantic models validate request shape and types
- Circuit names validated against known circuits list
- Weather restricted to `dry|wet|mixed` via regex
- Query and circuit lengths bounded (500 and 100 chars)

## Audit Logging

- All requests logged via Python `logging.getLogger("apexiq.intelligence")`
- Logs include: IP, status (success/error), path, detail message
- Accessible via standard log aggregation

## Secure Defaults

- No secrets stored in repository
- API key read from environment only
- ChromaDB telemetry disabled (`anonymized_telemetry=False`)
- No hardcoded credentials

## Recommendations

For production deployment:
1. Use HTTPS with a reverse proxy (nginx, Traefik)
2. Set `APEXIQ_API_KEY` to a strong random value
3. Configure log rotation for audit logs
4. Use a process manager (systemd, supervisor)
5. Consider WAF rate limiting for additional protection
