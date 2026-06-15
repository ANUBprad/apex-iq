import json
from pathlib import Path

MEMORY_FILE = Path("data/scenario_memory.json")

def load_memory():
    if not MEMORY_FILE.exists():
        return []
    with open(MEMORY_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_memory(memory):
    with open(MEMORY_FILE, "w", encoding="utf-8") as f:
        json.dump(memory, f, indent=2)

def store_scenario(circuit, tyre, lap, strategy, outcome):
    memory = load_memory()
    memory.append({
        "circuit": circuit,
        "tyre": tyre,
        "lap": lap,
        "strategy": strategy,
        "outcome": outcome,
    })
    save_memory(memory)
    return {"stored": True, "total_cases": len(memory)}

def find_similar(circuit, tyre):
    memory = load_memory()
    matches = [item for item in memory if item["circuit"] == circuit and item["tyre"] == tyre]
    return matches

def analyze_similar_cases(circuit, tyre):
    matches = find_similar(circuit, tyre)
    total = len(matches)
    if total == 0:
        return {"cases": 0, "success_rate": 0, "recommended": "NO DATA"}

    successes = len([x for x in matches if x["outcome"] == "SUCCESS"])
    success_rate = round(successes / total * 100, 1)

    recommendation = ("FOLLOW HISTORICAL TREND" if success_rate > 60 else "CAUTION")
    return {"cases": total, "success_rate": success_rate, "recommended": recommendation}