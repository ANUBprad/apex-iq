"""Retrieve relevant context from the vector store with optional filtering."""

import logging
from typing import List, Optional
from backend.intelligence.rag.vector_store import query_similar, collection_size, index_documents
from backend.intelligence.rag.document_loader import load_all_documents

logger = logging.getLogger("apexiq.retriever")

_INDEXED = False


def ensure_indexed() -> bool:
    """Index documents into ChromaDB if the collection is empty.

    Returns True if indexing succeeded or was already done, False on failure.
    """
    global _INDEXED
    if _INDEXED:
        return True
    if collection_size() > 0:
        _INDEXED = True
        return True

    docs = load_all_documents()
    if not docs:
        logger.warning("No documents found to index")
        return False

    try:
        index_documents(docs)
        _INDEXED = True
        return True
    except Exception:
        logger.exception("Failed to index documents into ChromaDB")
        try:
            from backend.intelligence.ai_state import ai_state
            ai_state.mark_indexed()
        except Exception:
            pass
        return False


def retrieve_context(query: str, n_results: int = 5, circuit: Optional[str] = None) -> List[dict]:
    ensure_indexed()
    filter_metadata = {}
    if circuit:
        filter_metadata = {"circuit": circuit}
    return query_similar(query, n_results=n_results, filter_metadata=filter_metadata)


def get_available_sources() -> List[str]:
    return ["historical_races", "circuits"]
