"""LangGraph node functions that process the intelligence workflow state."""

from typing import Dict, Any
from backend.intelligence.rag.retriever import retrieve_context
from backend.intelligence.rag.context_builder import build_context
from backend.intelligence.agents.simulation_agent import run_what_if_analysis
from backend.intelligence.agents.risk_agent import assess_strategy_risk
from backend.intelligence.agents.historical_agent import analyze_historical_patterns
from backend.intelligence.agents.telemetry_agent import analyze_lap_telemetry
from backend.intelligence.agents.strategy_agent import generate_recommendations
from backend.intelligence.orchestrator.router import get_strategy_params


def rag_node(state: Dict[str, Any]) -> Dict[str, Any]:
    circuit = state.get("circuit", "")
    weather = state.get("weather", "dry")
    user_query = state.get("query", "")
    query = user_query if user_query else f"{circuit} {weather} race strategy"
    retrieved = retrieve_context(query, n_results=8, circuit=circuit)
    context = build_context(retrieved, query)
    return {"rag_context": context, "node_history": ["rag"]}


def simulation_node(state: Dict[str, Any]) -> Dict[str, Any]:
    circuit = state.get("circuit", "")
    laps = state.get("total_laps", 70)
    weather = state.get("weather", "dry")
    params = get_strategy_params("full_analysis", {})
    results = run_what_if_analysis(
        circuit_name=circuit,
        total_laps=laps,
        compounds=params["compounds"],
        pit_window_range=range(params["pit_window_start"], params["pit_window_end"] + 1, 5),
        degradation=0.08,
        overtaking_difficulty=0.5,
        weather=weather,
    )
    return {"simulation_results": results, "node_history": ["simulation"]}


def historical_node(state: Dict[str, Any]) -> Dict[str, Any]:
    circuit = state.get("circuit", "")
    weather = state.get("weather", "dry")
    analysis = analyze_historical_patterns(
        circuit=circuit,
        weather=weather if weather != "dry" else None,
    )
    return {"historical_analysis": analysis, "node_history": ["historical"]}


def telemetry_node(state: Dict[str, Any]) -> Dict[str, Any]:
    dummy_laps = [round(92.5 + i * 0.3 + (i % 5) * 0.5, 3) for i in range(1, 20)]
    dummy_tyre_temps = [
        round(98 + (i % 7) * 1.5 + (i > 12) * 4, 1) for i in range(len(dummy_laps))
    ]
    analysis = analyze_lap_telemetry(
        lap_times=dummy_laps,
        tyre_temps=dummy_tyre_temps,
        tyre_compound="medium",
    )
    return {
        "telemetry_analysis": analysis,
        "telemetry_is_simulated": True,
        "node_history": ["telemetry"],
    }


def risk_node(state: Dict[str, Any]) -> Dict[str, Any]:
    simulation_results = state.get("simulation_results", [])
    circuit = state.get("circuit", "")
    weather = state.get("weather", "dry")
    laps = state.get("total_laps", 70)

    if not simulation_results:
        return {"risk_assessments": [], "node_history": ["risk"]}

    assessments = []
    for sim in simulation_results[:10]:
        risk = assess_strategy_risk(
            circuit=circuit,
            tyre_compound=sim.get("tyre_compound", "medium"),
            pit_stop_lap=sim.get("pit_stop_lap", 20),
            total_laps=laps,
            weather=weather,
        )
        assessments.append(risk)
    return {"risk_assessments": assessments, "node_history": ["risk"]}


def sync_node(state: Dict[str, Any]) -> Dict[str, Any]:
    return {"node_history": ["sync"]}


def fusion_node(state: Dict[str, Any]) -> Dict[str, Any]:
    sim_results = state.get("simulation_results", [])
    risk_assessments = state.get("risk_assessments", [])

    paired_results = sim_results[: len(risk_assessments)] if risk_assessments else sim_results
    paired_risks = risk_assessments[: len(paired_results)] if risk_assessments else []

    rag_ctx = state.get("rag_context")
    context_summary = rag_ctx.get("summary") if rag_ctx else None
    recommendation = generate_recommendations(
        simulation_results=paired_results,
        risk_assessments=paired_risks if paired_risks else [{
            "overall_risk_score": 0.3,
            "risk_level": "low",
            "factors": [],
            "circuit": state.get("circuit", ""),
            "weather": state.get("weather", "dry"),
            "tyre_compound": s.get("tyre_compound", "medium"),
        } for s in paired_results],
        historical_analysis=state.get("historical_analysis"),
        telemetry_analysis=state.get("telemetry_analysis"),
        context_summary=context_summary,
    )
    return {"recommendation": recommendation, "node_history": ["fusion"]}
