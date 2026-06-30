# Developer Guide

## Setup

```bash
pip install -r requirements.txt
cd backend
uvicorn main:app --reload
```

## Project Structure

```
backend/
  intelligence/              # Phase 7 V3 layer
    rag/                    # RAG pipeline
    agents/                 # Multi-agent system
    orchestrator/           # LangGraph workflow
    confidence/             # Confidence engine
    memory/                 # Strategy memory
    explainability/         # Reasoning & evidence
    config.py               # Centralized configuration
  api/intelligence.py       # V3 API endpoints
  main.py                   # FastAPI app entry point
tests/intelligence/         # 76 tests (62 unit + 14 API)
benchmarks/                 # Evaluation suite & benchmark runner
docs/                       # Documentation
```

## Running Tests

```bash
# All intelligence tests
pytest tests/intelligence/

# Specific module
pytest tests/intelligence/test_rag.py -v

# API integration tests
pytest tests/intelligence/test_api.py -v

# Evaluation suite (6 test cases)
python -c "from benchmarks.evaluation_suite import run_evaluation_suite; run_evaluation_suite()"

# Coverage
pytest tests/intelligence/ --cov=backend.intelligence --cov-report=term
```

## Adding a New Agent

1. Create file in `backend/intelligence/agents/`
2. Implement the agent function
3. Add node function in `orchestrator/nodes.py`
4. Register node in `orchestrator/graph.py`
5. Add tests in `tests/intelligence/`

## Conventions

- No TODO placeholders or mock implementations
- All confidence values must come from `compute_confidence()`
- V1/V2 routes must remain untouched
- Frontend is frozen after Phase 6
- Uses `RLock` for thread-safe singletons
- Cache keys include all query parameters
