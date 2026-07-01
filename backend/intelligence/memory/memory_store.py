"""Persistent strategy memory using ChromaDB for storing past recommendations."""

import json
import os
import uuid
import threading
import atexit
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import chromadb
from chromadb.config import Settings
from backend.intelligence.rag.embedding_service import embed_batch
from backend.intelligence.config import MEMORY_DIR, MEMORY_COLLECTION_NAME

COLLECTION_NAME = MEMORY_COLLECTION_NAME
_MAX_MEMORY_ENTRIES = 10000
_TTL_DAYS = 365

_client = None
_collection = None
_lock = threading.RLock()


def _get_lock():
    return _lock


def _get_client() -> chromadb.Client:
    global _client
    with _get_lock():
        if _client is None:
            os.makedirs(MEMORY_DIR, exist_ok=True)
            _client = chromadb.PersistentClient(
                path=MEMORY_DIR,
                settings=Settings(anonymized_telemetry=False),
            )
    return _client


def _get_collection():
    global _collection
    with _get_lock():
        if _collection is None:
            client = _get_client()
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


def close_client():
    global _client, _collection
    with _get_lock():
        _client = None
        _collection = None


atexit.register(close_client)
