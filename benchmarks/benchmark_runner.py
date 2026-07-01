"""Run benchmarks and performance tests on the intelligence pipeline."""

import time
from typing import Dict, Any, List


def benchmark_pipeline(
    n_runs: int = 5,
    circuits: List[str] = None,
) -> Dict[str, Any]:
    from backend.intelligence.orchestrator.graph import run_intelligence_pipeline

    if circuits is None:
        circuits = ["Monaco", "Silverstone", "Spa", "Monza", "Singapore"]

    results = []
    total_time = 0.0

    for circuit in circuits:
        for i in range(n_runs):
            t0 = time.time()
            result = run_intelligence_pipeline(
                query=f"Best strategy for {circuit}",
                circuit=circuit,
            )
            elapsed = time.time() - t0
            total_time += elapsed

            results.append({
                "circuit": circuit,
                "run": i + 1,
                "time_seconds": round(elapsed, 3),
                "has_recommendation": result.get("recommendation") is not None,
                "error_count": len(result.get("errors", [])),
            })

    avg_time = total_time / (len(circuits) * n_runs) if circuits and n_runs else 0

    return {
        "n_circuits": len(circuits),
        "n_runs_per_circuit": n_runs,
        "total_runs": len(results),
        "total_time_seconds": round(total_time, 2),
        "average_time_seconds": round(avg_time, 3),
        "p50_time_seconds": round(sorted(r["time_seconds"] for r in results)[len(results) // 2], 3) if results else 0,
        "fastest_time_seconds": round(min(r["time_seconds"] for r in results), 3) if results else 0,
        "slowest_time_seconds": round(max(r["time_seconds"] for r in results), 3) if results else 0,
        "success_rate": round(
            sum(1 for r in results if r["has_recommendation"]) / len(results) * 100, 1
        ) if results else 0,
        "results": results,
    }


def print_benchmark_report(benchmark: Dict[str, Any]):
    print("=" * 60)
    print("  INTELLIGENCE PIPELINE BENCHMARK")
    print("=" * 60)
    print(f"  Runs: {benchmark['total_runs']}")
    print(f"  Total time: {benchmark['total_time_seconds']}s")
    print(f"  Average time: {benchmark['average_time_seconds']}s")
    print(f"  Median (P50): {benchmark['p50_time_seconds']}s")
    print(f"  Fastest: {benchmark['fastest_time_seconds']}s")
    print(f"  Slowest: {benchmark['slowest_time_seconds']}s")
    print(f"  Success rate: {benchmark['success_rate']}%")
    print("=" * 60)


if __name__ == "__main__":
    print("Running intelligence pipeline benchmark...")
    benchmark = benchmark_pipeline(n_runs=3)
    print_benchmark_report(benchmark)
