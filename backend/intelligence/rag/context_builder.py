"""Build structured context from retrieved knowledge documents."""

from typing import List, Dict, Any


def compute_context_quality(context: Dict[str, Any]) -> float:
    if not context or context.get("document_count", 0) == 0:
        return 0.0
    doc_count = context["document_count"]
    source_count = len(context.get("sources", []))
    has_circuits = bool(context.get("circuits", set()))
    has_strategies = bool(context.get("strategies", set()))
    score = min(1.0, doc_count / 10) * 0.4
    score += min(1.0, source_count / 3) * 0.3
    if has_circuits:
        score += 0.15
    if has_strategies:
        score += 0.15
    return round(score, 3)


def build_context(retrieved: List[dict], query: str) -> Dict[str, Any]:
    if not retrieved:
        return {"summary": "", "sources": [], "document_count": 0, "quality_score": 0.0}

    excerpts = []
    circuits = set()
    strategies = set()
    seasons = set()
    documents = []

    for r in retrieved:
        meta = r.get("metadata", {})
        doc = r.get("document", "")
        excerpts.append(doc)

        if meta.get("type") == "historical_race":
            circuits.add(meta.get("circuit", ""))
            strategies.add(meta.get("strategy", ""))
            if meta.get("season"):
                seasons.add(meta["season"])
        documents.append({
            "id": r.get("id", ""),
            "content": doc[:500],
            "metadata": meta,
            "score": r.get("score", 0.0),
        })

    summary_parts = []
    if circuits:
        summary_parts.append(f"Referenced circuits: {', '.join(sorted(circuits))}")
    if strategies:
        summary_parts.append(f"Referenced strategies: {', '.join(sorted(strategies))}")
    if seasons:
        summary_parts.append(f"Referenced seasons: {', '.join(sorted(seasons))}")

    ctx = {
        "summary": ". ".join(summary_parts) if summary_parts else excerpts[0][:200],
        "excerpts": excerpts,
        "sources": list(set(r.get("metadata", {}).get("source", "") for r in retrieved if r.get("metadata"))),
        "document_count": len(retrieved),
        "circuits": circuits,
        "strategies": strategies,
        "seasons": seasons,
        "documents": documents,
    }
    ctx["quality_score"] = compute_context_quality(ctx)
    return ctx
