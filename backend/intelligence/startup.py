"""Lazy AI initializer — runs once on first use, not at startup.

Thread-safe: if N requests arrive simultaneously, only one performs
initialization.  The others block until it completes.
"""

import logging
import threading
import time

logger = logging.getLogger("apexiq.startup")

_init_lock = threading.Lock()
_initialized = False


def ensure_ai_initialized() -> None:
    """Block until AI subsystem is ready.  No-op if already initialized."""
    global _initialized
    if _initialized:
        return
    with _init_lock:
        if _initialized:
            return
        _do_initialize()
        _initialized = True


def _do_initialize() -> None:
    """Perform the actual (slow) initialization."""
    from backend.intelligence.ai_state import ai_state

    ai_state.mark_loading()
    logger.info("AI initialization started")

    try:
        _t0 = time.perf_counter()

        from backend.intelligence.rag.embedding_service import embed_text
        embed_text("warmup")

        _t1 = time.perf_counter()
        logger.info(
            "SentenceTransformer loaded and warmup complete (%.1f ms)",
            (_t1 - _t0) * 1000,
        )

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

        from backend.intelligence.rag.retriever import ensure_indexed
        ensure_indexed()
        _t3 = time.perf_counter()
        logger.info(
            "Documents indexed (rag=%d, memory=%d) (%.1f ms)",
            collection_size(),
            memory_count(),
            (_t3 - _t2) * 1000,
        )

        ai_state.mark_ready(indexed=True)
        logger.info(
            "AI Ready (%.1f ms total)",
            (_t3 - _t0) * 1000,
        )

    except Exception:
        logger.exception("AI initialization failed")
        ai_state.mark_error("AI initialization failed — see logs for details")
