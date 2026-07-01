from backend.ml.strategy_engine import StrategyEngine
from backend.agents.race_engineer import RaceEngineer
from backend.simulation.strategy_simulator import StrategySimulator

engine = StrategyEngine()
race_engineer = RaceEngineer()
simulator = StrategySimulator(engine)

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

def run_strategy_comparison(data):
    traffic_info = engine.predict_traffic(data.gap_ahead, data.gap_behind, engine.get_pit_loss(data.circuit))
    fuel_needed = (data.fuel_burn_rate * data.laps_remaining)
    fuel_delta = (data.fuel_load - fuel_needed)

    result = simulator.simulate_all(
        compound=data.compound,
        tyre_age=data.tyre_age,
        circuit=data.circuit,
        laps_remaining=data.laps_remaining,
        weather=data.weather,
        traffic_status=traffic_info["traffic_status"],
        fuel_delta=fuel_delta
    )
    
    result["analysis"] = (race_engineer.explain_strategy_ranking(result))

    return result