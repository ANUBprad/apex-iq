"""Shared state schema for the LangGraph workflow."""

import operator
from typing import Dict, Any, List, Optional, Annotated, TypedDict


class IntelligenceState(TypedDict, total=False):
    query: str
    circuit: str
    total_laps: int
    weather: str

    rag_context: Optional[Dict[str, Any]]
    simulation_results: Optional[List[Dict[str, Any]]]
    risk_assessments: Optional[List[Dict[str, Any]]]
    telemetry_analysis: Optional[Dict[str, Any]]
    historical_analysis: Optional[Dict[str, Any]]

    recommendation: Optional[Dict[str, Any]]
    telemetry_is_simulated: bool
    errors: Annotated[List[str], operator.add]
    node_history: Annotated[List[str], operator.add]
