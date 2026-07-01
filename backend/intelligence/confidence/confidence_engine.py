"""Compute confidence scores for strategy recommendations based on signal quality."""

from typing import Dict, Any, Optional, List
from backend.intelligence.confidence.weight_allocator import allocate_weights


def _rag_confidence(context: Optional[Dict[str, Any]]) -> float:
    if not context:
        return 0.0
    doc_count = context.get("document_count", 0)
    sources = context.get("sources", [])
    if doc_count == 0:
        return 0.0
    if doc_count >= 8 and len(sources) >= 2:
        return 0.9
    if doc_count >= 4:
        return 0.7
    return 0.4


def _historical_quality(analysis: Optional[Dict[str, Any]]) -> float:
    if not analysis:
        return 0.0
    doc_count = analysis.get("document_count", 0)
    if doc_count >= 5:
        return 0.85
    if doc_count >= 2:
        return 0.6
    return 0.2


def _telemetry_quality(analysis: Optional[Dict[str, Any]]) -> float:
    if not analysis:
        return 0.0
    laps = analysis.get("laps_analyzed", 0)
    anomalies = analysis.get("anomalies", [])
    if laps >= 15 and len(anomalies) <= 1:
        return 0.85
    if laps >= 5:
        return 0.6
    return 0.3


def _simulation_quality(results: Optional[List[Dict[str, Any]]]) -> float:
    if not results or len(results) == 0:
        return 0.0
    iterations = max(r.get("iterations", 0) for r in results)
    sim_model = results[0].get("model", "v1")
    model_bonus = 0.05 if sim_model == "v2_nonlinear" else 0.0
    if iterations >= 500:
        return min(0.95, 0.9 + model_bonus)
    if iterations >= 200:
        return min(0.85, 0.7 + model_bonus)
    return 0.5


def compute_confidence(
    rag_context: Optional[Dict[str, Any]] = None,
    simulation_results: Optional[List[Dict[str, Any]]] = None,
    historical_analysis: Optional[Dict[str, Any]] = None,
    telemetry_analysis: Optional[Dict[str, Any]] = None,
    recommendation: Optional[Dict[str, Any]] = None,
    telemetry_is_simulated: bool = True,
    circuit_known: bool = True,
) -> Dict[str, Any]:
    rag_score = _rag_confidence(rag_context)
    sim_score = _simulation_quality(simulation_results)
    hist_score = _historical_quality(historical_analysis)
    tel_score = _telemetry_quality(telemetry_analysis)

    weights = allocate_weights(
        circuit_known=circuit_known,
        have_telemetry=tel_score > 0,
        historical_density="high" if hist_score >= 0.85 else "medium" if hist_score >= 0.6 else "low",
        telemetry_is_simulated=telemetry_is_simulated,
    )

    overall = (
        rag_score * weights["rag"]
        + sim_score * weights["simulation"]
        + hist_score * weights["historical"]
        + tel_score * weights["telemetry"]
    )

    levels = ["very_low", "low", "medium", "high", "very_high"]
    raw_idx = overall * 5
    if raw_idx >= 4.5:
        idx = 4
    elif raw_idx >= 3.5:
        idx = 3
    elif raw_idx >= 2.5:
        idx = 2
    elif raw_idx >= 1.5:
        idx = 1
    else:
        idx = 0
    level = levels[idx]

    return {
        "overall_score": round(overall, 3),
        "level": level,
        "weights_used": weights,
        "components": {
            "rag": {"score": round(rag_score, 3)},
            "simulation": {"score": round(sim_score, 3)},
            "historical": {"score": round(hist_score, 3)},
            "telemetry": {"score": round(tel_score, 3)},
        },
    }
