# V3 Intelligence API

Base URL: `/api/v3/intelligence`

Authentication: `X-API-Key` header (optional, set via `APEXIQ_API_KEY` env)

Rate limit: 60 requests/minute per IP

## Endpoints

### POST /query
Full intelligence query with RAG + simulation + history + telemetry + risk + fusion.

**Request:**
```json
{
  "query": "Best strategy for Monaco",
  "circuit": "Monaco",
  "total_laps": 78,
  "weather": "dry",
  "include_explainability": true
}
```

### POST /recommend
Quick recommendation (auto-generates query).

**Request:**
```json
{
  "circuit": "Monaco",
  "total_laps": 78,
  "weather": "dry",
  "include_explainability": true
}
```

### GET /memory/recall
Recall past recommendations. Query params: `query` (required), `circuit` (optional).

### GET /memory/{circuit}
Get circuit-specific memory history.

### GET /health
Health check with RAG/memory stats.

### GET /metrics
Pipeline metrics (documents indexed, memory entries).

## Response Schema

```json
{
  "status": "success|partial|error",
  "recommendation": { ... },
  "confidence": { "overall_score": 0.0-1.0, "level": "low|medium|high|very_high", ... },
  "trust_score": { ... },
  "explanation": { "reasoning_steps": 6, "evidence_items": 3, ... },
  "memory_id": "str",
  "errors": []
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Invalid input (circuit validation, query too short/long) |
| 401 | Invalid or missing API key |
| 429 | Rate limit exceeded |
| 500 | Internal pipeline error |
