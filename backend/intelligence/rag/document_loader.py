"""Load and parse knowledge documents from CSV and JSON sources."""

import csv
import json
import os
from typing import List, Dict, Any
from dataclasses import dataclass
from backend.intelligence.config import DATA_DIR


@dataclass
class KnowledgeDocument:
    id: str
    content: str
    metadata: Dict[str, Any]
    source: str


def _load_csv(path: str) -> List[Dict[str, str]]:
    if not os.path.exists(path):
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def load_historical_races() -> List[KnowledgeDocument]:
    path = os.path.join(DATA_DIR, "training_data.csv")
    docs = []
    for row in _load_csv(path):
        content = (
            f"Circuit: {row.get('circuit', 'unknown')}. "
            f"Season: {row.get('season', 'N/A')}. "
            f"Winner: {row.get('winner', 'N/A')}. "
            f"Winning strategy: {row.get('winning_strategy', 'N/A')}. "
            f"Pit stop lap: {row.get('pit_stop_lap', 'N/A')}. "
            f"Safety cars: {row.get('safety_cars', '0')}. "
            f"Weather: {row.get('weather', 'dry')}. "
            f"Total laps: {row.get('total_laps', 'N/A')}. "
            f"Average pace: {row.get('average_pace', 'N/A')}."
        )
        uid = f"historical_{row.get('season', '0')}_{row.get('circuit', 'unknown')}"
        docs.append(KnowledgeDocument(
            id=uid,
            content=content,
            metadata={
                "type": "historical_race",
                "circuit": row.get("circuit", ""),
                "season": row.get("season", ""),
                "winner": row.get("winner", ""),
                "weather": row.get("weather", ""),
                "strategy": row.get("winning_strategy", ""),
            },
            source="training_data.csv",
        ))
    return docs


def load_circuits() -> List[KnowledgeDocument]:
    path = os.path.join(DATA_DIR, "circuits.json")
    if not os.path.exists(path):
        return []
    with open(path) as f:
        circuits = json.load(f)
    docs = []
    for name, data in circuits.items():
        content = (
            f"Circuit: {name}. "
            f"Pit loss: {data.get('pit_loss', 'N/A')}s. "
            f"Degradation factor: {data.get('degradation_factor', 'N/A')}. "
            f"Overtaking difficulty: {data.get('overtaking_difficulty', 'N/A')}/10. "
            f"Safety car probability: {data.get('safety_car_probability', 'N/A')}."
        )
        docs.append(KnowledgeDocument(
            id=f"circuit_{name.lower().replace(' ', '_')}",
            content=content,
            metadata={"type": "circuit", "name": name},
            source="circuits.json",
        ))
    return docs


def load_all_documents() -> List[KnowledgeDocument]:
    docs = []
    docs.extend(load_historical_races())
    docs.extend(load_circuits())
    return docs
