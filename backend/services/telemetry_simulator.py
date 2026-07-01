import time
import math
import random
from collections import deque

_start_time = time.time()
_history: deque = deque(maxlen=120)
_radio_events = [
    {"time_offset": 5, "speaker": "Engineer", "message": "Box box this lap, box box."},
    {"time_offset": 45, "speaker": "Driver", "message": "Copy, staying out for now."},
    {"time_offset": 90, "speaker": "Engineer", "message": "Car behind is 1.2 seconds, push."},
    {"time_offset": 140, "speaker": "Driver", "message": "Tyres are going off in sector 3."},
    {"time_offset": 200, "speaker": "Engineer", "message": "Undercut window open, pit this lap."},
    {"time_offset": 260, "speaker": "Driver", "message": "Battery is low, lift and coast into turn 1."},
    {"time_offset": 320, "speaker": "Engineer", "message": "Safety car deploy, stay out stay out."},
    {"time_offset": 400, "speaker": "Driver", "message": "DRS is good, overtaking on the straight."},
    {"time_offset": 480, "speaker": "Engineer", "message": "Rain in 5 laps, prepare inters."},
    {"time_offset": 560, "speaker": "Driver", "message": "Floor damage, losing downforce in high speed."},
]
_radio_events_shown: set = set()

# Track segments for realistic simulation
_TRACK_SEGMENTS = [
    {"name": "Main Straight", "speed_range": (310, 340), "throttle_range": (95, 100), "brake_range": (0, 0), "ers_range": (0.3, 0.6), "gear_range": (7, 8)},
    {"name": "Turn 1 Braking", "speed_range": (80, 120), "throttle_range": (0, 5), "brake_range": (85, 100), "ers_range": (0.1, 0.2), "gear_range": (1, 3)},
    {"name": "Turn 1 Apex", "speed_range": (70, 95), "throttle_range": (10, 30), "brake_range": (0, 15), "ers_range": (0.2, 0.3), "gear_range": (1, 2)},
    {"name": "Exit Turn 1", "speed_range": (120, 180), "throttle_range": (60, 90), "brake_range": (0, 0), "ers_range": (0.4, 0.7), "gear_range": (3, 5)},
    {"name": "Short Straight", "speed_range": (240, 290), "throttle_range": (85, 100), "brake_range": (0, 0), "ers_range": (0.3, 0.5), "gear_range": (6, 7)},
    {"name": "Turn 2 Braking", "speed_range": (100, 140), "throttle_range": (0, 5), "brake_range": (80, 100), "ers_range": (0.1, 0.2), "gear_range": (2, 4)},
    {"name": "Turn 2 Apex", "speed_range": (90, 120), "throttle_range": (15, 35), "brake_range": (0, 10), "ers_range": (0.2, 0.3), "gear_range": (2, 3)},
    {"name": "Back Straight", "speed_range": (280, 320), "throttle_range": (90, 100), "brake_range": (0, 0), "ers_range": (0.5, 0.8), "gear_range": (7, 8)},
    {"name": "Chicane", "speed_range": (60, 100), "throttle_range": (5, 25), "brake_range": (70, 100), "ers_range": (0.1, 0.2), "gear_range": (1, 3)},
    {"name": "Pit Straight", "speed_range": (260, 310), "throttle_range": (80, 100), "brake_range": (0, 0), "ers_range": (0.4, 0.6), "gear_range": (6, 8)},
]

