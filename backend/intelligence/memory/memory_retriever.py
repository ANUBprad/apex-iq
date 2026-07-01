"""Retrieve relevant past recommendations from strategy memory."""

from typing import Dict, Any, Optional, List
from backend.intelligence.memory.memory_store import recall_similar


def get_past_recommendations(
    query: str,
    circuit: Optional[str] = None,
    n: int = 3,
) -> Dict[str, Any]:
    entries = recall_similar(query, circuit=circuit, n=n)
    if not entries:
        return {"status": "no_memory", "entries": []}

    return {
        "status": "found",
        "entries": [
            {
                "id": e["id"],
                "circuit": e["metadata"].get("circuit", ""),
                "timestamp": e["metadata"].get("timestamp", ""),
                "strategy_name": e["content"].get("strategy_name", ""),
                "recommendation": e["content"].get("recommendation", {}),
                "confidence": e["content"].get("confidence", {}),
                "outcome": e["content"].get("outcome"),
                "similarity_score": e["score"],
            }
            for e in entries
        ],
    }


def get_circuit_history(circuit: str, n: int = 10) -> List[Dict[str, Any]]:
    entries = recall_similar(circuit, circuit=circuit, n=n)
    return [
        {
            "id": e["id"],
            "circuit": e["metadata"].get("circuit", ""),
            "timestamp": e["metadata"].get("timestamp", ""),
            "strategy_name": e["content"].get("strategy_name", ""),
            "recommendation": e["content"].get("recommendation", {}),
            "confidence": e["content"].get("confidence", {}),
            "outcome": e["content"].get("outcome"),
        }
        for e in entries
    ]
