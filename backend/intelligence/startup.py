"""Background AI initializer — runs once at server startup.

Performs:
  1. SentenceTransformer model load + warmup
  2. ChromaDB collection init
  3. Document indexing (embed + store)

Updates ``ai_state`` throughout so the health endpoint can report
progress without doing any work itself.
"""

import logging
import time

logger = logging.getLogger("apexiq.startup")


def initialize_ai() -> None:
    """Blocking call — run inside a background thread at startup."""
    from backend.intelligence.ai_state import ai_state

    ai_state.mark_loading()
    logger.info("AI initialization started")

    try:
        # ── 1. Load SentenceTransformer ──────────────────────────────
        _t0 = time.perf_counter()

        from backend.intelligence.rag.embedding_service import embed_text  # noqa: F401

        # Force provider singleton + model load by embedding a warmup token.
        # embed_text internally calls get_provider() → SentenceTransformerProvider
        # → _ensure_loaded() which does the actual import + construct + encode.
        embed_text("warmup")

        _t1 = time.perf_counter()
        logger.info(
            "SentenceTransformer loaded and warmup complete (%.1f ms)",
            (_t1 - _t0) * 1000,
        )

        # ── 2. Initialize ChromaDB collections ───────────────────────
        from backend.intelligence.rag.vector_store import (
            _get_collection as _get_rag_collection,
            collection_size,
        )
        from backend.intelligence.memory.memory_store import (
            _get_collection as _get_mem_collection,
            memory_count,
        )

        _get_rag_collection()
        _get_mem_collection()
        _t2 = time.perf_counter()
        logger.info(
            "ChromaDB collections initialized (%.1f ms)",
            (_t2 - _t1) * 1000,
        )

        # ── 3. Index documents (ensure_indexed) ─────────────────────
        from backend.intelligence.rag.retriever import ensure_indexed

        ensure_indexed()
        _t3 = time.perf_counter()
        logger.info(
            "Documents indexed (rag=%d, memory=%d) (%.1f ms)",
            collection_size(),
            memory_count(),
            (_t3 - _t2) * 1000,
        )

        # ── Done ─────────────────────────────────────────────────────
        ai_state.mark_ready(indexed=True)
        logger.info(
            "AI Ready (%.1f ms total)",
            (_t3 - _t0) * 1000,
        )

    except Exception:
        logger.exception("AI initialization failed")
        ai_state.mark_error("AI initialization failed — see logs for details")
