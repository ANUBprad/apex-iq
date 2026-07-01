"""Assess risk factors for each strategy option."""

from typing import Dict, Any


_SAFETY_CAR_RISK = {
    "monaco": 0.35,
    "baku": 0.30,
    "singapore": 0.28,
    "australia": 0.22,
    "hungary": 0.20,
    "default": 0.15,
}

_WEATHER_RISK = {
    "wet": 0.40,
    "mixed": 0.30,
    "dry": 0.05,
}


def assess_strategy_risk(
    circuit: str,
    tyre_compound: str,
    pit_stop_lap: int,
    total_laps: int,
    weather: str = "dry",
    overtaking_difficulty: float = 0.5,
    safety_car_probability: float = -1,
) -> Dict[str, Any]:
    circuit_lower = circuit.lower().strip()
    sc_risk = (
        safety_car_probability
        if safety_car_probability >= 0
        else _SAFETY_CAR_RISK.get(circuit_lower, _SAFETY_CAR_RISK["default"])
    )
    weather_risk = _WEATHER_RISK.get(weather, _WEATHER_RISK["dry"])
    overtaking_risk = overtaking_difficulty * 0.3
    pit_timing_risk = 0.0
    if pit_stop_lap < total_laps * 0.15:
        pit_timing_risk = 0.2
    elif pit_stop_lap > total_laps * 0.85:
        pit_timing_risk = 0.15
    else:
        pit_timing_risk = 0.05

    if tyre_compound == "soft":
        tyre_risk = 0.25
    elif tyre_compound == "medium":
        tyre_risk = 0.12
    else:
        tyre_risk = 0.06

    overall = (
        sc_risk * 0.25
        + weather_risk * 0.25
        + overtaking_risk * 0.15
        + pit_timing_risk * 0.20
        + tyre_risk * 0.15
    )

    factors = [
        {"name": "safety_car", "value": round(sc_risk, 3), "weight": 0.25},
        {"name": "weather", "value": round(weather_risk, 3), "weight": 0.25},
        {"name": "overtaking_difficulty", "value": round(overtaking_risk, 3), "weight": 0.15},
        {"name": "pit_timing", "value": round(pit_timing_risk, 3), "weight": 0.20},
        {"name": "tyre_durability", "value": round(tyre_risk, 3), "weight": 0.15},
    ]

    level = "low"
    if overall > 0.3:
        level = "medium"
    if overall > 0.5:
        level = "high"
    if overall > 0.7:
        level = "critical"

    return {
        "overall_risk_score": round(overall, 3),
        "risk_level": level,
        "factors": factors,
        "circuit": circuit,
        "weather": weather,
        "tyre_compound": tyre_compound,
    }
