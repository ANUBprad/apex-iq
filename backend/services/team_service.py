import json
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "teams.json"

def get_team(team_name: str):
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        teams = json.load(f)

    for team in teams:
        if team["name"].lower() == team_name.lower():
            return team
    return None