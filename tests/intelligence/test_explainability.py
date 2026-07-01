"""Tests for explainability components."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))


class TestReasoningChain:
    def test_build_reasoning_chain_returns_steps(self):
        from backend.intelligence.explainability.reasoning_chain import build_reasoning_chain
        chain = build_reasoning_chain(
            query="best strategy",
            circuit="Monaco",
            recommendation={
                "recommendation": {"strategy": "Soft-Medium", "expected_finish": 3, "win_probability": 15, "risk_level": "medium"},
                "total_options_evaluated": 6,
            },
            confidence={"overall_score": 0.85, "level": "high", "components": {"rag": {"score": 0.9}, "simulation": {"score": 0.8}, "historical": {"score": 0.7}}},
            node_history=["rag", "simulate", "risk", "fusion"],
            rag_context={"document_count": 5, "sources": ["historical"]},
            historical_analysis={"document_count": 3, "winner_history": "Verstappen"},
            risk_assessments=[{"overall_risk_score": 0.3, "risk_level": "low"}],
        )
        assert len(chain) > 0
        assert chain[-1]["step"] == "Recommendation"

    def test_reasoning_chain_includes_explanation(self):
        from backend.intelligence.explainability.reasoning_chain import build_reasoning_chain
        chain = build_reasoning_chain("test", "Monaco", {}, {"overall_score": 0}, [], {}, {}, [])
        assert any(s["status"] for s in chain)


class TestEvidenceBuilder:
    def test_build_evidence_returns_list(self):
        from backend.intelligence.explainability.evidence_builder import build_evidence
        evidence = build_evidence(
            rag_context={"document_count": 5, "sources": ["data.csv"], "summary": "Monaco data"},
            historical_analysis={"document_count": 2, "winner_history": "Hamilton"},
            risk_assessments=[{"overall_risk_score": 0.4, "risk_level": "medium"}],
            telemetry_analysis={"laps_analyzed": 10, "anomalies": [], "degradation_rate_pct": 2.5},
        )
        assert len(evidence) > 0
        for e in evidence:
            assert "type" in e
            assert "detail" in e

    def test_empty_data_returns_empty(self):
        from backend.intelligence.explainability.evidence_builder import build_evidence
        evidence = build_evidence({}, {}, [], {})
        assert len(evidence) == 0

    def test_summarize_evidence_returns_string(self):
        from backend.intelligence.explainability.evidence_builder import build_evidence, summarize_evidence
        evidence = build_evidence(
            rag_context={"document_count": 3, "sources": ["a"], "summary": "test"},
            historical_analysis={},
            risk_assessments=[],
            telemetry_analysis={},
        )
        summary = summarize_evidence(evidence)
        assert isinstance(summary, str)
        assert len(summary) > 0


class TestDecisionSummary:
    def test_generate_summary_returns_all_fields(self):
        from backend.intelligence.explainability.decision_summary import generate_summary
        summary = generate_summary(
            query="best strategy",
            circuit="Monaco",
            recommendation={"recommendation": {"strategy": "Soft", "expected_finish": 3, "risk_level": "low"}},
            confidence={"overall_score": 0.85, "level": "high"},
            trust_score={"trust_score": 0.8, "level": "high"},
            reasoning_chain=[{"step": "Query", "detail": "test", "status": "complete"}],
            evidence=[{"type": "test", "detail": "evidence detail", "source": "test", "relevance": "high"}],
        )
        assert summary["query"] == "best strategy"
        assert summary["circuit"] == "Monaco"
        assert "short_summary" in summary
        assert summary["reasoning_steps"] > 0
        assert summary["evidence_items"] > 0
