"""Collect evidence objects supporting the recommendation."""

from typing import Dict, Any, List


def build_evidence(
    rag_context: Dict[str, Any],
    historical_analysis: Dict[str, Any],
    risk_assessments: List[Dict[str, Any]],
    telemetry_analysis: Dict[str, Any],
) -> List[Dict[str, Any]]:
    evidence = []

    if rag_context and rag_context.get("document_count", 0) > 0:
        evidence.append({
            "type": "historical_knowledge",
            "source": "; ".join(rag_context.get("sources", [])),
            "detail": rag_context.get("summary", "")[:300],
            "relevance": "high" if rag_context["document_count"] >= 5 else "medium",
        })

    if historical_analysis and historical_analysis.get("document_count", 0) > 0:
        evidence.append({
            "type": "pattern_match",
            "source": "historical_agent",
            "detail": f"Winner history: {historical_analysis.get('winner_history', 'unknown')}",
            "relevance": "medium",
        })

    if risk_assessments:
        highest_risk = max(risk_assessments, key=lambda r: r.get("overall_risk_score", 0))
        evidence.append({
            "type": "risk_analysis",
            "source": "risk_agent",
            "detail": f"Highest risk factor: {highest_risk.get('risk_level', 'unknown')} "
                       f"(score: {highest_risk.get('overall_risk_score', 0)})",
            "relevance": "high",
        })

    if telemetry_analysis and telemetry_analysis.get("laps_analyzed", 0) > 0:
        anomalies = telemetry_analysis.get("anomalies", [])
        evidence.append({
            "type": "telemetry_analysis",
            "source": "telemetry_agent",
            "detail": (
                f"Analyzed {telemetry_analysis['laps_analyzed']} laps. "
                f"Degradation rate: {telemetry_analysis.get('degradation_rate_pct', 0)}%. "
                + (f"Anomalies: {'; '.join(anomalies)}" if anomalies else "No anomalies detected.")
            ),
            "relevance": "medium",
        })

    return evidence


def summarize_evidence(evidence: List[Dict[str, Any]]) -> str:
    if not evidence:
        return "No supporting evidence available. Recommendation is based entirely on simulation."

    parts = []
    for e in evidence:
        parts.append(f"[{e.get('type', 'info')}] {e.get('detail', '')}")
    return " | ".join(parts)
