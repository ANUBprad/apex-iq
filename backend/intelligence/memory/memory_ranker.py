"""Rank memory entries by relevance, recency, and outcome success."""

from typing import List, Dict, Any
from datetime import datetime, timezone


def _hours_ago(ts_str: str) -> float:
    try:
        ts = datetime.fromisoformat(ts_str)
        now = datetime.now(timezone.utc)
        diff = now - ts
        return diff.total_seconds() / 3600
    except (ValueError, TypeError, AttributeError):
        return 999.0


def rank_entries(
    entries: List[Dict[str, Any]],
    boost_recent: bool = True,
    boost_good_outcomes: bool = True,
) -> List[Dict[str, Any]]:
    if not entries:
        return []

    scored = []
    for e in entries:
        score = 1.0 - e.get("similarity_score", 0.5)

        outcome = e.get("outcome")
        if boost_good_outcomes and outcome:
            if outcome.get("success", False):
                score *= 1.3
            elif outcome.get("position", 99) <= 3:
                score *= 1.2
            elif outcome.get("position", 99) > 15:
                score *= 0.7

        if boost_recent:
            timestamp = e.get("metadata", {}).get("timestamp", "") or ""
            age_hours = _hours_ago(timestamp)
            if age_hours < 24:
                score *= 1.2
            elif age_hours < 168:
                score *= 1.1

        scored.append((score, e))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [e for _, e in scored]
