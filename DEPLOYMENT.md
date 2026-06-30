# Deployment Guide

## Architecture

```
                         ┌──────────┐
                         │  Nginx   │  :80 (reverse proxy)
                         └────┬─────┘
                     ┌────────┴────────┐
                     ▼                 ▼
              ┌──────────┐     ┌──────────┐
              │ Frontend │     │   API    │
              │  :3000   │     │  :8000   │
              │ React SSR│     │  FastAPI │
              └──────────┘     └────┬─────┘
                           ┌───────┴───────┐
                           ▼               ▼
                    ┌──────────┐     ┌──────────┐
                    │    DB    │     │  Redis   │
                    │PostgreSQL│     │  Cache   │
                    └──────────┘     └──────────┘
```

---

## Quick Start (Docker Compose)

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down

# Stop and remove volumes (wipes DB)
docker compose down -v
```

### Environment Variables

Create `.env` in project root to override defaults:

```env
POSTGRES_USER=apexiq
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=apexiq
DATABASE_URL=postgresql+asyncpg://apexiq:your_secure_password@db:5432/apexiq
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
LOG_LEVEL=info
```

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_USER` | `apexiq` | DB user |
| `POSTGRES_PASSWORD` | `apexiq_pass` | DB password |
| `POSTGRES_DB` | `apexiq` | DB name |
| `POSTGRES_PORT` | `5432` | DB host port |
| `REDIS_PORT` | `6379` | Redis host port |
| `API_PORT` | `8000` | API host port |
| `FRONTEND_PORT` | `3000` | Frontend host port |
| `NGINX_PORT` | `80` | Nginx host port |
| `DATABASE_URL` | `postgresql+asyncpg://apexiq:apexiq_pass@db:5432/apexiq` | Full connection string |
| `CELERY_BROKER_URL` | `redis://redis:6379/0` | Celery broker |
| `CELERY_RESULT_BACKEND` | `redis://redis:6379/0` | Celery backend |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:8000` | Allowed CORS origins |
| `LOG_LEVEL` | `info` | Backend log level |

---

## Local Development (without Docker)

```bash
# Terminal 1: Backend
cd backend
pip install -r ../requirements.txt
uvicorn backend.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

---

## Production Build

### Frontend (standalone)

```bash
cd frontend
npm ci
npm run build
node dist/server/server.js
```

### Backend (standalone)

```bash
docker build -t apexiq-backend -f docker/backend.Dockerfile .
docker run -p 8000:8000 apexiq-backend
```

---

## Vercel Deploy (Frontend)

```bash
cd frontend
npm ci
npm run build
npx vercel --prod
```

Vercel config: `deploy/vercel.json`

### Environment Variables
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API URL | `http://127.0.0.1:8000` |

---

## Railway Deploy (Backend)

- Connect GitHub repo to Railway
- Railway auto-detects `docker/backend.Dockerfile`
- Set `PORT=8000` in Railway environment variables
- Health check: `/health`

Railway config: `deploy/railway.toml`

---

## Docker Builds

### Frontend Dockerfile
- Multi-stage: `node:22-alpine`
- Stage 1 instals deps and runs `npm run build`
- Stage 2 serves via `node dist/server/server.js`
- Location: `docker/frontend.Dockerfile`

### Backend Dockerfile
- Single stage: `python:3.12-slim`
- Instals system deps (build-essential, libpq-dev)
- Location: `docker/backend.Dockerfile`

---

## Nginx Reverse Proxy

When using Docker Compose, Nginx routes:
- `/` → Frontend (port 3000)
- `/api/` → Backend (port 8000)
- `/health` → Backend health check

Config: `deploy/nginx.conf`

---

## CI/CD

GitHub Actions workflow at `.github/workflows/ci.yml`:

### On push/PR to `main`:

1. **Frontend job**: `npm ci` → `npm run lint` → `tsc --noEmit` → `npm run build`
2. **Backend job**: `pip install` → `ruff check` → `pytest`

### Deployment (requires platform integration):
- Vercel: auto-deploys frontend from `main`
- Railway: auto-deploys backend from `main` via Dockerfile
- Docker Compose: manual deploy on VPS/cloud VM
