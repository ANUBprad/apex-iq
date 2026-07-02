"""Embedding provider abstraction layer.

All embedding backends implement :class:`EmbeddingProvider`.  The active
provider is selected at runtime via the ``EMBEDDING_PROVIDER`` environment
variable and resolved by :func:`provider_factory.get_provider`.
"""
