"""Run Monte Carlo race simulations for what-if strategy analysis."""

import random
from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class SimulationOutcome:
    laps: int
    pit_stops: int
    total_time_seconds: float
    tyre_compound: str
    degradation_factor: float
    safety_car_count: int
    finish_position: int
    vsc_count: int


_TYRE_CLIFF_LAP = {
    "soft": 18,
    "medium": 28,
    "hard": 38,
}

_BASE_LAP_TIME_BY_CIRCUIT = {
    "monaco": 73.0,
    "monza": 80.0,
    "spa": 105.0,
    "silverstone": 90.0,
    "suzuka": 95.0,
    "singapore": 97.0,
    "bahrain": 92.0,
    "hungary": 82.0,
    "baku": 91.0,
    "australia": 82.0,
    "default": 90.0,
}

_FUEL_BURN_PER_LAP = 0.035
_DRS_GAIN = 1.2
_DIRTY_AIR_PENALTY = 0.4
_PIT_TRAFFIC_LOSS = 1.5


def _calc_lap_time(
    lap: int,
    total_laps: int,
    base_lap: float,
    tyre_compound: str,
    degradation: float,
    fuel_load_factor: float,
    has_drs: bool,
    in_dirty_air: bool,
    has_sc: bool,
    has_vsc: bool,
    weather_multiplier: float,
    stint_lap: int,
) -> float:
    lap_time = base_lap * weather_multiplier

    lap_time -= lap * _FUEL_BURN_PER_LAP

    cliff_lap = _TYRE_CLIFF_LAP.get(tyre_compound, 28)
    deg_factor = degradation * 0.06 * weather_multiplier
    if stint_lap <= cliff_lap:
        lap_time += stint_lap * deg_factor * (stint_lap / cliff_lap)
    else:
        post_cliff = stint_lap - cliff_lap
        lap_time += cliff_lap * deg_factor + post_cliff * deg_factor * 3.0

    if has_drs:
        lap_time -= _DRS_GAIN
    if in_dirty_air:
        lap_time += _DIRTY_AIR_PENALTY
    if has_sc:
        lap_time += 5.0 + random.uniform(0, 3)
    if has_vsc:
        lap_time += 2.0 + random.uniform(0, 1)

    lap_time += random.gauss(0, 0.8)
    return max(60.0, lap_time)


def _evolve_weather(
    lap: int,
    total_laps: int,
    base_weather: str,
    weather_change_prob: float = 0.02,
) -> tuple:
    if base_weather == "wet":
        multiplier = 1.12 + random.gauss(0, 0.02)
        return multiplier, base_weather
    elif base_weather == "mixed":
        if lap < total_laps * 0.3:
            multiplier = 1.08 + random.gauss(0, 0.02)
        elif lap < total_laps * 0.7:
            multiplier = 1.04 + random.gauss(0, 0.01)
        else:
            multiplier = 1.0 + random.gauss(0, 0.01)
        return multiplier, base_weather
    else:
        if lap > 2 and random.random() < weather_change_prob:
            new_weather = "mixed"
            return 1.08, new_weather
        return 1.0, base_weather


