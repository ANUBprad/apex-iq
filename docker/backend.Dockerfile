# ── Stage 1: Build ──────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 2: Production ────────────────────────────────────────
FROM python:3.12-slim AS production

LABEL maintainer="APEXiq Team"
LABEL description="APEXiq F1 AI Race Engineer API"

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r apexiq && useradd -r -g apexiq -d /app -s /sbin/nologin apexiq

WORKDIR /app

COPY --from=builder /install /usr/local
COPY backend/ ./backend/
COPY simulation/ ./simulation/
COPY ml/ ./ml/
COPY data/ ./data/
COPY requirements.txt .

RUN chown -R apexiq:apexiq /app

USER apexiq

ENV PYTHONPATH=/app \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
