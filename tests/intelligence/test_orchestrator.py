"""Tests for LangGraph orchestration components."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))


class TestState:
    def test_intelligence_state_defaults(self):
        from backend.intelligence.orchestrator.state import IntelligenceState
        s = IntelligenceState()
        assert s.get("query", "") == ""
        assert s.get("circuit", "") == ""
        assert s.get("weather", "dry") == "dry"
        assert s.get("errors", []) == []
        assert s.get("node_history", []) == []

    def test_intelligence_state_with_values(self):
        from backend.intelligence.orchestrator.state import IntelligenceState
        s = IntelligenceState(
            query="best strategy",
            circuit="Monaco",
            total_laps=78,
            weather="wet",
        )
        assert s.get("query") == "best strategy"
        assert s.get("circuit") == "Monaco"
        assert s.get("total_laps") == 78
        assert s.get("weather") == "wet"


class TestRouter:
    def test_route_query_simulation(self):
        from backend.intelligence.orchestrator.router import route_query
        assert route_query("simulate Monaco") == "simulation"
        assert route_query("what if safety car") == "simulation"
        assert route_query("monte carlo analysis") == "simulation"

    def test_route_query_comparison(self):
        from backend.intelligence.orchestrator.router import route_query
        assert route_query("compare soft vs hard") == "comparison"
        assert route_query("which is better") == "comparison"

    def test_route_query_risk(self):
        from backend.intelligence.orchestrator.router import route_query
        assert route_query("risk assessment") == "risk_analysis"
        assert route_query("safety car danger") == "risk_analysis"

    def test_route_query_telemetry(self):
        from backend.intelligence.orchestrator.router import route_query
        assert route_query("telemetry analysis") == "telemetry"
        assert route_query("lap time sector") == "telemetry"

    def test_route_query_historical(self):
        from backend.intelligence.orchestrator.router import route_query
        assert route_query("history Monaco") == "historical"
        assert route_query("past trends") == "historical"

    def test_route_query_default(self):
        from backend.intelligence.orchestrator.router import route_query
        assert route_query("random question") == "full_analysis"

    def test_get_strategy_params(self):
        from backend.intelligence.orchestrator.router import get_strategy_params
        params = get_strategy_params("full_analysis", {})
        assert "compounds" in params
        assert "pit_window_start" in params
        assert params["n_iterations"] == 300


class TestGraph:
    def test_run_intelligence_pipeline_returns_state(self):
        from backend.intelligence.orchestrator.graph import run_intelligence_pipeline
        result = run_intelligence_pipeline(
            query="Best strategy",
            circuit="Monaco",
            total_laps=78,
            weather="dry",
        )
        assert result is not None
        assert "recommendation" in result
        assert "node_history" in result
        assert "rag" in result["node_history"]

    def test_pipeline_produces_recommendation(self):
        from backend.intelligence.orchestrator.graph import run_intelligence_pipeline
        result = run_intelligence_pipeline("Strategy for Spa", "Spa")
        assert result.get("recommendation") is not None
        assert result["recommendation"].get("recommendation") is not None

    def test_pipeline_runs_multiple_nodes(self):
        from backend.intelligence.orchestrator.graph import run_intelligence_pipeline
        result = run_intelligence_pipeline("Test", "Monaco")
        assert "sync" in result["node_history"]
        assert "fusion" in result["node_history"]
        assert len(result["node_history"]) >= 5
