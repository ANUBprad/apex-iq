# Deployment Guide

## Prerequisites

- Python 3.12+
- ChromaDB (SQLite-backed, no external DB needed)
- 2GB+ RAM (embedding model ~90MB + ChromaDB)

## Quick Start

```bash
git clone <repo>
cd APEXiq
pip install -r requirements.txt
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APEXIQ_API_KEY` | API key for V3 endpoints | (none, auth disabled) |
| `PYTHONPATH` | Must include project root | `.` |

## Production

```bash
# Using uvicorn with workers
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4

# Using gunicorn (Linux)
gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Startup Sequence

1. FastAPI app initializes
2. `startup_warmup()` loads sentence-transformers model eagerly
3. First `/query` call triggers ChromaDB indexing (~800 docs)
4. Subsequent calls use LRU cache (128 entries)

## Data Dependencies

- `data/circuits.json`: Circuit parameters (10 circuits with pit loss, degradation, etc.)
- `data/training_data.csv`: Historical race data (~800+ rows)
- `data/chroma_db/`: Auto-created vector store
- `data/chroma_memory/`: Auto-created memory store

## Health Check

```
GET /api/v3/intelligence/health
GET /health
```
