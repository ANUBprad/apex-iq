import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

def load_circuits():
    with open(DATA_DIR / "circuits.json", "r", encoding="utf-8") as f:
        return json.load(f)

def load_compounds():
    with open(DATA_DIR / "compounds.json", "r", encoding="utf-8") as f:
        return json.load(f)

def load_drivers():
    with open(DATA_DIR / "drivers.json", "r", encoding="utf-8") as f:
        return json.load(f)

def load_teams():
    with open(DATA_DIR / "teams.json", "r", encoding="utf-8") as f:
        return json.load(f)

def get_degradation_curve(compound: str = "MEDIUM"):
    rates = {"SOFT": 3.5, "MEDIUM": 1.8, "HARD": 1.1, "INTER": 4.2, "WET": 5.0}
    base = {"SOFT": 100, "MEDIUM": 100, "HARD": 100, "INTER": 95, "WET": 92}
    rate = rates.get(compound, 1.8)
    b = base.get(compound, 100)
    return [
        {"lap": i + 1, "grip": max(20, round(b - i * rate, 1))}
        for i in range(30)
    ]

def get_knowledge_articles():
    return [
        {
            "id": "ART-001",
            "title": "Monaco 2024: Precision Over Power",
            "circuit": "Monaco",
            "type": "race_analysis",
            "date": "2024-05-26",
            "summary": "Leclerc's masterclass in tyre management secured victory through strategic undercut and defensive driving through the tunnel.",
            "source": "historical_races",
        },
        {
            "id": "ART-002",
            "title": "Silverstone Degradation Patterns in High-Speed Corners",
            "circuit": "Silverstone",
            "type": "tyre_analysis",
            "date": "2024-07-07",
            "summary": "High-speed corners at Silverstone accelerate tyre degradation by 22% compared to medium-speed tracks. Teams favouring two-stop strategies gained 0.4s per lap in final stint.",
            "source": "tyre_models",
        },
        {
            "id": "ART-003",
            "title": "Safety Car Probability at Street Circuits",
            "circuit": "Singapore",
            "type": "safety_car",
            "date": "2024-09-15",
            "summary": "Street circuits show 63% higher safety car probability. Singapore leads with a 78% chance based on historical data from 2014-2024.",
            "source": "historical_races",
        },
        {
            "id": "ART-004",
            "title": "Undercut Effectiveness at Monza",
            "circuit": "Monza",
            "type": "strategy",
            "date": "2024-09-01",
            "summary": "Monza's long pit straight amplifies undercut effectiveness. Average gain of 2.3s when executing undercut within 2 laps of tyre change window.",
            "source": "circuits",
        },
        {
            "id": "ART-005",
            "title": "Wet Race Strategy: 2024 Brazilian GP Analysis",
            "circuit": "Interlagos",
            "type": "weather",
            "date": "2024-11-03",
            "summary": "Intermittent rain at Interlagos created 5 distinct strategy windows. Teams adapting tyre choices within 3 laps of weather change gained average 4.7 positions.",
            "source": "weather_models",
        },
        {
            "id": "ART-006",
            "title": "Fuel Load Impact on Lap Time at Bahrain",
            "circuit": "Bahrain",
            "type": "fuel_analysis",
            "date": "2024-03-02",
            "summary": "Each 10kg of fuel adds 0.32s per lap at Bahrain. Optimizing fuel load vs stint length critical for undercut defense.",
            "source": "telemetry",
        },
        {
            "id": "ART-007",
            "title": "Alternative Strategy Success: Suzuka 2024",
            "circuit": "Suzuka",
            "type": "strategy",
            "date": "2024-04-07",
            "summary": "Three-stop strategy outperformed two-stop by 8.2 seconds in Suzuka's high-degradation conditions. Aggressive tyre management was key.",
            "source": "historical_races",
        },
        {
            "id": "ART-008",
            "title": "Tyre Crossover Points: When to Switch Compounds",
            "circuit": "Spa",
            "type": "tyre_analysis",
            "date": "2024-07-28",
            "summary": "Optimal crossover lap from Soft to Medium at Spa is lap 14 (2-stop) or lap 22 (1-stop). Degradation cliff at 65% wear threshold.",
            "source": "tyre_models",
        },
    ]

def get_weather_options():
    return ["Dry", "Light Rain", "Heavy Rain", "Changeable"]
