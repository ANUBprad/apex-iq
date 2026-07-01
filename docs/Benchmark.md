# Benchmark Results

## Evaluation Suite (6 Cases)

| Circuit | Query | Time | Result |
|---------|-------|------|--------|
| Monaco | Best strategy for Monaco | 2.85s | PASS |
| Silverstone | Compare soft vs medium | 1.52s | PASS |
| Spa | Risk assessment for wet | 1.70s | PASS |
| Bahrain | What if safety car at lap 15 | 1.77s | PASS |
| Singapore | Historical trends | 1.53s | PASS |
| Monza | Best pit window for hard | 1.66s | PASS |

**Average: 1.84s**

## Test Suite

| Module | Tests | Status |
|--------|-------|--------|
| `test_rag.py` | 20 | PASS |
| `test_agents.py` | 12 | PASS |
| `test_memory.py` | 9 | PASS |
| `test_confidence.py` | 9 | PASS |
| `test_orchestrator.py` | 12 | PASS |
| `test_explainability.py` | 6 | PASS |
| `test_api.py` | 14 | PASS |
| **Total** | **76** | **100%** |

## Performance History

| Phase | Avg Query Time | Notes |
|-------|---------------|-------|
| Initial | 9.23s | No cache, cold model |
| After warmup + cache | 4.19s | Embedding model cached |
| After LRU cache | 1.84s | Repeated queries <10ms |

## Benchmark Runner

```bash
python benchmarks/benchmark_runner.py
```

Runs evaluation suite and reports timing statistics.
