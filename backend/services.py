import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from ml.strategy_engine import StrategyEngine

engine = StrategyEngine()

def run_strategy(data):
    result = engine.decide(
        compound=data.compound,
        tyre_age=data.tyre_age,
        circuit=data.circuit,
        gap_ahead=data.gap_ahead,
        gap_behind=data.gap_behind,
    )

    return {
        "action": result["action"],
        "confidence": float(result["confidence"]),
        "reasoning": result.get("reasoning", "")
    }

def run_simulation(data):
    sim = engine.simulate_strategy_options(
        compound=data.compound,
        tyre_age=data.tyre_age,
        circuit=data.circuit,
        gap_ahead=data.gap_ahead,
    )

    return {
        "stay_out_loss": sim["stay_out_loss"],
        "pit_loss": sim["pit_loss"],
        "undercut_gain": sim["undercut_gain"],
        "undercut_possible": sim["undercut_gain"] > data.gap_ahead,
    }