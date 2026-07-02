<div align="center">

# APEXiq

### F1 AI Race Intelligence Platform

A full-stack Formula 1 race engineering platform that combines Monte Carlo simulation, historical data analysis, live telemetry, and AI-powered reasoning to deliver real-time pit wall strategy recommendations.

[![CI](https://github.com/anubhab-pradhan/apexiq/actions/workflows/ci.yml/badge.svg)](https://github.com/anubhab-pradhan/apexiq/actions)
[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://python.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Overview

APEXiq reconstructs the decision-making process of an F1 pit wall. Given a live race state — lap number, tyre compound, gaps to cars ahead and behind — the system produces:

- **Strategy calls** — ATTACK / PIT / DEFEND with confidence scores
- **Explainable reasoning** — per-factor confidence weighting, not black-box output
- **Monte Carlo simulations** — 1,000+ race outcome iterations
- **Historical context** — cross-referenced against 800+ races from 2000–2024
- **Live telemetry** — real-time car data with predictive analytics
- **AI Race Engineer** — conversational chat with context-aware recommendations

---

## Architecture

```mermaid
graph TB
    subgraph Frontend ["Frontend (React 19)"]
        MC[Mission Control]
        RC[Race Center]
        AI[AI Engineer]
        TL[Telemetry]
        SL[Strategy Lab]
        SIM[Simulation]
        AN[Analytics]
    end

    subgraph Backend ["Backend (FastAPI)"]
        API[REST API]
        MW[Middleware<br/>Logging + Timing]
        RAG[RAG Engine]
        MEM[Memory Store]
        SIM_ENG[Simulation Engine]
    end

    subgraph Data ["Data Layer"]
        CSV[Historical CSV<br/>800+ Races]
        TELE[Telemetry<br/>Simulator]
        CHROMA[ChromaDB<br/>Vector Store]
    end

    MC --> API
    RC --> API
    AI --> API
    TL --> API
    SL --> API
    SIM --> API
    AN --> API

    API --> MW
    MW --> RAG
    MW --> MEM
    MW --> SIM_ENG

    RAG --> CHROMA
    RAG --> CSV
    SIM_ENG --> CSV
    TELE --> API

    style Frontend fill:#0a0a0a,stroke:#1e1e1e,color:#fff
    style Backend fill:#0a0a0a,stroke:#1e1e1e,color:#fff
    style Data fill:#0a0a0a,stroke:#1e1e1e,color:#fff
```

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TanStack Router, Tailwind CSS v4, Framer Motion, Recharts |
| **Backend** | Python 3.12, FastAPI, Uvicorn, Pydantic |
| **Simulation** | Monte Carlo, NumPy, SciPy, Pandas |
| **ML** | Scikit-learn, XGBoost, SHAP |
| **RAG** | ChromaDB, Sentence Transformers |
| **Data** | 800+ historical races (CSV), live telemetry simulator |
| **Infrastructure** | Docker, Nginx, GitHub Actions CI/CD |

---

## Project Structure

```
apexiq/
├── frontend/                # React SSR application
│   ├── src/
│   │   ├── routes/          # File-based routing (11 pages)
│   │   ├── components/      # F1 design system + layout
│   │   ├── hooks/           # React Query hooks (40+)
│   │   └── lib/             # API client, utilities
│   └── package.json
├── backend/                 # FastAPI server
│   ├── api/                 # Route modules (V3 Intelligence, AI Engineer, Mission Control)
│   ├── app/api/v2/          # V2 Dashboard API
│   ├── services/            # Business logic (telemetry, strategy, data)
│   ├── intelligence/        # RAG, memory, embedding services
│   ├── middleware/           # API timing, structured logging
│   └── main.py              # Application entry point
├── ml/                      # ML models (strategy, tyre degradation)
├── simulation/              # Monte Carlo strategy simulator
├── data/                    # Historical race data (CSV)
├── docker/                  # Multi-stage Dockerfiles
├── deploy/                  # Nginx, Vercel, Railway configs
└── .github/workflows/       # CI/CD pipeline
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 22+
- npm 10+

### Quick Start

```bash
# Clone the repository
git clone https://github.com/anubhab-pradhan/apexiq.git
cd apexiq

# Backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Docker Deployment

```bash
# Start all services
docker compose up -d

# Verify health
curl http://localhost/health
```

---

## Environment Variables

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://apexiq:apexiq_pass@localhost:5432/apexiq` | PostgreSQL connection string |
| `CELERY_BROKER_URL` | `redis://localhost:6379/0` | Redis broker for Celery tasks |
| `CELERY_RESULT_BACKEND` | `redis://localhost:6379/0` | Redis backend for Celery results |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:80` | Comma-separated allowed origins |
| `LOG_LEVEL` | `info` | Logging level: debug, info, warning, error |
| `API_KEY` | (empty) | API key for authenticated endpoints |
| `GROQ_API_KEY` | (empty) | Groq API key for AI features |
| `ENVIRONMENT` | `development` | Environment name: development, staging, production |
| `WEIGHT_SIMULATION` | `0.25` | Intelligence weight for simulation |
| `WEIGHT_HISTORY` | `0.20` | Intelligence weight for historical data |
| `WEIGHT_MEMORY` | `0.20` | Intelligence weight for memory |
| `WEIGHT_ML` | `0.35` | Intelligence weight for ML models |

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://127.0.0.1:8000` | Backend API URL for development |
| `VITE_API_KEY` | (empty) | API key to include in requests |

### Docker Compose

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `apexiq` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `apexiq_pass` | PostgreSQL password |
| `POSTGRES_DB` | `apexiq` | PostgreSQL database name |
| `POSTGRES_PORT` | `5432` | PostgreSQL exposed port |
| `REDIS_PORT` | `6379` | Redis exposed port |
| `API_PORT` | `8000` | Backend API exposed port |
| `FRONTEND_PORT` | `3000` | Frontend exposed port |
| `NGINX_PORT` | `80` | Nginx exposed port |

### Production `.env` Example

```bash
# Database
POSTGRES_USER=apexiq
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=apexiq

# CORS (comma-separated origins)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# API Keys
API_KEY=<your-api-key>
GROQ_API_KEY=<your-groq-key>

# Logging
LOG_LEVEL=info
ENVIRONMENT=production

# Ports
API_PORT=8000
FRONTEND_PORT=3000
NGINX_PORT=80
```

> **Security:** Never commit `.env` files to version control. Use strong, unique passwords for production databases. Rotate API keys regularly. Use HTTPS in production.

---

## Pages

| Page | Description |
|------|-------------|
| **Mission Control** | Unified dashboard — live telemetry, AI recommendations, predictions, system health |
| **Race Center** | Real-time strategy recommendations with Monte Carlo simulation |
| **AI Engineer** | Conversational AI race engineer with context-aware chat |
| **Telemetry** | Live car telemetry with gauges, tyre visualization, ERS monitoring |
| **Strategy Lab** | Interactive strategy simulation with undercut/overcut analysis |
| **Simulation** | Monte Carlo race outcome distribution and scenario modeling |
| **Analytics** | Driver profiles, team DNA, pit stop analysis |
| **Knowledge** | Searchable F1 knowledge base with RAG-powered retrieval |
| **Memory** | Persistent strategy memory with outcome tracking |
| **Settings** | System configuration and preferences |

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check with uptime and version |
| `/status` | GET | API status and feature flags |
| `/metrics` | GET | Detailed metrics and endpoint listing |
| `/strategy` | POST | Primary strategy recommendation |
| `/simulate` | POST | Run race simulation |
| `/monte-carlo` | POST | Monte Carlo outcome distribution |
| `/race-outcome` | POST | Projected finish position |
| `/safety-car-analysis` | POST | Safety car impact analysis |
| `/rain-strategy` | POST | Rain crossover analysis |
| `/api/telemetry/live` | GET | Live telemetry snapshot |
| `/api/telemetry/history` | GET | Telemetry history buffer |
| `/api/ai-engineer/chat` | POST | AI engineer conversation |
| `/api/mission-control/snapshot` | GET | Aggregated dashboard data |
| `/api/v3/intelligence/query` | POST | RAG-powered intelligence query |
| `/api/v3/intelligence/memory/recall` | POST | Strategy memory recall |

### Request Example

```bash
curl -X POST http://localhost:8000/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "compound": "MEDIUM",
    "tyre_age": 15,
    "circuit": "Bahrain",
    "gap_ahead": 5.2,
    "gap_behind": 12.8,
    "lap_number": 30,
    "weather": "Dry"
  }'
```

### Response Example

```json
{
  "action": "PIT NOW",
  "confidence": 0.82,
  "reasoning": "Stay loss: 3.45s vs Pit loss: 22.00s. Undercut gain: 4.12s.",
  "optimal_pit_lap": 32,
  "fuel_status": "NEUTRAL",
  "traffic_status": "CLEAN AIR"
}
```

---

## Performance

| Metric | Target | Achieved |
|--------|--------|----------|
| API response time (lightweight) | < 200ms | ~50ms avg |
| API response time (simulation) | < 2s | ~1.2s avg |
| Frontend bundle (JS) | < 200KB gzip | 171KB |
| Frontend bundle (CSS) | < 15KB gzip | 11KB |
| Cold start (backend) | < 3s | ~1.9s |
| Monte Carlo iterations | 1,000+ | 1,000 |
| Historical races loaded | 800+ | 800+ |

### Intelligence Weights

The system combines multiple intelligence sources with configurable weights:

| Source | Weight | Description |
|--------|--------|-------------|
| ML Models | 0.35 | XGBoost-based win/podium predictions |
| Simulation | 0.25 | Monte Carlo race outcome modeling |
| History | 0.20 | Cross-referenced historical race data |
| Memory | 0.20 | Persistent strategy outcome tracking |

---

## Observability

### Health Check Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Full health status with uptime and version |
| `GET /status` | API status and feature flags |
| `GET /metrics` | Detailed metrics, endpoint listing, and timing |

### Logging

Structured JSON logging with request timing middleware. All API requests are logged with:
- Method, path, status code
- Response time (ms)
- Request ID for tracing

### Monitoring Commands

```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f api

# View last 100 lines
docker compose logs --tail=100 api
```

---

## Deployment

### Pre-Deployment Checklist

- [ ] All tests passing (`pytest tests/ -v`)
- [ ] Frontend lint clean (`cd frontend && npm run lint`)
- [ ] Frontend build successful (`cd frontend && npm run build`)
- [ ] Backend import verified (`python -c "from backend.main import app"`)
- [ ] Environment variables configured in `.env`
- [ ] Strong database password set
- [ ] CORS origins configured for production domain
- [ ] API keys generated and secured

### Docker Deployment

```bash
# 1. Clone and configure
git clone https://github.com/anubhab-pradhan/apexiq.git
cd apexiq
cp .env.example .env  # Edit with production values

# 2. Build and start
docker compose build
docker compose up -d

# 3. Verify
docker compose ps
curl http://localhost/health
```

### Cloud Options

| Option | Services | Notes |
|--------|----------|-------|
| **Docker Compose (VPS)** | All-in-one | Ubuntu 22.04+ with Docker |
| **Railway** | Backend + DB | Auto-deploy on push |
| **Vercel + Railway** | Frontend + Backend | Split deployment |

### SSL/HTTPS

- **Certbot:** `sudo certbot certonly --standalone -d yourdomain.com`
- **Cloudflare:** Add domain, enable proxy, set SSL to Full (Strict)

### Post-Deployment Verification

- [ ] Frontend loads at `https://yourdomain.com`
- [ ] Backend API responds at `https://yourdomain.com/health`
- [ ] Mission Control page loads with live data
- [ ] Strategy Lab simulation runs successfully
- [ ] AI Engineer chat responds
- [ ] No 5xx errors in logs
- [ ] Response times < 500ms for API calls

### Rollback

```bash
docker compose down
git checkout <previous-commit>
docker compose build
docker compose up -d
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **API won't start** | Check database: `docker compose exec api python -c "import psycopg2; psycopg2.connect('${DATABASE_URL}')"` |
| **Frontend can't reach API** | Verify `CORS_ORIGINS` includes frontend URL; check nginx config |
| **Slow first request** | Normal — SentenceTransformer model loads lazily on first RAG query (~30s cold start) |
| **High memory usage** | Reduce Celery workers: `--concurrency=1`; check for leaks |
| **ChromaDB errors** | Ensure `data/chroma_db/` directory is writable; delete and restart if corrupted |

---

## Roadmap

### Completed

- [x] Phase 12 — Documentation & Portfolio
- [x] Phase 13 — Advanced Analytics
- [x] Phase 14 — Machine Learning & Embedding Abstraction

### Planned

- [ ] Phase 15 — Live Data Integration (FastF1 live sessions, WebSocket streaming)
- [ ] Phase 16 — Collaboration (multi-user, shared workspaces)
- [ ] Mobile application (React Native)
- [ ] Browser extension for live races
- [ ] Integration with F1 official APIs

### Architecture Goals

- Maintain stateless backend design
- Keep CSV-based historical data for simplicity
- Preserve Monte Carlo over ML for simulation accuracy
- Ensure 60fps frontend performance
- Support offline-first with service workers

---

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## Author

**Anubhab Pradhan**

Built with passion for Formula 1 and engineering.

If you find this interesting, a star on the repo goes a long way.
