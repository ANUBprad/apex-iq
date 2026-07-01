import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel
from random import gauss

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("apexiq")

from backend.schemas import StrategyInput

from backend.core_services import (
    run_strategy,
    run_simulation,
    run_strategy_comparison,
)

from backend.services.historical_service import get_races_by_circuit
from backend.services.historical_comparison import compare_strategy
from backend.services.pit_accuracy import analyze_pit_accuracy
from backend.services.driver_service import get_driver
from backend.services.team_service import get_team
from backend.services.replay_intelligence import analyze_replay_lap
from backend.services.strategy_learning import (store_scenario, analyze_similar_cases)
from backend.services.ai_strategy_core import compute_ai_strategy
from backend.services.data_service import (
    load_circuits, load_compounds,
    get_degradation_curve, get_knowledge_articles, get_weather_options,
)

from backend.app.api.v2.endpoints.dashboard import router as dashboard_v2_router
from backend.app.api.v2.endpoints.simulations import router as simulations_v2_router
from backend.api.intelligence import router as intelligence_v3_router
from backend.api.ai_engineer import router as ai_engineer_router
from backend.api.mission_control import router as mission_control_router
APP_VERSION = "4.5.0"
APP_BUILD = "2025-Q2"

app = FastAPI(title="F1 AI Race Engineer API", version=APP_VERSION)

from backend.middleware import APITimingMiddleware
app.add_middleware(APITimingMiddleware)


@app.on_event("startup")
def startup_warmup():
    import threading as _t
    from backend.intelligence.rag.embedding_service import warmup as _w
    _t.Thread(target=_w, daemon=True).start()
app.include_router(dashboard_v2_router, prefix="/api/v2/dashboard", tags=["Dashboard V2"])
app.include_router(simulations_v2_router, prefix="/api/v2/simulations", tags=["Simulations V2"])
app.include_router(intelligence_v3_router)
app.include_router(ai_engineer_router)
app.include_router(mission_control_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:80,http://localhost:8080,http://127.0.0.1:3000",
    ).split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Response-Time"],
)


@app.get("/")
def home():
    return {"message": "API is running"}


from datetime import datetime, timezone

import threading
import time as time_module
_start_time = time_module.time()


@app.get("/health")
def health():
    elapsed = time_module.time() - _start_time
    return {
        "status": "healthy",
        "version": APP_VERSION,
        "build": APP_BUILD,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": round(elapsed, 2),
        "environment": os.getenv("ENVIRONMENT", "development"),
    }

@app.get("/circuits")
def circuits():
    return load_circuits()

@app.get("/race-order")
def race_order():
    return {
        "drivers": [
            {"position": 1, "name": "Max Verstappen", "gap": "0.0s", "lap": 1},
            {"position": 2, "name": "Lewis Hamilton", "gap": "+1.2s", "lap": 1},
            {"position": 3, "name": "Charles Leclerc", "gap": "+2.8s", "lap": 1},
            {"position": 4, "name": "Lando Norris", "gap": "+3.5s", "lap": 1},
            {"position": 5, "name": "Carlos Sainz", "gap": "+4.9s", "lap": 1},
            {"position": 6, "name": "George Russell", "gap": "+5.7s", "lap": 1},
            {"position": 7, "name": "Sergio Perez", "gap": "+6.8s", "lap": 1},
            {"position": 8, "name": "Fernando Alonso", "gap": "+7.4s", "lap": 1},
            {"position": 9, "name": "Oscar Piastri", "gap": "+8.2s", "lap": 1},
            {"position": 10, "name": "Pierre Gasly", "gap": "+9.1s", "lap": 1},
        ]
    }

@app.get("/compounds")
def compounds():
    return load_compounds()

@app.get("/weather-options")
def weather_options():
    return get_weather_options()

@app.get("/degradation/{compound}")
def degradation_curve(compound: str):
    return get_degradation_curve(compound)

@app.get("/knowledge/articles")
def knowledge_articles():
    return get_knowledge_articles()

