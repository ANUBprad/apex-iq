"""V3 Intelligence API endpoints."""

import os
import hashlib
import threading
import json
import time
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, Depends, Query, Request
from pydantic import BaseModel, Field

logger = logging.getLogger("apexiq.intelligence")

from backend.intelligence.orchestrator.graph import run_intelligence_pipeline
from backend.intelligence.confidence.confidence_engine import compute_confidence
from backend.intelligence.confidence.trust_score import compute_trust_score
from backend.intelligence.memory.memory_store import store_recommendation
from backend.intelligence.memory.memory_retriever import get_past_recommendations, get_circuit_history
from backend.intelligence.explainability.reasoning_chain import build_reasoning_chain
from backend.intelligence.explainability.evidence_builder import build_evidence
from backend.intelligence.explainability.decision_summary import generate_summary
from backend.intelligence.rag.retriever import get_available_sources
from backend.intelligence.memory.memory_store import memory_count
from backend.intelligence.rag.vector_store import collection_size

_API_KEY = os.environ.get("APEXIQ_API_KEY", "")
_CACHE: dict = {}
_CACHE_LOCK = threading.Lock()
_CACHE_MAX = 128
_RATE_LIMIT: dict = {}
_RATE_LIMIT_LOCK = threading.Lock()
_RATE_LIMIT_MAX = 60
_RATE_LIMIT_WINDOW = 60.0

_KNOWN_CIRCUITS: set = set()


def _load_known_circuits():
    global _KNOWN_CIRCUITS
    try:
        from backend.intelligence.config import CIRCUITS_PATH
        with open(CIRCUITS_PATH) as f:
            data = json.load(f)
        _KNOWN_CIRCUITS = set(data.keys()) | {"monaco", "silverstone", "spa", "bahrain", "singapore", "monza", "suzuka", "hungary", "baku", "australia"}
    except Exception:
        _KNOWN_CIRCUITS = {"monaco", "silverstone", "spa", "bahrain", "singapore", "monza", "suzuka", "hungary", "baku", "australia"}


def _validate_circuit(circuit: str):
    if not circuit or not circuit.strip():
        raise HTTPException(status_code=400, detail="Circuit name is required")
    if not _KNOWN_CIRCUITS:
        _load_known_circuits()
    if circuit.lower().strip() not in _KNOWN_CIRCUITS:
        raise HTTPException(status_code=400, detail=f"Unknown circuit: {circuit}")


router = APIRouter(prefix="/api/v3/intelligence", tags=["intelligence"])


def _cache_key(query: str, circuit: str, total_laps: int, weather: str, include_explainability: bool = True) -> str:
    raw = f"{query}|{circuit}|{total_laps}|{weather}|{include_explainability}"
    return hashlib.sha256(raw.encode()).hexdigest()


def _cache_get(key: str) -> Optional[dict]:
    with _CACHE_LOCK:
        entry = _CACHE.get(key)
        if entry is not None:
            _CACHE[key] = (_CACHE.pop(key)[0], entry[1])
            return entry[1]
        return None


def _cache_set(key: str, value: dict):
    with _CACHE_LOCK:
        if len(_CACHE) >= _CACHE_MAX:
            oldest = next(iter(_CACHE))
            del _CACHE[oldest]
        _CACHE[key] = (True, value)


def _require_auth(x_api_key: str = Header(default="", alias="X-API-Key")):
    if _API_KEY and x_api_key != _API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return x_api_key


