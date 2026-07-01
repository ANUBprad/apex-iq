# Architecture

## System Overview

APEXiq is an F1 Strategy Intelligence OS with three layers:

```
Frontend (React/TypeScript) → Backend API (FastAPI) → Intelligence Layer (Python)
                                                           ├── V1/V2 (legacy)
                                                           └── V3 (Phase 7)
```

## V3 Intelligence Layer

```
Query → RAG Node → [Simulate, Historical, Telemetry] → Sync → Risk → Fusion → Recommendation
         │              │           │           │         │      │        │
         │              └→ Monte    ├→ Pattern  ├→ Lap    ├→ Barrier ├→ Multi │
         │                 Carlo   │   Match   │   Anal. │          │  Factor│
         │                         │           │         │          │        │
         └→ ChromaDB +            └→ RAG      └→ Tyre   └→ Sync    └→ Strat.
            sentence-transformers               Temp        Gate      Agent
```

### Components

| Module | Purpose |
|--------|---------|
| `rag/` | Document loading, embeddings (sentence-transformers), ChromaDB vector store, hybrid retrieval, reranking, context building with quality scoring |
| `agents/` | Simulation (Monte Carlo v2), telemetry analysis, historical pattern matching, risk assessment, strategy fusion |
| `orchestrator/` | LangGraph StateGraph pipeline with 7 nodes and synchronization barrier |
| `confidence/` | Weighted multi-signal confidence scoring, dynamic weight allocation, trust scoring with error decay |
| `memory/` | ChromaDB-based persistent strategy memory with TTL (365d), max size (10k), UUID keys, and recency+outcome-boosted ranking |
| `explainability/` | Reasoning chain builder, evidence aggregator, decision summary generator |

### Key Design Decisions

- **V1/V2 isolation**: V3 builds independently on V1/V2 without modifying legacy routes
- **LangGraph barrier**: `sync` node ensures `fusion` runs exactly once after all parallel branches complete
- **Telemetry flag**: Simulated telemetry explicitly flagged; confidence engine penalizes simulated data by 0.05
- **Strategy ranking**: Expected finish primary key, risk secondary — prioritizes competitiveness
- **Simulation v2**: Nonlinear tyre degradation with cliff, fuel burn, DRS, dirty air, VSC, weather evolution, deterministic seed support
