"""Structured logging and API timing middleware for APEXiq."""

import time
import logging
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("apexiq")


class APITimingMiddleware(BaseHTTPMiddleware):
    """Logs request method, path, status, and duration."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
        start = time.perf_counter()

        response = await call_next(request)

        duration_ms = (time.perf_counter() - start) * 1000
        status = response.status_code
        method = request.method
        path = request.url.path

        if status >= 500:
            log_fn = logger.error
        elif status >= 400:
            log_fn = logger.warning
        elif duration_ms > 1000:
            log_fn = logger.warning
        else:
            log_fn = logger.info

        log_fn(
            f"{method} {path} {status} {duration_ms:.1f}ms",
            extra={
                "method": method,
                "path": path,
                "status": status,
                "duration_ms": round(duration_ms, 1),
                "request_id": request_id,
                "client": request.client.host if request.client else None,
            },
        )

        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration_ms:.1f}ms"
        return response
