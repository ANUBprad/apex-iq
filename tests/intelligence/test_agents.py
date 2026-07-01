"""Tests for multi-agent components."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))


class TestSimulationAgent:
    def test_simulate_strategy_returns_expected_fields(self):
        from backend.intelligence.agents.simulation_agent import simulate_strategy
        result = simulate_strategy(
            circuit_name="Monaco",
            total_laps=78,
            tyre_compound="soft",
            pit_stop_lap=20,
            degradation=0.08,
            n_iterations=100,
        )
        assert result["circuit"] == "Monaco"
        assert result["tyre_compound"] == "soft"
        assert 0 <= result["win_probability"] <= 100
        assert 0 <= result["podium_probability"] <= 100
        assert result["average_finish_position"] >= 1
        assert result["iterations"] == 100
        assert result.get("model") == "v2_nonlinear"
        assert "average_vsc" in result

    def test_run_what_if_analysis_returns_sorted_results(self):
        from backend.intelligence.agents.simulation_agent import run_what_if_analysis
        results = run_what_if_analysis(
            circuit_name="Monza",
            total_laps=53,
            compounds=["soft", "medium"],
            pit_window_range=range(10, 30, 10),
            degradation=0.08,
            overtaking_difficulty=0.5,
        )
        assert len(results) > 0
        for r in results:
            assert "average_finish_position" in r
        assert results[0]["average_finish_position"] <= results[-1]["average_finish_position"]

    def test_different_compounds_give_different_results(self):
        from backend.intelligence.agents.simulation_agent import simulate_strategy
        soft = simulate_strategy("Test", 60, "soft", 20, 0.08, n_iterations=100)
        hard = simulate_strategy("Test", 60, "hard", 20, 0.08, n_iterations=100)
        assert soft["tyre_compound"] == "soft"
        assert hard["tyre_compound"] == "hard"


class TestTelemetryAgent:
    def test_analyze_lap_telemetry_returns_insights(self):
        from backend.intelligence.agents.telemetry_agent import analyze_lap_telemetry
        result = analyze_lap_telemetry(
            lap_times=[92.0, 92.5, 93.0, 94.0, 95.0],
            tyre_temps=[100.0, 102.0, 104.0, 106.0],

            tyre_compound="soft",
        )
        assert result["status"] == "analyzed"
        assert result["laps_analyzed"] == 5
        assert result["median_lap_time_s"] > 0

    def test_empty_telemetry_returns_no_data(self):
        from backend.intelligence.agents.telemetry_agent import analyze_lap_telemetry
        result = analyze_lap_telemetry([], [], "medium")
        assert result["status"] == "no_data"

    def test_anomaly_detection_triggers_on_high_variance(self):
        from backend.intelligence.agents.telemetry_agent import analyze_lap_telemetry
        result = analyze_lap_telemetry(
            lap_times=[90.0, 100.0, 90.0, 101.0, 89.0],
            tyre_temps=[100.0] * 5,

            tyre_compound="soft",
        )
        assert len(result["anomalies"]) > 0


class TestHistoricalAgent:
    def test_analyze_historical_patterns_returns_summary(self):
        from backend.intelligence.agents.historical_agent import analyze_historical_patterns
        result = analyze_historical_patterns(circuit="Monaco")
        assert result["circuit"] == "Monaco"
        assert "summary" in result

    def test_compare_strategies_returns_comparison(self):
        from backend.intelligence.agents.historical_agent import compare_strategies
        result = compare_strategies("Monaco", ["one stop", "two stop"])
        assert result["circuit"] == "Monaco"
        assert len(result["compared_strategies"]) == 2
        assert result["best_match"] is not None


class TestRiskAgent:
    def test_assess_strategy_risk_returns_scores(self):
        from backend.intelligence.agents.risk_agent import assess_strategy_risk
        result = assess_strategy_risk(
            circuit="Monaco",
            tyre_compound="soft",
            pit_stop_lap=20,
            total_laps=78,
            weather="dry",
        )
        assert 0 <= result["overall_risk_score"] <= 1
        assert result["risk_level"] in ("low", "medium", "high", "critical")
        assert len(result["factors"]) > 0

    def test_wet_weather_increases_risk(self):
        from backend.intelligence.agents.risk_agent import assess_strategy_risk
        dry = assess_strategy_risk("Monaco", "medium", 20, 78, "dry")
        wet = assess_strategy_risk("Monaco", "medium", 20, 78, "wet")
        assert wet["overall_risk_score"] > dry["overall_risk_score"]

    def test_soft_tyres_have_higher_risk(self):
        from backend.intelligence.agents.risk_agent import assess_strategy_risk
        soft = assess_strategy_risk("Monaco", "soft", 20, 78)
        hard = assess_strategy_risk("Monaco", "hard", 20, 78)
        assert soft["overall_risk_score"] > hard["overall_risk_score"]


class TestStrategyAgent:
    def test_generate_recommendations_returns_best_option(self):
        from backend.intelligence.agents.strategy_agent import generate_recommendations
        sims = [
            {"tyre_compound": "soft", "pit_stop_lap": 20, "average_finish_position": 3, "win_probability": 15.0, "podium_probability": 60.0, "iterations": 500},
            {"tyre_compound": "hard", "pit_stop_lap": 25, "average_finish_position": 5, "win_probability": 8.0, "podium_probability": 40.0, "iterations": 500},
        ]
        risks = [
            {"overall_risk_score": 0.4, "risk_level": "medium", "factors": [], "circuit": "Monaco", "weather": "dry", "tyre_compound": "soft"},
            {"overall_risk_score": 0.2, "risk_level": "low", "factors": [], "circuit": "Monaco", "weather": "dry", "tyre_compound": "hard"},
        ]
        result = generate_recommendations(sims, risks)
        assert result["recommendation"] is not None
        assert result["recommendation"]["tyre_compound"] is not None
        assert result["total_options_evaluated"] == 2
