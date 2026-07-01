"""LangGraph execution graph for the intelligence pipeline."""

from typing import Dict, Any
from langgraph.graph import StateGraph
from backend.intelligence.orchestrator.state import IntelligenceState
from backend.intelligence.orchestrator.nodes import (
    rag_node,
    simulation_node,
    historical_node,
    telemetry_node,
    risk_node,
    sync_node,
    fusion_node,
)


def build_intelligence_graph() -> StateGraph:
    workflow = StateGraph(IntelligenceState)

    workflow.add_node("rag", rag_node)
    workflow.add_node("simulate", simulation_node)
    workflow.add_node("historical", historical_node)
    workflow.add_node("telemetry", telemetry_node)
    workflow.add_node("risk", risk_node)
    workflow.add_node("sync", sync_node)
    workflow.add_node("fusion", fusion_node)

    workflow.set_entry_point("rag")

    workflow.add_edge("rag", "simulate")
    workflow.add_edge("rag", "historical")
    workflow.add_edge("rag", "telemetry")

    workflow.add_edge("simulate", "risk")

    workflow.add_edge("historical", "sync")
    workflow.add_edge("telemetry", "sync")
    workflow.add_edge("risk", "sync")

    workflow.add_edge("sync", "fusion")

    return workflow.compile()


def run_intelligence_pipeline(
    query: str,
    circuit: str,
    total_laps: int = 70,
    weather: str = "dry",
) -> Dict[str, Any]:
    graph = build_intelligence_graph()
    initial_state: Dict[str, Any] = {
        "query": query,
        "circuit": circuit,
        "total_laps": total_laps,
        "weather": weather,
        "telemetry_is_simulated": True,
        "errors": [],
        "node_history": [],
    }
    result = graph.invoke(initial_state)
    return result
