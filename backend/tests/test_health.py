"""Tests for observability endpoints."""

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


class TestHealth:
    def test_health_returns_healthy(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["version"] == "4.5.0"
        assert "timestamp" in data

    def test_health_response_structure(self):
        response = client.get("/health")
        data = response.json()
        expected_keys = {"status", "version", "build", "timestamp"}
        assert expected_keys.issubset(data.keys())


class TestVersion:
    def test_version_returns_metadata(self):
        response = client.get("/version")
        assert response.status_code == 200
        data = response.json()
        assert data["version"] == "4.5.0"
        assert data["name"] == "APEXiq Strategy OS"
        assert "python_version" in data


class TestMetrics:
    def test_metrics_returns_uptime(self):
        response = client.get("/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "uptime_seconds" in data
        assert data["version"] == "4.5.0"
        assert isinstance(data["endpoints"], list)
