"""Integration tests for the V3 Intelligence API."""

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def client():
    from backend.main import app
    with TestClient(app) as c:
        yield c


class TestHealthEndpoint:
    def test_health_returns_status(self, client):
        resp = client.get("/api/v3/intelligence/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"

    def test_metrics_returns_counts(self, client):
        resp = client.get("/api/v3/intelligence/metrics")
        assert resp.status_code == 200
        data = resp.json()
        assert "rag_documents_indexed" in data
        assert "memory_entries" in data


class TestQueryEndpoint:
    def test_query_returns_recommendation(self, client):
        resp = client.post("/api/v3/intelligence/query", json={
            "query": "Best strategy for Monaco",
            "circuit": "Monaco",
            "total_laps": 78,
            "weather": "dry",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "success"
        assert data["recommendation"] is not None
        assert data["confidence"] is not None

    def test_query_includes_explainability(self, client):
        resp = client.post("/api/v3/intelligence/query", json={
            "query": "Best strategy for Monaco",
            "circuit": "Monaco",
            "total_laps": 78,
            "weather": "dry",
            "include_explainability": True,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["explanation"] is not None
        assert "reasoning_steps" in data["explanation"]

    def test_query_without_explainability(self, client):
        resp = client.post("/api/v3/intelligence/query", json={
            "query": "Best strategy for Monaco",
            "circuit": "Monaco",
            "total_laps": 78,
            "weather": "dry",
            "include_explainability": False,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["explanation"] is None

    def test_query_invalid_circuit(self, client):
        resp = client.post("/api/v3/intelligence/query", json={
            "query": "Best strategy",
            "circuit": "",
            "total_laps": 70,
            "weather": "dry",
        })
        assert resp.status_code == 422

    def test_query_invalid_weather(self, client):
        resp = client.post("/api/v3/intelligence/query", json={
            "query": "Best strategy",
            "circuit": "Monaco",
            "total_laps": 70,
            "weather": "thunderstorm",
        })
        assert resp.status_code == 422


class TestRecommendEndpoint:
    def test_recommend_returns_success(self, client):
        resp = client.post("/api/v3/intelligence/recommend", json={
            "circuit": "Monaco",
            "total_laps": 78,
            "weather": "dry",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "success"

    def test_recommend_with_wet_weather(self, client):
        resp = client.post("/api/v3/intelligence/recommend", json={
            "circuit": "Spa",
            "total_laps": 44,
            "weather": "wet",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] in ("success", "partial")


class TestMemoryEndpoint:
    def test_circuit_memory_returns_list(self, client):
        resp = client.get("/api/v3/intelligence/memory/Monaco")
        assert resp.status_code == 200
        data = resp.json()
        assert "circuit" in data
        assert "entries" in data

    def test_memory_recall_returns_list(self, client):
        resp = client.get("/api/v3/intelligence/memory/recall?query=Monaco")
        assert resp.status_code == 200
        data = resp.json()
        assert "entries" in data


class TestAuthEndpoint:
    def test_query_with_valid_api_key(self, client):
        import os
        import importlib
        import backend.api.intelligence as api_mod
        os.environ["APEXIQ_API_KEY"] = "test-key-123"
        importlib.reload(api_mod)
        resp = client.post("/api/v3/intelligence/query", json={
            "query": "Best strategy for Monaco",
            "circuit": "Monaco",
            "total_laps": 78,
            "weather": "dry",
        }, headers={"X-API-Key": "test-key-123"})
        assert resp.status_code in (200, 429)
        del os.environ["APEXIQ_API_KEY"]

    def test_query_with_invalid_api_key(self, client):
        import os
        import importlib
        import backend.api.intelligence as api_mod
        os.environ["APEXIQ_API_KEY"] = "test-key-123"
        importlib.reload(api_mod)
        resp = client.post("/api/v3/intelligence/query", json={
            "query": "Best strategy for Monaco",
            "circuit": "Monaco",
            "total_laps": 78,
            "weather": "dry",
        }, headers={"X-API-Key": "wrong-key"})
        assert resp.status_code == 401
        del os.environ["APEXIQ_API_KEY"]


class TestCache:
    def test_cache_hit_returns_same_result(self, client):
        import os
        import importlib
        import backend.api.intelligence as api_mod
        if "APEXIQ_API_KEY" in os.environ:
            del os.environ["APEXIQ_API_KEY"]
        importlib.reload(api_mod)
        payload = {
            "query": "Best strategy for Monaco",
            "circuit": "Monaco",
            "total_laps": 78,
            "weather": "dry",
            "include_explainability": False,
        }
        resp1 = client.post("/api/v3/intelligence/query", json=payload)
        resp2 = client.post("/api/v3/intelligence/query", json=payload)
        assert resp1.status_code == 200, f"First request failed: {resp1.text}"
        assert resp2.status_code == 200, f"Second request failed: {resp2.text}"
        data1 = resp1.json()
        data2 = resp2.json()
        assert data1["recommendation"] == data2["recommendation"]
