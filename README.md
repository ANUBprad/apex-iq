# APEXiq — F1 AI Race Engineer

I've always been fascinated by the moment a race engineer says "box, box" — and the entire race pivots on that call. This project is my attempt to understand (and rebuild) that decision-making process from the ground up.

It started as a curiosity. It became a full-stack web platform that analyzes real telemetry via FastF1, runs Monte Carlo simulations, cross-references historical race data, and delivers AI-powered strategy recommendations — the way an actual pit wall would.

---

## What does it actually do?

Given a live race state — lap number, tyre compound, gaps to cars ahead and behind — the system produces:

- **A strategy call** → ATTACK / PIT / DEFEND
- **A confidence score** with per-factor explainability
- **Engineer-style reasoning** — not generic AI output, but something that sounds like it came from someone who's watched 500 hours of F1

### Mission Control Dashboard
Real-time AI race engineer with KPI cards, recommendation panel, reasoning chain timeline, and strategy memory.

### Simulation Lab
Run race strategy, undercut calculator, and pit loss comparison simulations through the Monte Carlo engine.

### Telemetry Center
Live telemetry feed with replay intelligence, pit window analysis, risk attribution, and strategic deltas.

### Architecture Center
Full system architecture documentation — data flow, simulation engine, ML pipeline, and deployment topology.

---

## Tech Stack

| Area | Tools |
|---|---|
| Frontend | React 19, TanStack Router, Tailwind CSS v4, Recharts, Framer Motion, Vinxi SSR |
| Backend | Python 3.12, FastAPI, Uvicorn |
| Simulation | Monte Carlo, NumPy, SciPy, Pandas |
| ML | Scikit-learn, XGBoost, SHAP |
| F1 Data | FastF1 |
| Historical Data | Pandas (CSV-based, 800+ races) |
| Deploy | Docker, Vercel (frontend), Railway (backend), GitHub Actions |

---

## Project Structure

```
apexiq/
├── frontend/           # React SPA (TanStack Router + Vite)
│   └── src/
│       ├── components/ # Dashboard, simulations, telemetry, layout, ui
│       ├── hooks/      # useStrategy, useSimulation, useUnifiedDashboard
│       ├── lib/        # API client, mappers, data, utilities
│       ├── routes/     # File-based routing (TanStack Router)
│       └── api/        # V2 API client modules
├── backend/            # FastAPI server
│   ├── app/            # Domain-driven API modules
│   ├── services/       # Legacy service layer
│   └── main.py         # App entry point + route definitions
├── simulation/         # Monte Carlo strategy simulator
├── ml/                 # ML models (strategy engine, tyre model, feature engineering)
├── agents/             # Race Engineer agent (AI reasoning layer)
├── data/               # Historical training data (CSV)
├── docker/             # Dockerfile for backend
├── deploy/             # Vercel, Railway, env configs
└── .github/workflows/  # CI/CD pipeline
```

---

## Running it locally

### Backend
```bash
cd backend
pip install -r ../requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000.

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check + version info |
| `/version` | GET | Build version and metadata |
| `/strategy` | POST | Primary strategy recommendation |
| `/simulate` | POST | Run simulation |
| `/strategy-comparison` | POST | Compare strategy compounds |
| `/monte-carlo` | POST | Monte Carlo outcome distribution |
| `/race-outcome` | POST | Projected finish position |
| `/safety-car-analysis` | POST | Safety car impact analysis |
| `/rain-strategy` | POST | Rain crossover analysis |
| `/replay-intelligence/{lap}/{total}` | GET | Lap replay insights |
| `/api/v2/dashboard/aggregate` | POST | Full dashboard aggregation |

---

## Deployment

```bash
# Backend (Docker)
docker build -t apexiq-backend -f docker/backend.Dockerfile .
docker run -p 8000:8000 apexiq-backend

# Frontend (Vercel)
cd frontend && npm run build
# Deploy via Vercel CLI or GitHub Actions
```

See `deploy/` for Vercel, Railway, and environment configs.

---

## The bigger picture

F1 strategy is one of the few domains where decisions worth millions of dollars get made in seconds, with incomplete information, under enormous pressure. 

This project is an attempt to formalize that process — combining data engineering, machine learning, simulation, and AI reasoning into something that actually thinks about races the way engineers do.

It's still a work in progress. But it's the most fun I've had building anything.

---

**Anubhab Pradhan**

---

*If this is the kind of thing you find interesting, a star on the repo goes a long way ⭐*