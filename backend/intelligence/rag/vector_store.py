"""ChromaDB vector store for persistent knowledge retrieval."""

import threading
from typing import List, Optional
from backend.intelligence.config import CHROMA_DIR, CHROMA_COLLECTION_NAME
from backend.intelligence.rag.chroma_client import get_client

COLLECTION_NAME = CHROMA_COLLECTION_NAME

_collection = None
_lock = threading.Lock()


def _get_collection():
    global _collection
    if _collection is not None:
        return _collection
    with _lock:
        if _collection is not None:
            return _collection
        client = get_client(CHROMA_DIR)
        try:
            _collection = client.get_collection(COLLECTION_NAME)
        except (ValueError, Exception):
            _collection = client.create_collection(COLLECTION_NAME)
        return _collection


def index_documents(docs: List) -> int:
    from backend.intelligence.rag.embedding_service import embed_batch
    collection = _get_collection()
    texts = [d.content for d in docs]
    ids = [d.id for d in docs]
    metadatas = [d.metadata if d.metadata else {"source": d.source} for d in docs]
    embeddings = embed_batch(texts)
    existing_ids = set(collection.get()["ids"])
    new_ids = []
    new_embeddings = []
    new_metadatas = []
    new_texts = []
    for i, doc_id in enumerate(ids):
        if doc_id not in existing_ids:
            new_ids.append(doc_id)
            new_embeddings.append(embeddings[i])
            new_metadatas.append(metadatas[i])
            new_texts.append(texts[i])
    if new_ids:
        collection.add(ids=new_ids, embeddings=new_embeddings, metadatas=new_metadatas, documents=new_texts)
    return len(new_ids)


def query_similar(query: str, n_results: int = 5, filter_metadata: Optional[dict] = None) -> List[dict]:
    collection = _get_collection()
    where = filter_metadata or {}
    results = collection.query(
        query_texts=[query],
        n_results=n_results,
        where=where if where else None,
    )
    output = []
    for i in range(len(results["ids"][0])):
        output.append({
            "id": results["ids"][0][i],
            "document": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "score": float(results["distances"][0][i]) if results.get("distances") else 0.0,
        })
    return output


def collection_size() -> int:
    collection = _get_collection()
    return collection.count()


def reset_collection():
    global _collection
    _collection = None
