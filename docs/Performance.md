# Performance

## Targets

| Metric | Target | Current |
|--------|--------|---------|
| First response (cold) | <2s | ~3s (includes embedding load + ChromaDB index) |
| First response (warm) | <2s | ~2s |
| Repeated response | <500ms | ~10ms (LRU cache hit) |
| Evaluation suite avg | <3s | 1.84s |

## Caching

- **In-memory LRU cache**: 128 entries, SHA-256 keyed on `{query}|{circuit}|{laps}|{weather}|{include_explainability}`
- **Startup warmup**: Embedding model loaded at app start (not first request)
- **Document indexing**: ChromaDB persists to disk; only indexed once unless reset

## Bottlenecks

1. **Monte Carlo simulation**: 3 compounds × ~5 pit windows × 200 iterations = ~3000 simulations per query (~1.5s)
2. **ChromaDB query**: ~100ms per semantic search
3. **Embedding generation**: ~200ms per batch

## Optimization Notes

- `RLock` used for thread-safe singleton access (vector store, memory store)
- `upsert` logic avoids duplicate embeddings
- Cache bypasses pipeline entirely on repeated identical queries
- Evaluation suite avg dropped from 9.23s → 1.84s after cache + warmup
