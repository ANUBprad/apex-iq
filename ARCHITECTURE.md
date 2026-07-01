# APEXiq Architecture

## System Overview

APEXiq is a full-stack F1 strategy intelligence platform. Race data is ingested via FastF1, processed through a Monte Carlo simulation engine, cross-referenced against historical race data, and fused into actionable strategy recommendations served through a React frontend.

```
FastF1 → Cache → Simulation → Historical → Intelligence → API → React UI
```

---

## Data Flow

1. **Ingestion**: FastF1 fetches live timing, telemetry, weather, and track status.
2. **Cache**: Redis-backed cache layer for low-latency access during simulation.
3. **Simulation**: Monte Carlo engine (10,000 iterations) models tyre degradation, traffic, safety cars, and weather transitions.
4. **Historical Memory**: CSV-based database of 800+ races (2000–2024) with weighted cosine similarity matching.
5. **Intelligence Layer**: Ensemble fusion of simulation, history, and telemetry signals with confidence weighting.
6. **API**: FastAPI REST layer (sync endpoints, Pydantic schemas).
7. **Frontend**: React 19 SPA with TanStack Router, Recharts, Framer Motion.

---

## Key Design Decisions

- **Stateless backend**: Each analysis run is stateless. No persistent database required for core functionality.
- **CSV-based historical data**: ~5 MB compressed. Loaded into memory at startup. No DB dependency.
- **Sync API**: All endpoints are synchronous. Async DB was removed in favor of simplicity.
- **Monte Carlo over ML**: For race simulation, stochastic sampling beats ML predictions for edge cases (safety cars, weather changes).
- **Frontend SSR**: Vinxi/TanStack Start enables SSR for the frontend, deployed on Vercel's edge network.

---

## Module Map

| Directory | Purpose |
|---|---|
| `frontend/` | React SPA with TanStack Router, Recharts, Framer Motion |
| `backend/` | FastAPI server with REST endpoints |
| `simulation/` | Monte Carlo strategy simulator (Python) |
| `ml/` | ML models: strategy engine, tyre model, feature engineering |
| `agents/` | AI Race Engineer agent (explainability/reasoning layer) |
| `data/` | Historical race data (CSV) for memory matching |
| `deploy/` | Vercel, Railway, and environment configuration |
