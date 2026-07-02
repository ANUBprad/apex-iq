"""AI Engineer orchestration endpoint — central intelligence system."""

import json
import uuid
import threading
import time
import logging
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field

logger = logging.getLogger("apexiq.ai_engineer")

from backend.intelligence.orchestrator.graph import run_intelligence_pipeline
from backend.intelligence.confidence.confidence_engine import compute_confidence
from backend.intelligence.confidence.trust_score import compute_trust_score
from backend.intelligence.memory.memory_store import store_recommendation, recall_similar
from backend.intelligence.explainability.reasoning_chain import build_reasoning_chain
from backend.intelligence.explainability.evidence_builder import build_evidence
from backend.intelligence.explainability.decision_summary import generate_summary
from backend.intelligence.rag.retriever import get_available_sources
from backend.intelligence.memory.memory_store import memory_count
from backend.intelligence.rag.vector_store import collection_size
from backend.services.telemetry_simulator import generate_telemetry_snapshot
from backend.services.data_service import load_circuits, load_compounds, load_drivers, load_teams
from backend.services.driver_service import get_driver
from backend.services.team_service import get_team
from backend.services.historical_service import get_races_by_circuit
from backend.services.strategy_learning import analyze_similar_cases

router = APIRouter(prefix="/api/ai-engineer", tags=["ai-engineer"])

# ─── Conversation Memory ─────────────────────────────────────────────────

_conversations: Dict[str, List[Dict[str, Any]]] = {}
_conv_lock = threading.Lock()
_MAX_HISTORY = 20
_CONV_TTL = 3600  # 1 hour


def _get_conversation(session_id: str) -> List[Dict[str, Any]]:
    with _conv_lock:
        if session_id not in _conversations:
            _conversations[session_id] = []
        return _conversations[session_id]


def _add_to_conversation(session_id: str, role: str, content: str, meta: Optional[Dict] = None):
    with _conv_lock:
        if session_id not in _conversations:
            _conversations[session_id] = []
        entry = {
            "role": role,
            "content": content,
            "timestamp": time.time(),
            "meta": meta or {},
        }
        _conversations[session_id].append(entry)
        if len(_conversations[session_id]) > _MAX_HISTORY:
            _conversations[session_id] = _conversations[session_id][-_MAX_HISTORY:]


def _build_conversation_context(session_id: str) -> str:
    history = _get_conversation(session_id)
    if not history:
        return ""
    lines = []
    for msg in history[-6:]:
        prefix = "User" if msg["role"] == "user" else "Engineer"
        lines.append(f"{prefix}: {msg['content']}")
    return "\n".join(lines)


# ─── Request/Response Models ─────────────────────────────────────────────

class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    session_id: str = Field(default_factory=lambda: uuid.uuid4().hex[:12])
    circuit: str = Field(default="Monaco")
    driver: str = Field(default="Max Verstappen")
    team: str = Field(default="Red Bull")
    weather: str = Field(default="Dry")
    total_laps: int = Field(default=58, ge=1, le=200)
    current_lap: int = Field(default=1, ge=1, le=200)


class ChatResponse(BaseModel):
    session_id: str
    recommendation: str
    reasoning: str
    confidence: float
    confidence_breakdown: Dict[str, float]
    risk_level: str
    risk_score: float
    alternatives: List[Dict[str, Any]]
    simulation_summary: Dict[str, Any]
    historical_comparison: Dict[str, Any]
    knowledge_references: List[Dict[str, Any]]
    telemetry_context: Dict[str, Any]
    reasoning_chain: List[Dict[str, str]]
    evidence: List[Dict[str, Any]]
    pipeline_stages: List[Dict[str, str]]
    strategy_comparison: Optional[Dict[str, Any]] = None


