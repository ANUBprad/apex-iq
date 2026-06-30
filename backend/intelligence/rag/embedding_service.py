"""Embedding service using sentence-transformers."""

from typing import List


_MODEL = None


def get_model():
    global _MODEL
    if _MODEL is None:
        from sentence_transformers import SentenceTransformer
        _MODEL = SentenceTransformer("all-MiniLM-L6-v2")
    return _MODEL


def embed_text(text: str) -> List[float]:
    return get_model().encode(text).tolist()


def embed_batch(texts: List[str]) -> List[List[float]]:
    return get_model().encode(texts).tolist()


def warmup():
    get_model()
