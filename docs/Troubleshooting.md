# Troubleshooting

## Common Issues

### "No module named 'backend.intelligence'"
Set `PYTHONPATH` to project root:
```bash
export PYTHONPATH=/path/to/APEXiq
```

### ChromaDB "No Such Collection"
Auto-created on first use. Check `data/chroma_db/` and `data/chroma_memory/` exist.

### Slow First Request
Expected. Embedding model loads on startup, ChromaDB indexes ~800 docs on first query. Subsequent requests use cache.

### Memory Test Hangs
Check for lock contention. `memory_store.py` uses `RLock` for thread safety — ensure no `Lock` is used in nested calls.

### "Invalid circuit" Error
V3 validates circuits against `_KNOWN_CIRCUITS`. Add new circuits to `data/circuits.json`.

### API Returns 401
If `APEXIQ_API_KEY` is set, all V3 POST/GET endpoints require `X-API-Key` header.

### API Returns 429
Rate limit (60 req/min/IP) exceeded. Wait or reduce request frequency.

## Debugging

```bash
# Enable debug logging
export APEXIQ_DEBUG=1

# Test pipeline directly
python -c "
from backend.intelligence.orchestrator.graph import run_intelligence_pipeline
result = run_intelligence_pipeline('Best strategy for Monaco', 'Monaco')
print(result['recommendation']['recommendation']['strategy'])
"
```
