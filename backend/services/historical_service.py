import json
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "historical" / "races.json"

def load_historical_races():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def get_races_by_circuit(circuit: str):
    races = load_historical_races()
    return [race for race in races if race["circuit"].lower() == circuit.lower()]