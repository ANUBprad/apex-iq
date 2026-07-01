"""Dynamically allocate weights to signals based on context and data quality."""

from typing import Dict


_BASE_WEIGHTS = {
    "simulation": 0.30,
    "historical": 0.25,
    "telemetry": 0.15,
    "rag": 0.15,
    "oracle": 0.15,
}


def allocate_weights(
    circuit_known: bool = True,
    have_telemetry: bool = False,
    historical_density: str = "medium",
    weather_reliable: bool = True,
    telemetry_is_simulated: bool = True,
) -> Dict[str, float]:
    weights = dict(_BASE_WEIGHTS)

    if not circuit_known:
        weights["rag"] -= 0.05
        weights["simulation"] += 0.05

    if have_telemetry:
        weights["telemetry"] += 0.05
        weights["historical"] -= 0.05

    if historical_density == "high":
        weights["historical"] += 0.05
        weights["simulation"] -= 0.05
    elif historical_density == "low":
        weights["historical"] -= 0.08
        weights["simulation"] += 0.08

    if not weather_reliable:
        weights["simulation"] += 0.03
        weights["historical"] -= 0.03

    if telemetry_is_simulated:
        weights["telemetry"] -= 0.05
        weights["simulation"] += 0.05

    remaining = 1.0 - sum(weights.values())
    if abs(remaining) > 0.001:
        base_sum = sum(_BASE_WEIGHTS.values())
        for k in weights:
            weights[k] += remaining * (_BASE_WEIGHTS[k] / base_sum)

    return {k: round(v, 4) for k, v in weights.items()}
