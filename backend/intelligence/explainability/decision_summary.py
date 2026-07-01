"""Generate a human-readable summary of the decision process."""

from typing import Dict, Any


def generate_summary(
    query: str,
    circuit: str,
    recommendation: Dict[str, Any],
    confidence: Dict[str, Any],
    trust_score: Dict[str, Any],
    reasoning_chain: list,
    evidence: list,
) -> Dict[str, Any]:
    rec = recommendation.get("recommendation", {})
    strategy = rec.get("strategy", "N/A")
    expected_finish = rec.get("expected_finish", "N/A")
    risk_level = rec.get("risk_level", "unknown")
    confidence_level = confidence.get("level", "unknown")
    trust_level = trust_score.get("level", "unknown")

    short = (
        f"'{query}' - Recommended: {strategy}. "
        f"Expected P{expected_finish}. "
        f"Risk: {risk_level}. "
        f"Confidence: {confidence_level}. "
        f"Trust: {trust_level}."
    )

    total_steps = len(reasoning_chain)
    evidence_count = len(evidence)

    return {
        "query": query,
        "circuit": circuit,
        "short_summary": short,
        "reasoning_steps": total_steps,
        "evidence_items": evidence_count,
        "pipeline_depth_description": f"{total_steps}-step reasoning chain with {evidence_count} supporting evidence items",
        "pipeline_depth": total_steps,
        "status": "complete",
        "detail": reasoning_chain,
        "evidence": evidence,
    }
