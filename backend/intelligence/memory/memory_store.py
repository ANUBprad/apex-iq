"""Persistent strategy memory using ChromaDB for storing past recommendations."""

import json
import uuid
import threading
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from backend.intelligence.config import MEMORY_DIR, MEMORY_COLLECTION_NAME
from backend.intelligence.rag.chroma_client import get_client

COLLECTION_NAME = MEMORY_COLLECTION_NAME
_MAX_MEMORY_ENTRIES = 10000
_TTL_DAYS = 365

_collection = None
_lock = threading.Lock()


def _get_collection():
    global _collection
    if _collection is not None:
        return _collection
    with _lock:
        if _collection is not None:
            return _collection
        client = get_client(MEMORY_DIR)
        try:
            _collection = client.get_collection(COLLECTION_NAME)
        except (ValueError, Exception):
            _collection = client.create_collection(COLLECTION_NAME)
        return _collection


def _enforce_limits():
    collection = _get_collection()
    cutoff = (datetime.now() - timedelta(days=_TTL_DAYS)).isoformat()
    all_data = collection.get()
    to_delete = []
    for i, mid in enumerate(all_data.get("metadatas", [])):
        if mid:
            ts = mid.get("timestamp", "")
            if ts < cutoff:
                to_delete.append(all_data["ids"][i])
    if to_delete:
        collection.delete(ids=to_delete)
    remaining = collection.count()
    if remaining > _MAX_MEMORY_ENTRIES:
        excess = remaining - _MAX_MEMORY_ENTRIES
        all_ids = collection.get()["ids"]
        if excess < len(all_ids):
            collection.delete(ids=all_ids[:excess])


def store_recommendation(
    query: str,
    circuit: str,
    recommendation: Dict[str, Any],
    confidence: Dict[str, Any],
    outcome: Optional[Dict[str, Any]] = None,
) -> str:
    from backend.intelligence.rag.embedding_service import embed_batch
    collection = _get_collection()
    doc_id = f"rec_{uuid.uuid4().hex}_{int(datetime.now().timestamp())}"
    strategy_field = recommendation.get("recommendation", {}).get("strategy", "")
    content = json.dumps({
        "query": query,
        "circuit": circuit,
        "recommendation": recommendation,
        "confidence": confidence,
        "outcome": outcome,
        "strategy_name": strategy_field,
    })
    embedding = embed_batch([query])[0]
    collection.add(
        ids=[doc_id],
        embeddings=[embedding],
        documents=[content],
        metadatas=[{
            "type": "recommendation",
            "circuit": circuit,
            "timestamp": datetime.now().isoformat(),
            "strategy": strategy_field,
        }],
    )
    _enforce_limits()
    return doc_id


def recall_similar(query: str, circuit: Optional[str] = None, n: int = 5) -> List[Dict[str, Any]]:
    collection = _get_collection()
    where = {}
    if circuit:
        where = {"circuit": circuit}
    try:
        results = collection.query(
            query_texts=[query],
            n_results=n,
            where=where if where else None,
        )
    except ValueError:
        return []

    entries = []
    for i in range(len(results["ids"][0])):
        try:
            content = json.loads(results["documents"][0][i])
        except (json.JSONDecodeError, IndexError):
            continue
        entries.append({
            "id": results["ids"][0][i],
            "content": content,
            "metadata": results["metadatas"][0][i] if results.get("metadatas") else {},
            "score": float(results["distances"][0][i]) if results.get("distances") else 0.0,
        })
    return entries


def memory_count() -> int:
    collection = _get_collection()
    return collection.count()
