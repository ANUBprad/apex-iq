import json
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "drivers.json"

def get_driver(name: str):
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        drivers = json.load(f)

    for driver in drivers:
        if driver["name"].lower() == name.lower():
            aggression = driver.get("aggression", 0)
            tyre_management = driver.get("tyre_management", 0)
            overtaking = driver.get("overtaking", 0)
            wet_weather = driver.get("wet_weather", 0)

            return {
                "name": driver["name"],
                "team": driver.get("team"),
                "aggression": aggression,
                "tyre_management": tyre_management,
                "overtake_efficiency": driver.get("overtake_efficiency", overtaking),
                "wet_weather_skill": driver.get("wet_weather_skill", wet_weather),
                "consistency": driver.get(
                    "consistency",
                    round((tyre_management + wet_weather + aggression) / 3),
                ),
                "racecraft": driver.get(
                    "racecraft",
                    round((aggression + overtaking + wet_weather) / 3),
                ),
            }

    return None
