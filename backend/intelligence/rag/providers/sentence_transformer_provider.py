"""SentenceTransformer embedding provider.

This is the default provider.  The model is loaded lazily on first use
and protected by a lock so that concurrent requests never trigger
duplicate initialization.
"""

import time
import threading
import logging
from typing import List

from backend.intelligence.rag.providers.base import EmbeddingProvider
from backend.intelligence.config import EMBEDDING_MODEL

logger = logging.getLogger("apexiq.embedding.st")


class SentenceTransformerProvider(EmbeddingProvider):
    """Embedding provider backed by ``sentence-transformers``."""

    def __init__(self, model_name: str = EMBEDDING_MODEL):
        self._model_name = model_name
        self._model = None
        self._lock = threading.Lock()
        self._dim: int = 0

    # ── public interface ──────────────────────────────────────────────

    def name(self) -> str:
        return "sentence_transformers"

    def dimension(self) -> int:
        if self._dim == 0:
            self._ensure_loaded()
        return self._dim

    def embed_text(self, text: str) -> List[float]:
        return self._ensure_loaded().encode(text).tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return self._ensure_loaded().encode(texts).tolist()

    # ── internals ─────────────────────────────────────────────────────

    def _ensure_loaded(self):
        if self._model is not None:
            return self._model
        with self._lock:
            if self._model is not None:
                return self._model

            _t0 = time.perf_counter()

            logger.info(
                "Loading SentenceTransformer model '%s' (first request) ...",
                self._model_name,
            )
            from sentence_transformers import SentenceTransformer
            _t_import = time.perf_counter()
            logger.info(
                "  import sentence_transformers: %.1f ms",
                (_t_import - _t0) * 1000,
            )

            self._model = SentenceTransformer(self._model_name)
            _t_construct = time.perf_counter()
            logger.info(
                "  SentenceTransformer(...):     %.1f ms",
                (_t_construct - _t_import) * 1000,
            )

            embedding = self._model.encode(["warmup"])[0]
            _t_encode = time.perf_counter()
            self._dim = len(embedding)
            logger.info(
                "  first encode() (warmup):      %.1f ms  (dim=%d)",
                (_t_encode - _t_construct) * 1000,
                self._dim,
            )

            logger.info(
                "SentenceTransformer loaded. TOTAL: %.1f ms",
                (_t_encode - _t0) * 1000,
            )
            return self._model
