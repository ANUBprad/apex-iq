"""Analyze telemetry data for performance insights and anomaly detection."""

from typing import Dict, Any, List


def analyze_lap_telemetry(
    lap_times: List[float],
    tyre_temps: List[float],
    tyre_compound: str,
) -> Dict[str, Any]:
    if not lap_times:
        return {"status": "no_data", "laps_analyzed": 0}

    lap_times_sorted = sorted(lap_times)
    n = len(lap_times_sorted)
    median_lap = lap_times_sorted[n // 2] if n else 0
    fastest_lap = lap_times_sorted[0] if n else 0
    slowest_lap = lap_times_sorted[-1] if n else 0
    std_dev = (
        (sum((t - median_lap) ** 2 for t in lap_times) / n) ** 0.5 if n else 0
    )

    avg_tyre_temp = sum(tyre_temps) / len(tyre_temps) if tyre_temps else 0
    tyre_dropoff = max(tyre_temps) - min(tyre_temps) if len(tyre_temps) > 1 else 0
    overheating_laps = sum(1 for t in tyre_temps if t > 105) if tyre_temps else 0

    anomalies = []
    if std_dev > 2.0:
        anomalies.append(
            "High lap time inconsistency detected (std > 2.0s)"
        )
    if overheating_laps > len(lap_times) * 0.2:
        anomalies.append(
            f"Tyre overheating on {overheating_laps}/{len(lap_times)} laps"
        )
    if tyre_dropoff > 15:
        anomalies.append(
            f"Large tyre temperature swing ({tyre_dropoff:.0f}C)"
        )

    degradation_rate = 0.0
    if n > 5:
        first_five = sum(lap_times[:5]) / 5
        last_five = sum(lap_times[-5:]) / 5
        degradation_rate = ((last_five - first_five) / first_five) * 100

    return {
        "status": "analyzed",
        "laps_analyzed": n,
        "median_lap_time_s": round(median_lap, 3),
        "fastest_lap_s": round(fastest_lap, 3),
        "slowest_lap_s": round(slowest_lap, 3),
        "lap_time_std_dev": round(std_dev, 3),
        "average_tyre_temperature_c": round(avg_tyre_temp, 1),
        "tyre_temperature_range_c": round(tyre_dropoff, 1),
        "overheating_laps": overheating_laps,
        "degradation_rate_pct": round(degradation_rate, 2),
        "anomalies": anomalies,
        "tyre_compound": tyre_compound,
    }