# ─── Orchestration Endpoint ──────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
def ai_engineer_chat(req: ChatRequest, http_request: Request):
    session_id = req.session_id
    circuit = req.circuit
    driver_name = req.driver
    team_name = req.team

    # Build conversation context
    conv_context = _build_conversation_context(session_id)

    # Enrich query with context
    enriched_query = req.query
    if conv_context:
        enriched_query = f"Previous conversation:\n{conv_context}\n\nCurrent question: {req.query}"

    # Gather context
    telemetry = generate_telemetry_snapshot()
    driver_data = get_driver(driver_name)
    team_data = get_team(team_name)
    circuits_list = load_circuits()
    compounds = load_compounds()
    circuit_data = next((c for c in circuits_list if c.get("name") == circuit), {})
    historical = get_races_by_circuit(circuit)
    learning_cases = analyze_similar_cases(circuit, "MEDIUM")

    # Run intelligence pipeline
    pipeline_result = run_intelligence_pipeline(
        query=enriched_query,
        circuit=circuit,
        total_laps=req.total_laps,
        weather=req.weather.lower() if req.weather.lower() in ("dry", "wet", "mixed") else "dry",
    )

    errors = pipeline_result.get("errors", [])
    recommendation = pipeline_result.get("recommendation")
    rag_context = pipeline_result.get("rag_context")
    simulation_results = pipeline_result.get("simulation_results")
    historical_analysis = pipeline_result.get("historical_analysis")
    telemetry_analysis = pipeline_result.get("telemetry_analysis")
    risk_assessments = pipeline_result.get("risk_assessments")

    # Compute confidence
    telemetry_simulated = pipeline_result.get("telemetry_is_simulated", True)
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

    # Store in memory
    memory_id = None
    if recommendation:
        memory_id = store_recommendation(
            query=req.query,
            circuit=circuit,
            recommendation=recommendation,
            confidence=confidence,
        )

    # Recall similar past recommendations
    similar_memories = recall_similar(req.query, circuit=circuit, n=3)

    # Build reasoning chain
    reasoning_chain = build_reasoning_chain(
        query=req.query,
        circuit=circuit,
        recommendation=recommendation or {},
        confidence=confidence,
        node_history=pipeline_result.get("node_history", []),
        rag_context=rag_context or {},
        historical_analysis=historical_analysis or {},
        risk_assessments=risk_assessments or [],
    )

    # Build evidence
    evidence = build_evidence(
        rag_context=rag_context or {},
        historical_analysis=historical_analysis or {},
        risk_assessments=risk_assessments or [],
        telemetry_analysis=telemetry_analysis or {},
    )

    # Extract recommendation text
    rec_data = recommendation or {}
    rec_strategy = rec_data.get("strategy", {})
    rec_text = (
        rec_strategy.get("strategy", "")
        if isinstance(rec_strategy.get("strategy"), str)
        else ""
    ) or (
        rec_data.get("recommendation", "")
        if isinstance(rec_data.get("recommendation"), str)
        else ""
    ) or "Analysis complete. Review the detailed breakdown in the panels."
    reasoning_text = (
        rec_strategy.get("reasoning", "")
        if isinstance(rec_strategy.get("reasoning"), str)
        else ""
    ) or (
        rec_data.get("reasoning", "")
        if isinstance(rec_data.get("reasoning"), str)
        else ""
    ) or "Multi-agent intelligence pipeline analysis complete."

    # Build alternatives
    alternatives = []
    if simulation_results:
        for sim in simulation_results[:3]:
            alternatives.append({
                "strategy": sim.get("strategy_name", "Unknown"),
                "compound": sim.get("tyre_compound", "medium"),
                "pit_lap": sim.get("pit_stop_lap", 0),
                "estimated_time": sim.get("estimated_time", 0),
                "risk": sim.get("risk_level", "medium"),
            })

    # Build simulation summary
    sim_summary = {
        "iterations": len(simulation_results) if simulation_results else 0,
        "best_strategy": rec_strategy.get("strategy", "N/A"),
        "risk_assessments": len(risk_assessments) if risk_assessments else 0,
        "telemetry_simulated": telemetry_simulated,
    }

    # Build historical comparison
    hist_comp = {
        "total_races": len(historical) if historical else 0,
        "circuit": circuit,
        "recent_winner": historical[0].get("winner", "N/A") if historical else "N/A",
        "recent_strategy": historical[0].get("winning_strategy", "N/A") if historical else "N/A",
    }

    # Build knowledge references
    knowledge_refs = []
    if rag_context:
        for doc in rag_context.get("documents", [])[:3]:
            knowledge_refs.append({
                "source": doc.get("source", "unknown"),
                "relevance": doc.get("relevance", 0),
                "excerpt": doc.get("excerpt", "")[:200],
            })

    # Build telemetry context
    tel_context = {
        "speed": telemetry.get("speed", 0),
        "rpm": telemetry.get("rpm", 0),
        "gear": telemetry.get("gear", 0),
        "throttle": telemetry.get("throttle", 0),
        "fuel_remaining": telemetry.get("fuel_remaining", 0),
        "tyre_compound": telemetry.get("tyre", {}).get("compound", "MEDIUM"),
        "tyre_wear_fl": telemetry.get("tyre", {}).get("wear", {}).get("front_left", 0),
        "tyre_temp_fl": telemetry.get("tyre", {}).get("temperature", {}).get("front_left", 0),
        "ers_deployment": telemetry.get("ers", {}).get("deployment", 0),
        "ers_mode": telemetry.get("ers", {}).get("mode", "BALANCED"),
        "track_temp": telemetry.get("track", {}).get("temp", 0),
        "air_temp": telemetry.get("weather", {}).get("air_temp", 0),
        "session_status": telemetry.get("session", {}).get("status", "RACING"),
    }

    # Build pipeline stages
    node_history = pipeline_result.get("node_history", [])
    stage_map = {
        "rag": "Knowledge Retrieval",
        "simulate": "Simulation Engine",
        "historical": "Historical Analysis",
        "telemetry": "Telemetry Processing",
        "risk": "Risk Assessment",
        "sync": "Data Synchronization",
        "fusion": "Intelligence Fusion",
    }
    pipeline_stages = []
    for node in ["rag", "simulate", "historical", "telemetry", "risk", "sync", "fusion"]:
        status = "complete" if node in node_history else ("active" if node_history and node == node_history[-1] else "pending")
        pipeline_stages.append({
            "name": stage_map.get(node, node),
            "status": status,
        })

    # Store conversation
    _add_to_conversation(session_id, "user", req.query, {"circuit": circuit, "driver": driver_name})
    _add_to_conversation(session_id, "engineer", rec_text, {
        "confidence": confidence.get("overall", 0),
        "risk": trust.get("level", "medium"),
    })

    # Get driver/team context for display
    driver_context = {
        "name": driver_name,
        "team": team_name,
        "aggression": driver_data.get("aggression", 50) if driver_data else 50,
        "tyre_management": driver_data.get("tyre_management", 50) if driver_data else 50,
    }
    team_context = {
        "name": team_name,
        "undercut_bias": team_data.get("undercut_bias", 50) if team_data else 50,
        "risk_tolerance": team_data.get("risk_tolerance", 50) if team_data else 50,
    }

    return ChatResponse(
        session_id=session_id,
        recommendation=rec_text,
        reasoning=reasoning_text,
        confidence=confidence.get("overall", 0),
        confidence_breakdown={
            "rag": confidence.get("rag", 0),
            "simulation": confidence.get("simulation", 0),
            "historical": confidence.get("historical", 0),
            "memory": confidence.get("memory", 0),
            "telemetry": confidence.get("telemetry", 0),
        },
        risk_level=trust.get("level", "medium"),
        risk_score=trust.get("score", 0.5),
        alternatives=alternatives,
        simulation_summary=sim_summary,
        historical_comparison=hist_comp,
        knowledge_references=knowledge_refs,
        telemetry_context=tel_context,
        reasoning_chain=[
            {"step": r.get("step", ""), "detail": r.get("detail", "")}
            for r in (reasoning_chain if isinstance(reasoning_chain, list) else [])
        ],
        evidence=evidence if isinstance(evidence, list) else [],
        pipeline_stages=pipeline_stages,
    )


@router.get("/session/{session_id}")
def get_session(session_id: str):
    history = _get_conversation(session_id)
    return {"session_id": session_id, "messages": history}


@router.delete("/session/{session_id}")
def clear_session(session_id: str):
    with _conv_lock:
        _conversations.pop(session_id, None)
    return {"status": "cleared"}


@router.get("/context/{circuit}")
def get_context(circuit: str):
    circuits_list = load_circuits()
    circuit_data = next((c for c in circuits_list if c.get("name") == circuit), {})
    historical = get_races_by_circuit(circuit)
    return {
        "circuit": circuit,
        "data": circuit_data,
        "historical_races": len(historical) if historical else 0,
        "recent_races": historical[:3] if historical else [],
    }
