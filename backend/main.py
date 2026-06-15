from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from random import gauss

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

app = FastAPI(title="F1 AI Race Engineer API", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/")
def home():
    return {"message": "API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


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

    return {
        "win_probability": round(win_probability,1),
        "podium_probability": round(podium_probability, 1),
        "average_finish": round(average_finish, 1),
        "best_case": min(simulations),
        "worst_case": max(simulations),
        "simulations": len(simulations),
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

@app.get("/driver/{name}")
def driver_profile(name: str):
    return get_driver(name)

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
    return compute_ai_strategy(
        payload["strategy"],
        payload["comparison"],
        payload.get("driver"),
        payload.get("team"),
        payload.get("learning"),
        payload.get("safety_car"),
        payload.get("weather"),
    )