@app.get("/pipeline-health")
def pipeline_health():
    return {
        "components": [
            {"label": "Query Router", "value": 98, "desc": "Routes to appropriate agents based on intent classification", "color": "bg-[#E10600]"},
            {"label": "Knowledge Retrieval", "value": 92, "desc": "ChromaDB vector store with hybrid search and reranking", "color": "bg-[#00C8FF]"},
            {"label": "Simulation Engine", "value": 95, "desc": "Monte Carlo with weather, fuel, tyre, and traffic modelling", "color": "bg-[#00FF85]"},
            {"label": "Confidence Scoring", "value": 87, "desc": "Multi-signal: RAG, simulation, historical, telemetry", "color": "bg-[#FFD400]"},
            {"label": "Memory Store", "value": 91, "desc": "Persistent ChromaDB-backed with outcome tracking", "color": "bg-[#A855F7]"},
            {"label": "Recommendation", "value": 89, "desc": "Aggregated decision with explainability chain", "color": "bg-[#FF8A00]"},
        ]
    }

@app.get("/status")
def status():
    return {
        "api": "online",
        "version": APP_VERSION,
        "build": APP_BUILD,
        "memory": None,
        "rag_available": True,
    }

@app.get("/version")
def version():
    return {
        "version": APP_VERSION,
        "build": APP_BUILD,
        "name": "APEXiq Strategy OS",
        "description": "Real-time F1 strategy intelligence engine",
        "python_version": __import__("sys").version,
    }


@app.get("/metrics")
def metrics():
    elapsed = time_module.time() - _start_time
    # Dynamically enumerate all registered API routes
    endpoints = sorted(set(
        r.path for r in app.routes
        if hasattr(r, "path") and not r.path.startswith("/openapi")
        and not r.path.startswith("/docs") and not r.path.startswith("/redoc")
    ))
    return {
        "uptime_seconds": round(elapsed, 2),
        "version": APP_VERSION,
        "build": APP_BUILD,
        "python_version": __import__("sys").version,
        "endpoints": endpoints,
        "memory_mb": None,
    }


@app.post("/strategy")
def get_strategy(data: StrategyInput):
    return run_strategy(data)


@app.post("/simulate")
def simulate(data: StrategyInput):
    return run_simulation(data)


@app.post("/strategy-comparison")
def strategy_comparison(data: StrategyInput):
    return run_strategy_comparison(data)

class ScenarioRequest(BaseModel):
    scenario: str
    compound: str
    tyre_age: int
    circuit: str
    gap_ahead: float
    gap_behind: float

@app.post("/scenario-analysis")
def scenario_analysis(data: ScenarioRequest):
    scenario = data.scenario

    if scenario == "Safety Car in 5 laps":
        return {
            "scenario": scenario,
            "recommendation": "STAY OUT",
            "advantage": 7.2,
            "confidence": 92,
            "reasoning": "Pit loss likely reduced under Safety Car conditions."
        }

    if scenario == "Virtual Safety Car":
        return {
            "scenario": scenario,
            "recommendation": "PIT NOW",
            "advantage": 5.8,
            "confidence": 86,
            "reasoning": "Reduced pit delta during VSC."
        }

    if scenario == "Light Rain":
        return {
            "scenario": scenario,
            "recommendation": "EXTEND STINT",
            "advantage": 4.1,
            "confidence": 80,
            "reasoning": "Track conditions may improve before crossover."
        }

    if scenario == "Heavy Rain":
        return {
            "scenario": scenario,
            "recommendation": "PIT FOR INTERS",
            "advantage": 10.4,
            "confidence": 95,
            "reasoning": "Heavy rain requires immediate tyre adaptation."
        }

    if scenario == "High Tyre Degradation":
        return {
            "scenario": scenario,
            "recommendation": "UNDERCUT",
            "advantage": 6.5,
            "confidence": 88,
            "reasoning": "Tyre performance cliff approaching."
        }

    return {
        "scenario": scenario,
        "recommendation": "SAVE FUEL",
        "advantage": 3.0,
        "confidence": 82,
        "reasoning": "Fuel conservation required to reach finish."
    }

@app.post("/safety-car-analysis")
def safety_car_analysis(data: StrategyInput):
    pit_now_gain = max(0, 25 - data.gap_behind * 2)
    pit_under_sc_gain = pit_now_gain + 6
    recommendation = ("WAIT_FOR_SC" if pit_under_sc_gain > pit_now_gain else "PIT_NOW")
    confidence = 92

    return {
        "pit_now_gain": round(pit_now_gain, 2),
        "pit_under_sc_gain": round(pit_under_sc_gain, 2),
        "delta": round(pit_under_sc_gain - pit_now_gain, 2),
        "recommendation": recommendation,
        "confidence": confidence,
    }