def _rate_limit(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    with _RATE_LIMIT_LOCK:
        window_start = now - _RATE_LIMIT_WINDOW
        _RATE_LIMIT[client_ip] = [t for t in _RATE_LIMIT.get(client_ip, []) if t > window_start]
        if len(_RATE_LIMIT[client_ip]) >= _RATE_LIMIT_MAX:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        _RATE_LIMIT[client_ip].append(now)
    return client_ip


def _audit_log(request: Request, status: str, detail: str = ""):
    client_ip = request.client.host if request.client else "unknown"
    logger.info(f"audit ip={client_ip} status={status} path={request.url.path} detail={detail}")


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    circuit: str = Field(..., min_length=1, max_length=100)
    total_laps: int = Field(default=70, ge=1, le=200)
    weather: str = Field(default="dry", pattern="^(dry|wet|mixed)$")
    include_explainability: bool = Field(default=True)


class QueryResponse(BaseModel):
    status: str
    recommendation: Optional[dict] = None
    confidence: Optional[dict] = None
    trust_score: Optional[dict] = None
    explanation: Optional[dict] = None
    memory_id: Optional[str] = None
    errors: list = []


@router.post("/query", response_model=QueryResponse)
def intelligence_query(req: QueryRequest, http_request: Request, auth: str = Depends(_require_auth), ip: str = Depends(_rate_limit)):
    ck = _cache_key(req.query, req.circuit, req.total_laps, req.weather, req.include_explainability)
    cached = _cache_get(ck)
    if cached is not None:
        return QueryResponse(**cached)
    try:
        result = run_intelligence_pipeline(
            query=req.query,
            circuit=req.circuit,
            total_laps=req.total_laps,
            weather=req.weather,
        )

        errors = result.get("errors", [])
        recommendation = result.get("recommendation")
        rag_context = result.get("rag_context")
        simulation_results = result.get("simulation_results")
        historical_analysis = result.get("historical_analysis")
        telemetry_analysis = result.get("telemetry_analysis")
        risk_assessments = result.get("risk_assessments")

        if errors:
            resp = QueryResponse(
                status="partial",
                recommendation=recommendation,
                errors=errors,
            )
            _cache_set(ck, resp.model_dump())
            return resp

        telemetry_simulated = result.get("telemetry_is_simulated", True)
        confidence = compute_confidence(
            rag_context=rag_context,
            simulation_results=simulation_results,
            historical_analysis=historical_analysis,
            telemetry_analysis=telemetry_analysis,
            recommendation=recommendation,
            telemetry_is_simulated=telemetry_simulated,
            circuit_known=bool(rag_context and rag_context.get("document_count", 0) > 0),
        )

        trust = compute_trust_score(confidence, errors)

        memory_id = None
        if recommendation:
            memory_id = store_recommendation(
                query=req.query,
                circuit=req.circuit,
                recommendation=recommendation,
                confidence=confidence,
            )

        explanation = None
        if req.include_explainability:
            reasoning_chain = build_reasoning_chain(
                query=req.query,
                circuit=req.circuit,
                recommendation=recommendation or {},
                confidence=confidence,
                node_history=result.get("node_history", []),
                rag_context=rag_context or {},
                historical_analysis=historical_analysis or {},
                risk_assessments=risk_assessments or [],
            )
            evidence = build_evidence(
                rag_context=rag_context or {},
                historical_analysis=historical_analysis or {},
                risk_assessments=risk_assessments or [],
                telemetry_analysis=telemetry_analysis or {},
            )
            explanation = generate_summary(
                query=req.query,
                circuit=req.circuit,
                recommendation=recommendation or {},
                confidence=confidence,
                trust_score=trust,
                reasoning_chain=reasoning_chain,
                evidence=evidence,
            )

        resp = QueryResponse(
            status="success",
            recommendation=recommendation,
            confidence=confidence,
            trust_score=trust,
            explanation=explanation,
            memory_id=memory_id,
        )
        _cache_set(ck, resp.model_dump())
        _audit_log(http_request, "success", f"circuit={req.circuit}")
        return resp

    except Exception as e:
        _audit_log(http_request, "error", str(e))
        raise HTTPException(status_code=500, detail=str(e))


class RecommendRequest(BaseModel):
    circuit: str = Field(..., min_length=1, max_length=100)
    total_laps: int = Field(default=70, ge=1, le=200)
    weather: str = Field(default="dry", pattern="^(dry|wet|mixed)$")
    include_explainability: bool = Field(default=True)


@router.post("/recommend", response_model=QueryResponse)
def intelligence_recommend(req: RecommendRequest, http_request: Request, auth: str = Depends(_require_auth), ip: str = Depends(_rate_limit)):
    qr = QueryRequest(
        query=f"Best strategy for {req.circuit} with {req.weather} conditions, {req.total_laps} laps",
        circuit=req.circuit,
        total_laps=req.total_laps,
        weather=req.weather,
        include_explainability=req.include_explainability,
    )
    return intelligence_query(qr, http_request=http_request, auth=auth)


@router.get("/memory/recall")
def recall_memory(
    query: str = Query(..., min_length=1, max_length=500),
    circuit: Optional[str] = Query(None, min_length=1, max_length=100),
    auth: str = Depends(_require_auth),
    ip: str = Depends(_rate_limit),
):
    return get_past_recommendations(query=query, circuit=circuit)


@router.get("/memory/{circuit}")
def circuit_memory(circuit: str, auth: str = Depends(_require_auth), ip: str = Depends(_rate_limit)):
    _validate_circuit(circuit)
    return {"circuit": circuit, "entries": get_circuit_history(circuit)}


@router.get("/health")
def intelligence_health():
    from backend.intelligence.ai_state import ai_state

    state = ai_state.snapshot()
    rag_count = collection_size()
    mem_count = memory_count()

    return {
        "status": state["status"],
        "ready": state["ready"],
        "loading": state["loading"],
        "indexed": state["indexed"],
        "rag_document_count": rag_count,
        "memory_entry_count": mem_count,
        "available_sources": ["historical_races", "circuits"],
        "error": state["error"],
    }


@router.get("/metrics")
def intelligence_metrics():
    return {
        "rag_documents_indexed": collection_size(),
        "memory_entries": memory_count(),
        "agents_available": 5,
        "pipeline_depth": 6,
    }
