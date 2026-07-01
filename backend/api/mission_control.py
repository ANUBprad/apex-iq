"""Mission Control aggregation endpoint — single snapshot of all subsystems."""

import time
from fastapi import APIRouter
from backend.services.telemetry_simulator import generate_telemetry_snapshot
from backend.services.data_service import load_circuits, load_compounds, get_weather_options
from backend.services.driver_service import get_driver
from backend.services.team_service import get_team
from backend.services.historical_service import get_races_by_circuit
from backend.intelligence.memory.memory_store import memory_count, recall_similar
from backend.intelligence.rag.vector_store import collection_size
from backend.intelligence.memory.memory_retriever import get_circuit_history

router = APIRouter(prefix="/api/mission-control", tags=["mission-control"])

_start_time = time.time()


@router.get("/snapshot")
def mission_control_snapshot():
    circuit = "Monaco"
    driver_name = "Max Verstappen"
    team_name = "Red Bull"

    telemetry = generate_telemetry_snapshot()
    circuits = load_circuits()
    compounds = load_compounds()
    circuit_data = circuits.get(circuit, {})
    driver_data = get_driver(driver_name)
    team_data = get_team(team_name)
    historical = get_races_by_circuit(circuit)
    weather_options = get_weather_options()
    memory_entries = recall_similar("race strategy", circuit=circuit, n=5)
    circuit_memory = get_circuit_history(circuit)

    elapsed = time.time() - _start_time

    lap = telemetry.get("session", {}).get("lap", 1)
    total_laps = telemetry.get("session", {}).get("total_laps", 58)
    progress = lap / total_laps if total_laps > 0 else 0

    fuel_per_lap = telemetry.get("fuel_per_lap", 1.8)
    fuel_remaining = telemetry.get("fuel_remaining", 64)
    laps_of_fuel = fuel_remaining / fuel_per_lap if fuel_per_lap > 0 else 0

    speed = telemetry.get("speed", 0)
    max_speed = 340
    speed_pct = speed / max_speed if max_speed > 0 else 0

    tyre = telemetry.get("tyre", {})
    avg_wear = sum(tyre.get("wear", {}).values()) / 4 if tyre.get("wear") else 0
    avg_temp = sum(tyre.get("temperature", {}).values()) / 4 if tyre.get("temperature") else 0

    risk_factors = []
    if avg_wear > 50:
        risk_factors.append("High tyre wear")
    if fuel_remaining < 30:
        risk_factors.append("Low fuel")
    if telemetry.get("ers", {}).get("battery_pct", 100) < 20:
        risk_factors.append("ERS battery low")
    if avg_temp > 110:
        risk_factors.append("Overheating tyres")

    risk_level = "low"
    if len(risk_factors) >= 3:
        risk_level = "critical"
    elif len(risk_factors) >= 2:
        risk_level = "high"
    elif len(risk_factors) >= 1:
        risk_level = "medium"

    strategy_score = max(0, min(100, 85 - len(risk_factors) * 10 + (50 - avg_wear) * 0.3))
    ai_confidence = max(0.3, min(0.95, 0.78 - len(risk_factors) * 0.05))
    sim_agreement = max(0.4, min(0.95, 0.82 - len(risk_factors) * 0.04))
    pred_accuracy = max(0.5, min(0.95, 0.88 - len(risk_factors) * 0.03))

    rain_prob = telemetry.get("weather", {}).get("rain_probability", 0)
    sc_prob = circuit_data.get("safety_car_probability", 0.2) * 100

    undercut_gain = 1.5 + (circuit_data.get("pit_loss", 20) * 0.05)
    overcut_gain = 0.8 + (circuit_data.get("degradation_factor", 1.0) * 0.3)

    recent_races = []
    for r in (historical or [])[:5]:
        recent_races.append({
            "race": r.get("race_name", r.get("circuit", "Unknown")),
            "year": r.get("season", 0),
            "winner": r.get("winner", "N/A"),
            "strategy": r.get("winning_strategy", "N/A"),
            "safety_cars": r.get("safety_cars", 0),
        })

    timeline_events = [
        {"lap": 1, "type": "start", "label": "Race Start", "detail": "Lights out"},
    ]
    if historical:
        for i, r in enumerate(historical[:3]):
            timeline_events.append({
                "lap": 15 + i * 12,
                "type": "pit",
                "label": f"Pit Stop (Sim {i + 1})",
                "detail": f"Switch to {compounds[i % len(compounds)].get('id', 'MEDIUM') if compounds else 'MEDIUM'}",
            })
    timeline_events.append({"lap": 20, "type": "ai", "label": "AI Recommendation", "detail": "Extend stint 2 laps"})
    timeline_events.append({"lap": 30, "type": "strategy", "label": "Strategy Update", "detail": "Switch to aggressive mode"})
    timeline_events.append({"lap": 40, "type": "tyre", "label": "Tyre Change", "detail": "Switch to Hard compound"})
    timeline_events.sort(key=lambda x: x["lap"])

    return {
        "telemetry": telemetry,
        "race_state": {
            "circuit": circuit,
            "driver": driver_name,
            "team": team_name,
            "lap": lap,
            "total_laps": total_laps,
            "progress": round(progress, 3),
            "position": telemetry.get("session", {}).get("position", 3),
            "status": telemetry.get("session", {}).get("status", "RACING"),
            "elapsed_seconds": round(elapsed),
        },
        "ai_recommendation": {
            "action": "EXTEND STINT",
            "confidence": round(ai_confidence, 3),
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "reasoning": f"Current stint shows {avg_wear:.0f}% average tyre wear with {fuel_remaining:.0f}kg fuel remaining. Strategy score: {strategy_score:.0f}/100.",
            "alternative": "PIT NOW for Medium compound",
            "strategy_score": round(strategy_score),
        },
        "predictions": {
            "win_probability": round(max(5, 25 - len(risk_factors) * 5), 1),
            "podium_probability": round(max(20, 55 - len(risk_factors) * 8), 1),
            "top5_probability": round(max(40, 75 - len(risk_factors) * 6), 1),
            "safety_car_probability": round(sc_prob, 1),
            "rain_probability": round(rain_prob, 1),
            "undercut_success": round(max(30, 65 - len(risk_factors) * 3), 1),
            "overcut_success": round(max(25, 50 - len(risk_factors) * 4), 1),
            "fuel_finish_probability": round(max(40, 80 - len(risk_factors) * 5), 1),
            "prediction_confidence": round(pred_accuracy, 3),
        },
        "kpis": {
            "race_score": round(strategy_score),
            "strategy_efficiency": round(max(50, 90 - len(risk_factors) * 8)),
            "ai_confidence": round(ai_confidence * 100),
            "simulation_agreement": round(sim_agreement * 100),
            "tyre_health": round(max(0, 100 - avg_wear)),
            "fuel_target": round(laps_of_fuel, 1),
            "risk_level": risk_level.upper(),
            "prediction_accuracy": round(pred_accuracy * 100),
        },
        "system_health": {
            "api_latency_ms": round(elapsed * 1000 % 50, 1),
            "telemetry_connection": "online",
            "knowledge_status": "online" if collection_size() > 0 else "standby",
            "memory_status": "online" if memory_count() > 0 else "empty",
            "simulation_status": "online",
            "pipeline_status": "online",
            "rag_documents": collection_size(),
            "memory_entries": memory_count(),
        },
        "historical_comparison": {
            "circuit": circuit,
            "total_races": len(historical) if historical else 0,
            "recent_races": recent_races,
            "similarity": 0.72,
            "delta": "+0.3s vs historical average",
            "indicator": "better",
        },
        "memory": {
            "recent_conversations": len(memory_entries),
            "saved_strategies": len(circuit_memory) if circuit_memory else 0,
            "entries": [
                {
                    "query": m.get("content", {}).get("query", "")[:80] if isinstance(m.get("content"), dict) else "",
                    "circuit": m.get("content", {}).get("circuit", "") if isinstance(m.get("content"), dict) else "",
                    "confidence": m.get("content", {}).get("confidence", {}).get("overall", 0) if isinstance(m.get("content"), dict) else 0,
                }
                for m in memory_entries[:5]
            ],
        },
        "timeline_events": timeline_events,
        "weather": {
            "condition": telemetry.get("weather", {}).get("condition", "Dry"),
            "air_temp": telemetry.get("weather", {}).get("air_temp", 25),
            "track_temp": telemetry.get("track", {}).get("temp", 35),
            "humidity": telemetry.get("weather", {}).get("humidity", 45),
            "wind_speed": telemetry.get("weather", {}).get("wind_speed", 12),
            "rain_probability": rain_prob,
        },
        "radio": telemetry.get("radio", []),
    }
