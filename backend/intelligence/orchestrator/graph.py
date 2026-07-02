"""LangGraph execution graph for the intelligence pipeline."""

import threading
import logging
import time
from typing import Dict, Any

logger = logging.getLogger("apexiq.graph")

_graph = None
_lock = threading.Lock()


def build_intelligence_graph():
    global _graph
    if _graph is not None:
        return _graph
    with _lock:
        if _graph is not None:
            return _graph

        _t0 = time.perf_counter()

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
        _t_imports = time.perf_counter()
        logger.info("langgraph import: %.1f ms", (_t_imports - _t0) * 1000)

        workflow = StateGraph(IntelligenceState)
        _t_state = time.perf_counter()
        logger.info("StateGraph(): %.1f ms", (_t_state - _t_imports) * 1000)

        workflow.add_node("rag", rag_node)
        workflow.add_node("simulate", simulation_node)
        workflow.add_node("historical", historical_node)
        workflow.add_node("telemetry", telemetry_node)
        workflow.add_node("risk", risk_node)
        workflow.add_node("sync", sync_node)
        workflow.add_node("fusion", fusion_node)
        _t_nodes = time.perf_counter()
        logger.info("add_node() x7: %.1f ms", (_t_nodes - _t_state) * 1000)

        workflow.set_entry_point("rag")

        workflow.add_edge("rag", "simulate")
        workflow.add_edge("rag", "historical")
        workflow.add_edge("rag", "telemetry")
        workflow.add_edge("simulate", "risk")
        workflow.add_edge("historical", "sync")
        workflow.add_edge("telemetry", "sync")
        workflow.add_edge("risk", "sync")
        workflow.add_edge("sync", "fusion")
        _t_edges = time.perf_counter()
        logger.info("add_edge() x8: %.1f ms", (_t_edges - _t_nodes) * 1000)

        _graph = workflow.compile()
        _t_compile = time.perf_counter()
        logger.info("compile(): %.1f ms", (_t_compile - _t_edges) * 1000)

        logger.info(
            "build_intelligence_graph TOTAL: %.1f ms "
            "(imports %.1f | state %.1f | nodes %.1f | edges %.1f | compile %.1f)",
            (_t_compile - _t0) * 1000,
            (_t_imports - _t0) * 1000,
            (_t_state - _t_imports) * 1000,
            (_t_nodes - _t_state) * 1000,
            (_t_edges - _t_nodes) * 1000,
            (_t_compile - _t_edges) * 1000,
        )
        return _graph


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
