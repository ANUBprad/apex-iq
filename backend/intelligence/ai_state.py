"""Global AI runtime state — single source of truth for readiness."""

import threading
import time
from typing import Optional


class AIState:
    """Thread-safe singleton tracking AI subsystem readiness."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._ready = False
        self._loading = False
        self._indexed = False
        self._error: Optional[str] = None
        self._started_at: Optional[float] = None
        self._ready_at: Optional[float] = None

    @property
    def ready(self) -> bool:
        with self._lock:
            return self._ready

    @property
    def loading(self) -> bool:
        with self._lock:
            return self._loading

    @property
    def indexed(self) -> bool:
        with self._lock:
            return self._indexed

    @property
    def error(self) -> Optional[str]:
        with self._lock:
            return self._error

    def mark_loading(self) -> None:
        with self._lock:
            self._loading = True
            self._started_at = time.time()

    def mark_ready(self, indexed: bool = True) -> None:
        with self._lock:
            self._ready = True
            self._loading = False
            self._indexed = indexed
            self._error = None
            self._ready_at = time.time()

    def mark_error(self, message: str) -> None:
        with self._lock:
            self._ready = False
            self._loading = False
            self._error = message

    def mark_indexed(self) -> None:
        with self._lock:
            self._indexed = True

    def snapshot(self) -> dict:
        """Return a JSON-serialisable snapshot of the current state."""
        with self._lock:
            elapsed = None
            if self._started_at and self._ready_at:
                elapsed = round(self._ready_at - self._started_at, 1)
            return {
                "ready": self._ready,
                "loading": self._loading,
                "indexed": self._indexed,
                "error": self._error,
                "init_time_ms": int(elapsed * 1000) if elapsed is not None else None,
            }


ai_state = AIState()
