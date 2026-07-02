"""Embedding service — thin facade over the pluggable provider.

All embedding calls are delegated to the active
:class:`~backend.intelligence.rag.providers.base.EmbeddingProvider`
selected by the ``EMBEDDING_PROVIDER`` environment variable.

This module preserves the legacy ``embed_text`` / ``embed_batch`` API
so that ``vector_store`` and ``memory_store`` require zero changes.
"""

from typing import List

from backend.intelligence.rag.providers.provider_factory import get_provider


def embed_text(text: str) -> List[float]:
    return get_provider().embed_text(text)


def embed_batch(texts: List[str]) -> List[List[float]]:
    return get_provider().embed_batch(texts)
