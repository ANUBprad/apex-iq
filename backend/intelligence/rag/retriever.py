"""Retrieve relevant context from the vector store with optional filtering."""

from typing import List, Optional
from backend.intelligence.rag.vector_store import query_similar, collection_size, index_documents
from backend.intelligence.rag.document_loader import load_all_documents


_INDEXED = False


def ensure_indexed():
    global _INDEXED
    if not _INDEXED and collection_size() == 0:
        docs = load_all_documents()
        if docs:
            try:
                index_documents(docs)
                _INDEXED = True
            except Exception:
                return


def retrieve_context(query: str, n_results: int = 5, circuit: Optional[str] = None) -> List[dict]:
    ensure_indexed()
    filter_metadata = {}
    if circuit:
        filter_metadata = {"circuit": circuit}
    return query_similar(query, n_results=n_results, filter_metadata=filter_metadata)


def get_available_sources() -> List[str]:
    ensure_indexed()
    return ["historical_races", "circuits"]