@app.post("/rain-strategy")
def rain_strategy(data: StrategyInput):
    rain_probability = data.rain_probability
    expected_lap = max(5, 30 - int(rain_probability / 4))
    crossover_lap = expected_lap + 2

    if rain_probability >= 70:
        compound = "INTERMEDIATE"
    elif rain_probability >= 40:
        compound = "WATCH CONDITIONS"
    else:
        compound = "STAY SLICKS"

    confidence = min(95, 60 + rain_probability // 2)

    return {
        "rain_probability": rain_probability,
        "expected_lap": expected_lap,
        "crossover_lap": crossover_lap,
        "recommended_compound": compound,
        "confidence": confidence,
    }

@app.post("/monte-carlo")
def monte_carlo(data: StrategyInput):
    simulations = []
    base_position = 3

    for _ in range(1000):
        variation = gauss(0, 2)
        finish = max(1,round(base_position + variation))
        simulations.append(finish)

    win_probability = (len([x for x in simulations if x == 1])/ len(simulations)) * 100
    podium_probability = (len([x for x in simulations if x <= 3]) / len(simulations)) * 100
    average_finish = (sum(simulations) / len(simulations))

    pos_dist = []
    for pos in range(1, 21):
        count = simulations.count(pos)
        pos_dist.append({"position": pos, "frequency": count})

    return {
        "win_probability": round(win_probability,1),
        "podium_probability": round(podium_probability, 1),
        "average_finish": round(average_finish, 1),
        "best_case": min(simulations),
        "worst_case": max(simulations),
        "simulations": len(simulations),
        "position_distribution": pos_dist,
    }

@app.post("/race-outcome")
def race_outcome(data: StrategyInput):
    projected_finish = "P2"
    overtake_probability = min(95, max(5, 50 + (data.gap_ahead * -3)))
    pit_risk = min(100, max(5, data.tyre_age * 2))
    podium_probability = max(20, 85 - pit_risk * 0.3)
    championship_points = 18

    return {
        "projected_finish": projected_finish,
        "podium_probability": round(podium_probability, 1),
        "overtake_probability": round(overtake_probability, 1),
        "pit_risk": round(pit_risk, 1),
        "championship_points": championship_points,
    }

@app.get("/historical/{circuit}")
def historical_races(circuit: str):
    return get_races_by_circuit(circuit)

@app.get("/historical-comparison/{circuit}/{strategy}")
def historical_comparison(circuit: str, strategy: str):
    return compare_strategy(circuit, strategy)

@app.get("/pit-accuracy/{circuit}/{lap}")
def pit_accuracy(circuit: str, lap: int):
    return analyze_pit_accuracy(circuit, lap)

@app.get("/drivers")
def list_drivers():
    from backend.services.data_service import load_drivers
    return load_drivers()

@app.get("/driver/{name}")
def driver_profile(name: str):
    return get_driver(name)

@app.get("/teams")
def list_teams():
    from backend.services.data_service import load_teams
    return load_teams()

@app.get("/team/{team}")
def team_dna(team: str):
    return get_team(team)

@app.get("/replay-intelligence/{lap}/{total_laps}")
def replay_intelligence(lap: int, total_laps: int):
    return analyze_replay_lap(lap, total_laps)

@app.post("/learning/store")
def learning_store(payload: dict):
    return store_scenario(
        payload["circuit"],
        payload["tyre"],
        payload["lap"],
        payload["strategy"],
        payload["outcome"],
    )

@app.get("/learning/{circuit}/{tyre}")
def learning_cases(circuit: str, tyre: str):
    return analyze_similar_cases(circuit, tyre)

@app.post("/ai-strategy-core")
def ai_strategy_core(payload: dict):
    driver_name = payload.get("driver")
    team_name = payload.get("team")
    driver_data = get_driver(driver_name) if driver_name else None
    team_data = get_team(team_name) if team_name else None
    comp = payload.get("comparison", {})
    comparison = {
        "recommended": comp.get("base", comp.get("recommended", "underCut")),
        "strategy_risk": comp.get("strategy_risk", 5),
    }
    return compute_ai_strategy(
        payload["strategy"],
        comparison,
        driver_data,
        team_data,
        payload.get("learning"),
        payload.get("safety_car"),
        payload.get("weather"),
    )


# ─── Telemetry Endpoints ──────────────────────────────────────────────────

from backend.services.telemetry_simulator import generate_telemetry_snapshot, get_telemetry_history


@app.get("/api/telemetry/live")
def telemetry_live():
    return generate_telemetry_snapshot()


@app.get("/api/telemetry/history")
def telemetry_history(count: int = 60):
    return get_telemetry_history(count)