"""Stress and concurrency tests for the intelligence layer."""

import os
import sys
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed


sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))


NUM_THREADS = 4
NUM_REQUESTS = 8


class TestConcurrentAccess:
    def test_concurrent_simulation_calls(self):
        from backend.intelligence.orchestrator.graph import run_intelligence_pipeline

        queries = [
            {"query": "Best strategy for Monaco", "circuit": "Monaco", "weather": "dry"},
            {"query": "Risk at Spa wet", "circuit": "Spa", "weather": "wet"},
            {"query": "Compare soft vs medium", "circuit": "Silverstone", "weather": "dry"},
            {"query": "Safety car strategy", "circuit": "Bahrain", "weather": "dry"},
            {"query": "Pit window for hard tyres", "circuit": "Monza", "weather": "dry"},
            {"query": "Historical trends", "circuit": "Singapore", "weather": "dry"},
            {"query": "What if rain at lap 20", "circuit": "Suzuka", "weather": "wet"},
            {"query": "Best overtaking strategy", "circuit": "Monaco", "weather": "dry"},
        ]

        errors = []
        lock = threading.Lock()

        def run_query(idx, q):
            try:
                result = run_intelligence_pipeline(**q)
                rec = result.get("recommendation")
                if rec is None:
                    with lock:
                        errors.append(f"Query {idx}: no recommendation")
                errs = result.get("errors", [])
                if errs:
                    with lock:
                        errors.append(f"Query {idx}: errors={errs}")
            except Exception as e:
                with lock:
                    errors.append(f"Query {idx}: exception={e}")

        threads = []
        for i, q in enumerate(queries[:NUM_REQUESTS]):
            t = threading.Thread(target=run_query, args=(i, q))
            threads.append(t)
            t.start()

        for t in threads:
            t.join(timeout=240)

        assert len(errors) == 0, f"Concurrent errors: {errors}"

    def test_concurrent_memory_access(self):
        from backend.intelligence.memory.memory_store import store_recommendation, recall_similar

        def store_entry(i):
            try:
                store_recommendation(
                    query=f"test strategy {i}",
                    circuit="TestCircuit",
                    recommendation={"strategy": f"test_{i}", "tyre_compound": "soft"},
                    confidence={"level": "medium", "score": 0.7},
                    outcome=None,
                )
                return None
            except Exception as e:
                return str(e)

        def recall_entries():
            try:
                recall_similar("test strategy", n=3)
                return None
            except Exception as e:
                return str(e)

        errors = []
        with ThreadPoolExecutor(max_workers=NUM_THREADS) as pool:
            store_futures = [pool.submit(store_entry, i) for i in range(5)]
            recall_futures = [pool.submit(recall_entries) for _ in range(5)]
            for f in as_completed(store_futures + recall_futures):
                err = f.result()
                if err:
                    errors.append(err)

        assert len(errors) == 0, f"Concurrent memory errors: {errors}"

    def test_concurrent_cache_access(self):
        from backend.api.intelligence import _CACHE, _CACHE_LOCK, _cache_set, _cache_get

        with _CACHE_LOCK:
            _CACHE.clear()

        def cache_access(key, value):
            try:
                _cache_set(key, {"data": value, "timestamp": time.time()})
                cached = _cache_get(key)
                assert cached is not None
                assert cached["data"] == value
                return None
            except Exception as e:
                return str(e)

        errors = []
        keys = [f"test_key_{i}" for i in range(10)]
        with ThreadPoolExecutor(max_workers=NUM_THREADS) as pool:
            futures = [pool.submit(cache_access, k, f"val_{i}") for i, k in enumerate(keys)]
            for f in as_completed(futures):
                err = f.result()
                if err:
                    errors.append(err)

        with _CACHE_LOCK:
            cache_size = len(_CACHE)
        assert len(errors) == 0, f"Cache concurrency errors: {errors}"
        assert cache_size <= 128


class TestStress:
    def test_repeated_simulation_stress(self):
        from backend.intelligence.orchestrator.graph import run_intelligence_pipeline

        times = []
        for i in range(5):
            t0 = time.time()
            result = run_intelligence_pipeline(
                query="Best strategy for Monaco",
                circuit="Monaco",
                weather="dry",
            )
            elapsed = time.time() - t0
            times.append(elapsed)
            assert result.get("recommendation") is not None, f"Iteration {i} failed"

        avg = sum(times) / len(times)
        assert avg < 300, f"Average time too high: {avg:.2f}s"

    def test_large_what_if_stress(self):
        from backend.intelligence.agents.simulation_agent import run_what_if_analysis

        result = run_what_if_analysis(
            circuit_name="Monaco",
            total_laps=50,
            compounds=["soft", "medium", "hard"],
            pit_window_range=range(15, 40, 5),
            degradation=0.3,
            overtaking_difficulty=0.5,
            weather="dry",
        )

        assert isinstance(result, list)
        assert len(result) > 0
        for r in result:
            assert "average_finish_position" in r or "total_time" in r
