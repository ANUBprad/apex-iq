"""Analyze historical race data for patterns and precedent."""

from typing import Dict, Any, List, Optional
from backend.intelligence.rag.context_builder import build_context
from backend.intelligence.rag.retriever import retrieve_context


def analyze_historical_patterns(
    circuit: str,
    weather: Optional[str] = None,
) -> Dict[str, Any]:
    query_parts = [f"{circuit} race strategy performance"]
    if weather:
        query_parts.append(f"weather {weather}")
    query = " ".join(query_parts)

    retrieved = retrieve_context(query, n_results=10, circuit=circuit)
    context = build_context(retrieved, query)

    records = retrieved[0].get("metadata", {}) if retrieved else {}
    winner = records.get("winner", "unknown")

    return {
        "circuit": circuit,
        "query": query,
        "winner_history": winner,
        "document_count": context["document_count"],
        "sources": context.get("sources", []),
        "summary": context.get("summary", ""),
        "excerpts": context.get("excerpts", [])[:3],
    }


def compare_strategies(
    circuit: str,
    strategies: List[str],
) -> Dict[str, Any]:
    comparisons = []
    for strategy in strategies:
        query = f"{circuit} {strategy} race outcome"
        retrieved = retrieve_context(query, n_results=5, circuit=circuit)
        context = build_context(retrieved, query)
        comparisons.append({
            "strategy": strategy,
            "matches": context["document_count"],
            "summary": context.get("summary", ""),
        })

    comparisons.sort(key=lambda c: c["matches"], reverse=True)
    return {
        "circuit": circuit,
        "compared_strategies": comparisons,
        "best_match": comparisons[0] if comparisons else None,
    }
