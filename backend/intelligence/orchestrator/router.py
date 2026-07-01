"""Route queries to the correct processing path based on intent analysis."""

from typing import Dict, Any


def route_query(query: str) -> str:
    q = query.lower()

    if any(w in q for w in ["simulate", "what if", "monte carlo", "run simulation"]):
        return "simulation"

    if any(w in q for w in ["compare", "versus", "vs ", "better"]):
        return "comparison"

    if any(w in q for w in ["risk", "danger", "safety", "crash"]):
        return "risk_analysis"

    if any(w in q for w in ["telemetry", "lap time", "sector", "tyre temp"]):
        return "telemetry"

    if any(w in q for w in ["history", "past", "precedent", "trend"]):
        return "historical"

    return "full_analysis"


def get_strategy_params(route: str, circuit_data: Dict[str, Any]) -> Dict[str, Any]:
    base = {
        "compounds": ["soft", "medium", "hard"],
        "pit_window_start": 10,
        "pit_window_end": 30,
    }

    if route == "simulation":
        base["n_iterations"] = 500
    elif route == "comparison":
        base["compounds"] = ["soft", "medium"]
        base["n_iterations"] = 300
    elif route == "risk_analysis":
        base["compounds"] = ["medium", "hard"]
        base["n_iterations"] = 200
    elif route == "telemetry":
        base["compounds"] = ["medium"]
        base["n_iterations"] = 100
    elif route == "historical":
        base["compounds"] = ["soft", "medium", "hard"]
        base["n_iterations"] = 100
    else:
        base["n_iterations"] = 300

    return base
