"""Provider factory — selects the active embedding backend.

The provider is chosen via the ``EMBEDDING_PROVIDER`` environment variable.
Valid values:

* ``sentence_transformers`` (default)

The provider is instantiated once and cached for the process lifetime.
"""

import os
import logging
import threading
from typing import Optional

from backend.intelligence.rag.providers.base import EmbeddingProvider

logger = logging.getLogger("apexiq.embedding.factory")

_PROVIDER_NAME = os.getenv("EMBEDDING_PROVIDER", "sentence_transformers")

_instance: Optional[EmbeddingProvider] = None
_lock = threading.Lock()


def get_provider() -> EmbeddingProvider:
    """Return the singleton :class:`EmbeddingProvider` for this process."""
    global _instance
    if _instance is not None:
        return _instance
    with _lock:
        if _instance is not None:
            return _instance

        if _PROVIDER_NAME == "sentence_transformers":
            from backend.intelligence.rag.providers.sentence_transformer_provider import (
                SentenceTransformerProvider,
            )
            _instance = SentenceTransformerProvider()
        else:
            raise ValueError(
                f"Unknown EMBEDDING_PROVIDER={_PROVIDER_NAME!r}. "
                "Valid values: sentence_transformers"
            )

        logger.info("Embedding provider: %s", _instance.name())
        return _instance
