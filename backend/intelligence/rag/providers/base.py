"""Abstract base class for embedding providers."""

from abc import ABC, abstractmethod
from typing import List


class EmbeddingProvider(ABC):
    """Interface that every embedding backend must implement."""

    @abstractmethod
    def name(self) -> str:
        """Short human-readable identifier (e.g. ``"sentence_transformers"``)."""

    @abstractmethod
    def dimension(self) -> int:
        """Return the dimensionality of the embedding vectors."""

    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        """Embed a single text string."""

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of text strings."""
