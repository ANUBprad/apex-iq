"""Build a step-by-step reasoning chain tracing from data to recommendation."""

from typing import Dict, Any, List


def build_reasoning_chain(
    query: str,
    circuit: str,
    recommendation: Dict[str, Any],
    confidence: Dict[str, Any],
    node_history: List[str],
    rag_context: Dict[str, Any],
    historical_analysis: Dict[str, Any],
    risk_assessments: List[Dict[str, Any]],
) -> List[Dict[str, str]]:
    chain = []

    chain.append({
        "step": "Query Understanding",
        "detail": f"Analyzed request for circuit '{circuit}': '{query}'",
        "status": "complete",
    })

    source_count = rag_context.get("document_count", 0)
    if source_count > 0:
        chain.append({
            "step": "Knowledge Retrieval",
            "detail": f"Retrieved {source_count} relevant historical documents from {len(rag_context.get('sources', []))} sources",
            "status": "complete",
        })
    else:
        chain.append({
            "step": "Knowledge Retrieval",
            "detail": "No historical documents found; relying on simulation",
            "status": "warning",
        })

    rec = recommendation.get("recommendation", {})
    strategy_name = rec.get("strategy", "N/A")
    expected_finish = rec.get("expected_finish", "N/A")
    win_prob = rec.get("win_probability", 0)
    risk_level = rec.get("risk_level", "unknown")

    chain.append({
        "step": "Multi-Agent Analysis",
        "detail": (
            f"Simulation, historical, telemetry, and risk agents evaluated "
            f"{recommendation.get('total_options_evaluated', 0)} strategy options"
        ),
        "status": "complete",
    })

    chain.append({
        "step": "Confidence Assessment",
        "detail": (
            f"Overall confidence: {confidence.get('overall_score', 0)} "
            f"({confidence.get('level', 'unknown')}). "
            f"Components: RAG={confidence.get('components', {}).get('rag', {}).get('score', 0)}, "
            f"Sim={confidence.get('components', {}).get('simulation', {}).get('score', 0)}, "
            f"Hist={confidence.get('components', {}).get('historical', {}).get('score', 0)}"
        ),
        "status": "complete",
    })

    if historical_analysis and historical_analysis.get("document_count", 0) > 0:
        chain.append({
            "step": "Historical Precedent",
            "detail": f"Found {historical_analysis.get('document_count', 0)} past races with similar conditions",
            "status": "reference",
        })

    if risk_assessments:
        avg_risk = sum(r.get("overall_risk_score", 0) for r in risk_assessments) / len(risk_assessments)
        chain.append({
            "step": "Risk Evaluation",
            "detail": f"Average risk score {avg_risk:.2f} across evaluated strategies. "
                       f"Recommended '{strategy_name}' has risk level '{risk_level}'",
            "status": "complete",
        })

    chain.append({
        "step": "Recommendation",
        "detail": (
            f"Recommended: {strategy_name}. "
            f"Expected finish: P{expected_finish}. "
            f"Win probability: {win_prob}%. "
            f"Confidence: {confidence.get('overall_score', 0)}"
        ),
        "status": "decision",
    })

    return chain
