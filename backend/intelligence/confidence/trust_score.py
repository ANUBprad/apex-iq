"""Compute a trust score for the overall intelligence output."""

from typing import Dict, Any, Optional


_TRUST_DECAY_PER_ERROR = 0.15
_MIN_TRUST = 0.10


def compute_trust_score(
    confidence_metrics: Dict[str, Any],
    errors: list,
    historical_accuracy: Optional[float] = None,
) -> Dict[str, Any]:
    base = confidence_metrics.get("overall_score", 0.5)
    error_penalty = len(errors) * _TRUST_DECAY_PER_ERROR
    trust = max(_MIN_TRUST, base - error_penalty)

    if historical_accuracy is not None:
        trust = trust * 0.7 + historical_accuracy * 0.3

    level = "low"
    if trust >= 0.7:
        level = "high"
    elif trust >= 0.4:
        level = "medium"

    return {
        "trust_score": round(trust, 3),
        "level": level,
        "base_confidence": confidence_metrics.get("overall_score"),
        "error_penalty": round(error_penalty, 3),
        "historical_accuracy": historical_accuracy,
        "error_count": len(errors),
    }
