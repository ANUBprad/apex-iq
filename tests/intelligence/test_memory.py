"""Tests for strategy memory components."""

import os
import sys
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))


@pytest.fixture(autouse=True)
def clean_memory():
    from backend.intelligence.memory.memory_store import _get_collection
    try:
        col = _get_collection()
        existing = col.get()["ids"]
        if existing:
            col.delete(ids=existing)
    except Exception:
        pass
    yield


class TestMemoryStore:
    def test_store_recommendation_returns_id(self):
        from backend.intelligence.memory.memory_store import store_recommendation
        mem_id = store_recommendation(
            query="best strategy for Monaco",
            circuit="Monaco",
            recommendation={"recommendation": {"strategy": "Soft-Medium", "expected_finish": 3}},
            confidence={"overall_score": 0.85, "level": "high"},
        )
        assert mem_id is not None
        assert mem_id.startswith("rec_")

    def test_recall_similar_returns_stored_entry(self):
        from backend.intelligence.memory.memory_store import store_recommendation, recall_similar
        store_recommendation("Monaco strategy", "Monaco", {"rec": {"strategy": "test"}}, {"score": 0.9})
        results = recall_similar("Monaco strategy", n=5)
        assert len(results) > 0
        assert results[0]["content"]["recommendation"]["rec"]["strategy"] == "test"

    def test_recall_empty_returns_empty_list(self):
        from backend.intelligence.memory.memory_store import recall_similar
        results = recall_similar("nothing", n=5)
        assert len(results) == 0

    def test_memory_count(self):
        from backend.intelligence.memory.memory_store import memory_count, store_recommendation
        start = memory_count()
        store_recommendation("x", "x", {"a": 1}, {"s": 0.5})
        assert memory_count() == start + 1


class TestMemoryRetriever:
    def test_get_past_recommendations_returns_formatted(self):
        from backend.intelligence.memory.memory_store import store_recommendation
        from backend.intelligence.memory.memory_retriever import get_past_recommendations
        store_recommendation("test", "Monaco", {"rec": {"strategy": "test"}}, {"score": 0.9})
        result = get_past_recommendations("test", n=5)
        assert result["status"] == "found"
        assert len(result["entries"]) > 0

    def test_get_past_recommendations_no_memory(self):
        from backend.intelligence.memory.memory_retriever import get_past_recommendations
        result = get_past_recommendations("nonexistent")
        assert result["status"] == "no_memory"


class TestMemoryRanker:
    def test_rank_entries_orders_by_score(self):
        from backend.intelligence.memory.memory_ranker import rank_entries
        entries = [
            {"id": "a", "similarity_score": 0.3, "outcome": None, "metadata": {"timestamp": ""}},
            {"id": "b", "similarity_score": 0.7, "outcome": None, "metadata": {"timestamp": ""}},
            {"id": "c", "similarity_score": 0.1, "outcome": None, "metadata": {"timestamp": ""}},
        ]
        ranked = rank_entries(entries, boost_recent=False, boost_good_outcomes=False)
        assert ranked[0]["id"] == "c"
        assert ranked[-1]["id"] == "b"

    def test_rank_entries_empty(self):
        from backend.intelligence.memory.memory_ranker import rank_entries
        assert rank_entries([]) == []

    def test_good_outcome_boosted(self):
        from backend.intelligence.memory.memory_ranker import rank_entries
        entries = [
            {"id": "a", "similarity_score": 0.5, "outcome": {"success": True}, "metadata": {"timestamp": ""}},
            {"id": "b", "similarity_score": 0.5, "outcome": None, "metadata": {"timestamp": ""}},
        ]
        ranked = rank_entries(entries, boost_recent=False, boost_good_outcomes=True)
        assert ranked[0]["id"] == "a"
