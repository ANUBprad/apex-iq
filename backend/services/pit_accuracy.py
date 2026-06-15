from backend.services.historical_service import get_races_by_circuit

def analyze_pit_accuracy(circuit: str, lap: int):
    races = get_races_by_circuit(circuit)
    valid_races = [r for r in races if "pit_stop_lap" in r]

    if not valid_races:
        return {
            "circuit": circuit,
            "predicted_lap": lap,
            "historical_average": None,
            "difference": None,
            "accuracy": 0,
            "message": "No pit stop data available"
        }

    historical_avg = (sum(r["pit_stop_lap"] for r in valid_races) / len(valid_races))
    delta = abs(lap - historical_avg)
    accuracy = max(0, 100 - delta * 5)

    return {
        "circuit": circuit,
        "predicted_lap": lap,
        "historical_average": round(historical_avg, 1),
        "difference": round(delta, 1),
        "accuracy": round(accuracy, 1),
    }
