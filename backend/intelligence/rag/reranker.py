"""Re-rank retrieved results by relevance to the query context."""

from typing import List


def rerank_results(query: str, results: List[dict], top_k: int = 5) -> List[dict]:
    if not results:
        return []

    query_lower = query.lower()
    query_terms = set(query_lower.split())
    stop_words = {"the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to", "for", "of", "with", "and", "or"}
    query_terms = query_terms - stop_words

    scored = []
    for r in results:
        score = r.get("score", 1.0)
        doc = r.get("document", "").lower()
        metadata = r.get("metadata", {})

        term_match = sum(1 for t in query_terms if t in doc)
        circuit = metadata.get("circuit", "").lower()
        circuit_match = 1.0 if circuit and circuit in query_lower else 0.0
        strategy = metadata.get("strategy", "").lower()
        strategy_match = 0.5 if strategy and strategy in query_lower else 0.0

        recency_bonus = 0.0
        season = metadata.get("season", "")
        if season and season.isdigit():
            year = int(season)
            recency_bonus = min(0.1, (2025 - year) * 0.01)

        relevance = score * 0.35 + term_match * 0.25 + circuit_match * 0.2 + strategy_match * 0.1 + recency_bonus
        scored.append((relevance, r))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [r for _, r in scored[:top_k]]
