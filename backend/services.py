import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from ml.strategy_engine import StrategyEngine
from agents.race_engineer import RaceEngineer

engine = StrategyEngine()
race_engineer = RaceEngineer()

def run_strategy(data):
    result = engine.decide(
        compound=data.compound,
        tyre_age=data.tyre_age,

        circuit=data.circuit,

        gap_ahead=data.gap_ahead,
        gap_behind=data.gap_behind,

        track_temp=data.track_temp,
        air_temp=data.air_temp,

        rain_probability=data.rain_probability,
        weather=data.weather,

        fuel_load=data.fuel_load,
        fuel_burn_rate=data.fuel_burn_rate,
        laps_remaining=data.laps_remaining
    )

    briefing = race_engineer.generate_briefing(result)

    return {
    "action": result["action"],
    "confidence": float(result["confidence"]),
    "reasoning": result["reasoning"],

    "engine_briefing": briefing,

    "fuel_delta": result["fuel_delta"],
    "fuel_needed": result["fuel_needed"],
    "fuel_status": result["fuel_status"],

    "traffic_status": result["traffic_status"],
    "traffic_risk": result["traffic_risk"],

    "optimal_pit_lap": result["optimal_pit_lap"],
    "pit_window_score": result["pit_window_score"],
    "pit_window_analysis": result["pit_window_analysis"]
}

def run_simulation(data):
    sim = engine.simulate_strategy_options(
        compound=data.compound,
        tyre_age=data.tyre_age,
        circuit=data.circuit,
        gap_ahead=data.gap_ahead,   
    )

    return {
        "stay_out_loss": float(sim["stay_out_loss"]),
        "pit_loss": float(sim["pit_loss"]),
        "undercut_gain": float(sim["undercut_gain"]),
        "undercut_possible": bool(float(sim["undercut_gain"]) > data.gap_ahead),
    }