# Smooth interpolation state
_current_speed = 280.0
_current_rpm = 10000.0
_current_throttle = 80.0
_current_brake = 5.0
_current_gear = 6
_current_ers = 2.0
_current_fuel = 64.0
_current_steering = 0.0
_current_segment_idx = 0
_segment_progress = 0.0
_lap_time = 0.0
_lap_count = 1
_sector = 1
_drs_active = False
_current_tyre_wear_fl = 32.0
_current_tyre_wear_fr = 31.5
_current_tyre_wear_rl = 28.0
_current_tyre_wear_rr = 27.8
_tyre_temp_fl = 98.0
_tyre_temp_fr = 100.0
_tyre_temp_rl = 88.0
_tyre_temp_rr = 90.0
_tyre_pressure_fl = 23.1
_tyre_pressure_fr = 23.3
_tyre_pressure_rl = 22.8
_tyre_pressure_rr = 22.9
_track_temp = 38.0
_air_temp = 27.0
_humidity = 45.0
_wind_speed = 12.0
_wind_dir = 180.0
_visibility = 10.0
_session_status = "RACING"
_delta_to_leader = 0.0
_gap_ahead = 1.2
_gap_behind = 2.1
_battery_pct = 65.0
_fuel_used_lap = 1.78
_last_lap_time = 92.847


def _smooth_lerp(current: float, target: float, rate: float) -> float:
    return current + (target - current) * rate


def _clamp(val: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, val))


