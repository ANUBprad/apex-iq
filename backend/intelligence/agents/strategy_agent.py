"""Fuse signals from all agents into final strategy recommendations."""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass


@dataclass
class StrategyOption:
    name: str
    tyre_compound: str
    pit_stop_lap: int
    expected_finish: float
    win_pct: float
    podium_pct: float
    risk_score: float
    risk_level: str
    confidence: float


_COMPOUND_NAMES = {
    "soft": "Soft",
    "medium": "Medium",
    "hard": "Hard",
}


def generate_recommendations(
    simulation_results: List[Dict[str, Any]],
    risk_assessments: List[Dict[str, Any]],
    historical_analysis: Optional[Dict[str, Any]] = None,
    telemetry_analysis: Optional[Dict[str, Any]] = None,
    context_summary: Optional[str] = None,
) -> Dict[str, Any]:
    options = []
    for sim, risk in zip(simulation_results, risk_assessments):
        compound = sim.get("tyre_compound", "medium")
        expected_finish = sim.get("average_finish_position", 10)
        confidence = max(0.0, 1.0 - (expected_finish - 1) * 0.08)
        confidence = min(0.95, confidence)
        option = StrategyOption(
            name=f"{_COMPOUND_NAMES.get(compound, compound)} (Pit L{sim.get('pit_stop_lap', 20)})",
            tyre_compound=compound,
            pit_stop_lap=sim.get("pit_stop_lap", 20),
            expected_finish=expected_finish,
            win_pct=sim.get("win_probability", 0),
            podium_pct=sim.get("podium_probability", 0),
            risk_score=risk.get("overall_risk_score", 0.5),
            risk_level=risk.get("risk_level", "medium"),
            confidence=round(confidence, 3),
        )
        options.append(option)

    options.sort(key=lambda o: (o.expected_finish, o.risk_score))

    best_option = options[0] if options else None
    alternatives = options[1:4] if len(options) > 1 else []

    return {
        "recommendation": {
            "strategy": best_option.name if best_option else None,
            "tyre_compound": best_option.tyre_compound if best_option else None,
            "pit_stop_lap": best_option.pit_stop_lap if best_option else None,
            "expected_finish": best_option.expected_finish if best_option else None,
            "win_probability": best_option.win_pct if best_option else None,
            "podium_probability": best_option.podium_pct if best_option else None,
            "risk_level": best_option.risk_level if best_option else None,
            "confidence": best_option.confidence if best_option else None,
        },
        "alternatives": [
            {
                "strategy": a.name,
                "expected_finish": a.expected_finish,
                "risk_level": a.risk_level,
                "confidence": a.confidence,
            }
            for a in alternatives
        ],
        "total_options_evaluated": len(options),
        "analytical_basis": {
            "simulations_used": len(simulation_results),
            "historical_sources_available": bool(historical_analysis),
            "telemetry_available": bool(telemetry_analysis),
            "context": context_summary,
        },
    }
