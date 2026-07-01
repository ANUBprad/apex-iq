"""Tests for confidence engine components."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))


class TestConfidenceEngine:
    def test_compute_confidence_returns_all_fields(self):
        from backend.intelligence.confidence.confidence_engine import compute_confidence
        result = compute_confidence(
            rag_context={"document_count": 8, "sources": ["a", "b"]},
            simulation_results=[{"iterations": 500}],
            historical_analysis={"document_count": 5},
            telemetry_analysis={"laps_analyzed": 15, "anomalies": []},
            recommendation={"recommendation": {"strategy": "test"}},
        )
        assert "overall_score" in result
        assert "level" in result
        assert "components" in result
        assert "weights_used" in result
        assert 0 <= result["overall_score"] <= 1

    def test_no_data_returns_low_confidence(self):
        from backend.intelligence.confidence.confidence_engine import compute_confidence
        result = compute_confidence()
        assert result["overall_score"] < 0.3

    def test_all_signals_strong_returns_high_confidence(self):
        from backend.intelligence.confidence.confidence_engine import compute_confidence
        result = compute_confidence(
            rag_context={"document_count": 10, "sources": ["a", "b", "c"]},
            simulation_results=[{"iterations": 500, "model": "v2_nonlinear"}],
            historical_analysis={"document_count": 8},
            telemetry_analysis={"laps_analyzed": 20, "anomalies": []},
            recommendation={"recommendation": {"strategy": "optimal"}},
            telemetry_is_simulated=False,
        )
        assert result["overall_score"] > 0.6
        assert result["level"] in ("high", "very_high")


class TestWeightAllocator:
    def test_allocate_weights_sum_to_one(self):
        from backend.intelligence.confidence.weight_allocator import allocate_weights
        weights = allocate_weights()
        assert abs(sum(weights.values()) - 1.0) < 0.01

    def test_unknown_circuit_adjusts_weights(self):
        from backend.intelligence.confidence.weight_allocator import allocate_weights
        with_data = allocate_weights(circuit_known=True)
        without_data = allocate_weights(circuit_known=False)
        assert without_data["rag"] < with_data["rag"]
        assert without_data["simulation"] > with_data["simulation"]

    def test_telemetry_present_adjusts(self):
        from backend.intelligence.confidence.weight_allocator import allocate_weights
        base = allocate_weights(have_telemetry=False)
        with_tel = allocate_weights(have_telemetry=True)
        assert with_tel["telemetry"] > base["telemetry"]


class TestTrustScore:
    def test_compute_trust_score_no_errors(self):
        from backend.intelligence.confidence.trust_score import compute_trust_score
        result = compute_trust_score(
            confidence_metrics={"overall_score": 0.8},
            errors=[],
        )
        assert result["trust_score"] > 0
        assert result["error_penalty"] == 0

    def test_errors_reduce_trust(self):
        from backend.intelligence.confidence.trust_score import compute_trust_score
        no_errors = compute_trust_score({"overall_score": 0.8}, [])
        with_errors = compute_trust_score({"overall_score": 0.8}, ["err1", "err2"])
        assert with_errors["trust_score"] < no_errors["trust_score"]

    def test_historical_accuracy_boosts_trust(self):
        from backend.intelligence.confidence.trust_score import compute_trust_score
        base = compute_trust_score({"overall_score": 0.5}, [])
        boosted = compute_trust_score({"overall_score": 0.5}, [], historical_accuracy=0.9)
        assert boosted["trust_score"] > base["trust_score"]