def generate_telemetry_snapshot() -> dict:
    global _current_speed, _current_rpm, _current_throttle, _current_brake
    global _current_gear, _current_ers, _current_fuel, _current_steering
    global _current_segment_idx, _segment_progress, _lap_time, _lap_count
    global _sector, _drs_active
    global _current_tyre_wear_fl, _current_tyre_wear_fr
    global _current_tyre_wear_rl, _current_tyre_wear_rr
    global _tyre_temp_fl, _tyre_temp_fr, _tyre_temp_rl, _tyre_temp_rr
    global _tyre_pressure_fl, _tyre_pressure_fr, _tyre_pressure_rl, _tyre_pressure_rr
    global _track_temp, _air_temp, _humidity, _wind_speed, _wind_dir, _visibility
    global _session_status, _delta_to_leader, _gap_ahead, _gap_behind
    global _battery_pct, _fuel_used_lap, _last_lap_time
    global _radio_events_shown

    elapsed = time.time() - _start_time
    seg = _TRACK_SEGMENTS[_current_segment_idx]

    # Advance segment
    _segment_progress += 0.025 + random.uniform(-0.005, 0.005)
    if _segment_progress >= 1.0:
        _segment_progress = 0.0
        _current_segment_idx = (_current_segment_idx + 1) % len(_TRACK_SEGMENTS)
        if _current_segment_idx == 0:
            _lap_count += 1
            _lap_time = 0.0
            _last_lap_time = 92.0 + random.uniform(-1.5, 2.0)
            _current_fuel = max(30, _current_fuel - _fuel_used_lap)
        # Update sector
        if _current_segment_idx in (3, 4):
            _sector = 1
        elif _current_segment_idx in (5, 6, 7):
            _sector = 2
        else:
            _sector = 3
        _drs_active = _current_segment_idx in (0, 7, 9)

    # Target values from segment
    speed_target = random.uniform(*seg["speed_range"])
    throttle_target = random.uniform(*seg["throttle_range"])
    brake_target = random.uniform(*seg["brake_range"])
    ers_target = random.uniform(*seg["ers_range"])
    gear_target = random.randint(*seg["gear_range"])

    # Smooth interpolation
    _current_speed = _smooth_lerp(_current_speed, speed_target, 0.15)
    _current_throttle = _smooth_lerp(_current_throttle, throttle_target, 0.2)
    _current_brake = _smooth_lerp(_current_brake, brake_target, 0.25)
    _current_ers = _smooth_lerp(_current_ers, ers_target, 0.08)
    _current_gear = gear_target

    # RPM based on speed and gear
    rpm_base = 4000 + (_current_speed / 340.0) * 8000 + random.uniform(-200, 200)
    _current_rpm = _smooth_lerp(_current_rpm, rpm_base, 0.12)

    # Steering based on segment
    if seg["brake_range"][1] > 50:
        steering_target = random.uniform(-0.6, 0.6)
    else:
        steering_target = random.uniform(-0.1, 0.1)
    _current_steering = _smooth_lerp(_current_steering, steering_target, 0.1)

    # Tyre wear (increases over time)
    wear_rate = 0.001 + (100 - _current_throttle) * 0.00005
    _current_tyre_wear_fl = min(100, _current_tyre_wear_fl + wear_rate + random.uniform(0, 0.0005))
    _current_tyre_wear_fr = min(100, _current_tyre_wear_fr + wear_rate + random.uniform(0, 0.0005))
    _current_tyre_wear_rl = min(100, _current_tyre_wear_rl + wear_rate * 1.05 + random.uniform(0, 0.0005))
    _current_tyre_wear_rr = min(100, _current_tyre_wear_rr + wear_rate * 1.05 + random.uniform(0, 0.0005))

    # Tyre temperatures
    base_temp = 80 + (_current_speed / 340.0) * 25 + _current_throttle * 0.1
    _tyre_temp_fl = _smooth_lerp(_tyre_temp_fl, base_temp + random.uniform(-3, 3), 0.05)
    _tyre_temp_fr = _smooth_lerp(_tyre_temp_fr, base_temp + random.uniform(-3, 3), 0.05)
    _tyre_temp_rl = _smooth_lerp(_tyre_temp_rl, base_temp - 5 + random.uniform(-3, 3), 0.05)
    _tyre_temp_rr = _smooth_lerp(_tyre_temp_rr, base_temp - 5 + random.uniform(-3, 3), 0.05)

    # Tyre pressures
    _tyre_pressure_fl = _smooth_lerp(_tyre_pressure_fl, 23.0 + _tyre_temp_fl * 0.002, 0.02)
    _tyre_pressure_fr = _smooth_lerp(_tyre_pressure_fr, 23.0 + _tyre_temp_fr * 0.002, 0.02)
    _tyre_pressure_rl = _smooth_lerp(_tyre_pressure_rl, 22.5 + _tyre_temp_rl * 0.002, 0.02)
    _tyre_pressure_rr = _smooth_lerp(_tyre_pressure_rr, 22.5 + _tyre_temp_rr * 0.002, 0.02)

    # Environmental
    _track_temp = _smooth_lerp(_track_temp, 38.0 + math.sin(elapsed * 0.001) * 2, 0.01)
    _air_temp = _smooth_lerp(_air_temp, 27.0 + math.sin(elapsed * 0.0005) * 1.5, 0.01)
    _humidity = _smooth_lerp(_humidity, 45.0 + math.sin(elapsed * 0.0003) * 5, 0.01)
    _wind_speed = _smooth_lerp(_wind_speed, 12.0 + math.sin(elapsed * 0.002) * 4, 0.02)
    _wind_dir = (_wind_dir + math.sin(elapsed * 0.0001) * 0.5) % 360

    # Battery
    _battery_pct = _clamp(_battery_pct + (-0.1 if _current_throttle > 80 else 0.05) + random.uniform(-0.02, 0.02), 0, 100)

    # Delta and gaps
    _delta_to_leader = _smooth_lerp(_delta_to_leader, random.uniform(-0.5, 2.0), 0.03)
    _gap_ahead = _smooth_lerp(_gap_ahead, max(0, _gap_ahead + random.uniform(-0.1, 0.1)), 0.05)
    _gap_behind = _smooth_lerp(_gap_behind, max(0, _gap_behind + random.uniform(-0.1, 0.1)), 0.05)

    # Lap time
    _lap_time += 1.0

    # Session status
    statuses = ["RACING", "RACING", "RACING", "RACING", "RACING", "RACING", "RACING", "RACING", "SAFETY_CAR", "VSC"]
    _session_status = statuses[min(int(elapsed / 120) % len(statuses), len(statuses) - 1)]

    # Fuel consumption
    _fuel_used_lap = 1.7 + (_current_throttle / 100) * 0.3 + random.uniform(-0.05, 0.05)

    # Radio events
    visible_radio = []
    for evt in _radio_events:
        if elapsed >= evt["time_offset"] and evt["time_offset"] not in _radio_events_shown:
            _radio_events_shown.add(evt["time_offset"])
        if evt["time_offset"] in _radio_events_shown and elapsed - evt["time_offset"] < 30:
            visible_radio.append({
                "time": f"+{int(evt['time_offset'] // 60)}:{int(evt['time_offset'] % 60):02d}",
                "speaker": evt["speaker"],
                "message": evt["message"],
            })

    snapshot = {
        "timestamp": elapsed,
        "lap": _lap_count,
        "sector": _sector,
        "lap_time": round(_lap_time, 1),
        "last_lap_time": round(_last_lap_time, 3),
        "speed": round(_current_speed),
        "rpm": round(_current_rpm),
        "gear": _current_gear,
        "throttle": round(_current_throttle, 1),
        "brake": round(_current_brake, 1),
        "steering": round(_current_steering, 3),
        "ers_deployment": round(_current_ers, 2),
        "drs_active": _drs_active,
        "fuel_remaining": round(_current_fuel, 1),
        "fuel_per_lap": round(_fuel_used_lap, 2),
        "battery_pct": round(_battery_pct, 1),
        "delta_to_leader": round(_delta_to_leader, 3),
        "gap_ahead": round(_gap_ahead, 2),
        "gap_behind": round(_gap_behind, 2),
        "tyre": {
            "compound": "MEDIUM",
            "wear": {
                "front_left": round(_current_tyre_wear_fl, 1),
                "front_right": round(_current_tyre_wear_fr, 1),
                "rear_left": round(_current_tyre_wear_rl, 1),
                "rear_right": round(_current_tyre_wear_rr, 1),
            },
            "temperature": {
                "front_left": round(_tyre_temp_fl, 1),
                "front_right": round(_tyre_temp_fr, 1),
                "rear_left": round(_tyre_temp_rl, 1),
                "rear_right": round(_tyre_temp_rr, 1),
            },
            "pressure": {
                "front_left": round(_tyre_pressure_fl, 2),
                "front_right": round(_tyre_pressure_fr, 2),
                "rear_left": round(_tyre_pressure_rl, 2),
                "rear_right": round(_tyre_pressure_rr, 2),
            },
        },
        "track": {
            "temp": round(_track_temp, 1),
            "grip_level": round(0.85 + math.sin(elapsed * 0.0002) * 0.1, 2),
            "rubber_level": round(min(1.0, 0.3 + elapsed * 0.00005), 2),
            "clean_air": round(max(0, 1.0 - _gap_behind * 0.1), 2),
            "current_segment": _TRACK_SEGMENTS[_current_segment_idx]["name"],
        },
        "weather": {
            "condition": "Dry",
            "air_temp": round(_air_temp, 1),
            "humidity": round(_humidity, 1),
            "wind_speed": round(_wind_speed, 1),
            "wind_direction": round(_wind_dir, 0),
            "visibility_km": round(_visibility, 1),
            "rain_probability": 0,
        },
        "ers": {
            "deployment": round(_current_ers, 2),
            "harvesting": round(max(0, 0.8 - _current_ers) * 0.5, 2),
            "battery_pct": round(_battery_pct, 1),
            "mode": "BALANCED" if _battery_pct > 30 else "LIFT_COAST",
        },
        "session": {
            "status": _session_status,
            "elapsed_seconds": round(elapsed),
            "lap": _lap_count,
            "total_laps": 58,
            "position": 3,
        },
        "radio": visible_radio,
    }

    _history.append(snapshot)
    return snapshot


def get_telemetry_history(count: int = 60) -> list:
    items = list(_history)
    return items[-count:] if len(items) > count else items
