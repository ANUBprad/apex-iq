"""Evaluation suite for testing intelligence pipeline accuracy and performance."""

import time
from typing import Dict, Any, List


_TEST_CASES = [
    {"query": "Best strategy for Monaco", "circuit": "Monaco", "expected": {"has_recommendation": True}},
    {"query": "Compare soft vs medium at Silverstone", "circuit": "Silverstone", "expected": {"has_recommendation": True}},
    {"query": "Risk assessment for wet race", "circuit": "Spa", "weather": "wet", "expected": {"has_recommendation": True}},
    {"query": "What if safety car at lap 15", "circuit": "Bahrain", "expected": {"has_recommendation": True}},
    {"query": "Historical trends at Singapore", "circuit": "Singapore", "expected": {"has_recommendation": True}},
    {"query": "Best pit window for hard tyres at Monza", "circuit": "Monza", "expected": {"has_recommendation": True}},
]


def run_evaluation_suite(quiet: bool = False) -> Dict[str, Any]:
    from backend.intelligence.orchestrator.graph import run_intelligence_pipeline

    results = []
    passed = 0
    failed = 0
    total_time = 0.0

    for case in _TEST_CASES:
        t0 = time.time()
        try:
            result = run_intelligence_pipeline(
                query=case["query"],
                circuit=case["circuit"],
                weather=case.get("weather", "dry"),
            )
            elapsed = time.time() - t0
            total_time += elapsed

            has_rec = result.get("recommendation") is not None
            has_errors = len(result.get("errors", [])) > 0
            test_passed = has_rec and not has_errors
            expected = case.get("expected", {})
            for ek, ev in expected.items():
                actual = locals().get(ek)
                if actual is not None and actual != ev:
                    test_passed = False

            results.append({
                "query": case["query"],
                "circuit": case["circuit"],
                "passed": test_passed,
                "has_recommendation": has_rec,
                "errors": result.get("errors", []),
                "time_seconds": round(elapsed, 2),
            })

            if test_passed:
                passed += 1
            else:
                failed += 1

            if not quiet:
                status = "PASS" if test_passed else "FAIL"
                print(f"  [{status}] {case['circuit']}: {case['query'][:50]}... ({elapsed:.2f}s)")

        except Exception as e:
            elapsed = time.time() - t0
            total_time += elapsed
            failed += 1
            results.append({
                "query": case["query"],
                "circuit": case["circuit"],
                "passed": False,
                "has_recommendation": False,
                "errors": [str(e)],
                "time_seconds": round(elapsed, 2),
            })
            if not quiet:
                print(f"  [FAIL] {case['circuit']}: {case['query'][:50]}... - {e}")

    return {
        "total": len(_TEST_CASES),
        "passed": passed,
        "failed": failed,
        "pass_rate": round(passed / len(_TEST_CASES) * 100, 1) if _TEST_CASES else 0,
        "total_time_seconds": round(total_time, 2),
        "average_time_seconds": round(total_time / len(_TEST_CASES), 2) if _TEST_CASES else 0,
        "results": results,
    }