def simulate_strategy(
    circuit_name: str,
    total_laps: int,
    tyre_compound: str,
    pit_stop_lap: int,
    degradation: float,
    overtaking_difficulty: float = 0.5,
    safety_car_prob: float = 0.15,
    n_iterations: int = 500,
    seed: Optional[int] = None,
    weather: str = "dry",
) -> Dict[str, Any]:
    if seed is not None:
        random.seed(seed)

    outcomes = []
    circuit_key = circuit_name.lower().strip()
    base_lap = _BASE_LAP_TIME_BY_CIRCUIT.get(circuit_key, _BASE_LAP_TIME_BY_CIRCUIT["default"])

    for _ in range(n_iterations):
        pit_stops = 1
        second_stop_lap = 0
        if pit_stop_lap > total_laps * 0.6:
            pit_stops += 1
            second_stop_lap = pit_stop_lap + random.randint(10, 18)
            if second_stop_lap > total_laps:
                second_stop_lap = total_laps - 3

        total_time = 0.0
        sc_count = 0
        vsc_count = 0
        sc_active = False
        sc_laps_remaining = 0
        current_weather = weather
        stint_lap_counter = 0

        for lap in range(1, total_laps + 1):
            stint_lap_counter += 1
            fuel_factor = 1.0 - (lap / total_laps) * 0.5
            drs_active = (lap > 2) and (lap % 5 < 3) and random.random() < 0.6
            dirty_air = random.random() < 0.3
            has_sc = False
            has_vsc = False
            weather_mul, current_weather = _evolve_weather(lap, total_laps, current_weather)

            if sc_active:
                sc_laps_remaining -= 1
                has_sc = True
                if sc_laps_remaining <= 0:
                    sc_active = False
            elif random.random() < safety_car_prob * 0.3:
                sc_active = True
                sc_laps_remaining = random.randint(2, 5)
                sc_count += 1
                has_sc = True
            elif random.random() < safety_car_prob * 0.4:
                has_vsc = True
                vsc_count += 1

            lap_time = _calc_lap_time(
                lap=lap,
                total_laps=total_laps,
                base_lap=base_lap,
                tyre_compound=tyre_compound,
                degradation=degradation,
                fuel_load_factor=fuel_factor,
                has_drs=drs_active,
                in_dirty_air=dirty_air,
                has_sc=has_sc,
                has_vsc=has_vsc,
                weather_multiplier=weather_mul,
                stint_lap=stint_lap_counter,
            )

            pit_loss = 20.0 + overtaking_difficulty * 2
            if lap == pit_stop_lap or (pit_stops > 1 and lap == second_stop_lap):
                lap_time += pit_loss + random.uniform(0, _PIT_TRAFFIC_LOSS)
                stint_lap_counter = 0

            total_time += lap_time

        avg_lap = total_time / total_laps
        pos_delta = (avg_lap - base_lap) * total_laps / (total_laps * 0.4)
        finish_pos = 1 + int(abs(pos_delta))
        finish_pos = max(1, min(20, finish_pos))

        outcomes.append(SimulationOutcome(
            laps=total_laps,
            pit_stops=pit_stops,
            total_time_seconds=total_time,
            tyre_compound=tyre_compound,
            degradation_factor=degradation,
            safety_car_count=sc_count,
            finish_position=finish_pos,
            vsc_count=vsc_count,
        ))

    n = len(outcomes)
    avg_time = sum(o.total_time_seconds for o in outcomes) / n
    avg_pos = sum(o.finish_position for o in outcomes) / n
    avg_stops = sum(o.pit_stops for o in outcomes) / n
    podium_pct = sum(1 for o in outcomes if o.finish_position <= 3) / n * 100
    win_pct = sum(1 for o in outcomes if o.finish_position == 1) / n * 100

    return {
        "circuit": circuit_name,
        "total_laps": total_laps,
        "tyre_compound": tyre_compound,
        "pit_stop_lap": pit_stop_lap,
        "iterations": n_iterations,
        "average_time_seconds": round(avg_time, 1),
        "average_finish_position": round(avg_pos, 1),
        "average_pit_stops": round(avg_stops, 1),
        "podium_probability": round(podium_pct, 1),
        "win_probability": round(win_pct, 1),
        "average_safety_cars": round(sum(o.safety_car_count for o in outcomes) / n, 1),
        "average_vsc": round(sum(o.vsc_count for o in outcomes) / n, 1),
        "model": "v2_nonlinear",
        "weather": current_weather,
    }


def run_what_if_analysis(
    circuit_name: str,
    total_laps: int,
    compounds: List[str],
    pit_window_range: range,
    degradation: float,
    overtaking_difficulty: float,
    weather: str = "dry",
) -> List[Dict[str, Any]]:
    results = []
    for compound in compounds:
        for pit_lap in pit_window_range:
            result = simulate_strategy(
                circuit_name=circuit_name,
                total_laps=total_laps,
                tyre_compound=compound,
                pit_stop_lap=pit_lap,
                degradation=degradation,
                overtaking_difficulty=overtaking_difficulty,
                n_iterations=200,
                weather=weather,
            )
            results.append(result)
    results.sort(key=lambda r: r["average_finish_position"])
    return results
