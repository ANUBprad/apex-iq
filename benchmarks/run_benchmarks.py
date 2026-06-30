"""Benchmark runner for the intelligence pipeline.

Usage:
    python benchmarks/run_benchmarks.py
    python benchmarks/run_benchmarks.py --quick
"""

import argparse
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def run_evaluation():
    from benchmarks.evaluation_suite import run_evaluation_suite
    print("=" * 60)
    print("Evaluation Suite")
    print("=" * 60)
    t0 = time.time()
    result = run_evaluation_suite(quiet=False)
    elapsed = time.time() - t0
    print()
    print(f"Results: {result['passed']}/{result['total']} passed ({result['pass_rate']}%)")
    print(f"Total time: {elapsed:.2f}s")
    print(f"Pipeline time: {result['total_time_seconds']}s")
    print(f"Average per case: {result['average_time_seconds']}s")
    print()
    return result


def run_concurrency_tests():
    import pytest
    print("=" * 60)
    print("Concurrency Tests")
    print("=" * 60)
    t0 = time.time()
    exit_code = pytest.main([
        "-x",
        "--tb=short",
        "-q",
        "tests/intelligence/test_concurrency.py",
    ])
    elapsed = time.time() - t0
    print(f"Concurrency tests {'PASSED' if exit_code == 0 else 'FAILED'} ({elapsed:.2f}s)")
    print()
    return exit_code == 0


def run_pipeline_benchmark():
    from backend.intelligence.orchestrator.graph import run_intelligence_pipeline
    print("=" * 60)
    print("Pipeline Micro-Benchmark")
    print("=" * 60)
    queries = [
        ("Monaco dry", dict(query="Best strategy for Monaco", circuit="Monaco", weather="dry")),
        ("Spa wet", dict(query="Risk assessment for Spa", circuit="Spa", weather="wet")),
        ("Silverstone compare", dict(query="Compare soft vs medium", circuit="Silverstone", weather="dry")),
    ]
    for label, kwargs in queries:
        times = []
        for _ in range(3):
            t0 = time.time()
            run_intelligence_pipeline(**kwargs)
            times.append(time.time() - t0)
        avg = sum(times) / len(times)
        print(f"  {label:25s} avg={avg:.2f}s  min={min(times):.2f}s  max={max(times):.2f}s")
    print()


def main():
    parser = argparse.ArgumentParser(description="Run intelligence benchmarks")
    parser.add_argument("--quick", action="store_true", help="Skip evaluation suite")
    args = parser.parse_args()

    all_passed = True

    if not args.quick:
        result = run_evaluation()
        all_passed = all_passed and result["failed"] == 0
    else:
        print("Skipping evaluation suite (--quick)")

    bench_ok = run_pipeline_benchmark()
    all_passed = all_passed and bench_ok

    concurrency_ok = run_concurrency_tests()
    all_passed = all_passed and concurrency_ok

    print("=" * 60)
    if all_passed:
        print("ALL BENCHMARKS PASSED")
    else:
        print("SOME BENCHMARKS FAILED")
        sys.exit(1)


if __name__ == "__main__":
    main()
