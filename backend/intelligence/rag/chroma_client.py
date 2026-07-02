"""Shared ChromaDB PersistentClient singleton.

One client is created per unique directory path.  Both ``vector_store``
and ``memory_store`` use this module instead of creating their own clients,
preventing duplicate SQLite / DuckDB handles for the same on-disk directory.
"""

import os
import threading
import atexit
import logging
from typing import Dict

logger = logging.getLogger("apexiq.chroma")

_clients: Dict[str, object] = {}
_lock = threading.Lock()


def get_client(path: str) -> object:
    """Return a ``PersistentClient`` for *path*, creating one if needed."""
    path = os.path.abspath(path)
    client = _clients.get(path)
    if client is not None:
        return client
    with _lock:
        client = _clients.get(path)
        if client is not None:
            return client
        import chromadb
        from chromadb.config import Settings

        os.makedirs(path, exist_ok=True)
        client = chromadb.PersistentClient(
            path=path,
            settings=Settings(anonymized_telemetry=False),
        )
        _clients[path] = client
        logger.info("ChromaDB PersistentClient created for %s", path)
        return client


def close_all():
    """Drop all cached references (called at process exit)."""
    with _lock:
        _clients.clear()


atexit.register(close_all)
