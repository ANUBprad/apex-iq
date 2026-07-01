from pydantic import BaseModel, Field
from typing import Optional

class FeatureVector(BaseModel):
    # (Existing fields...)
    current_position: int
    laps_remaining: int
    compound: str # Will be encoded
    tyre_age: int
    fuel_load: float = 50.0
    weather_factor: float = 1.0
    gap_ahead: float = 0.0
    gap_behind: float = 0.0

    # Driver Context Features
    aggression: int
    consistency: int
    racecraft: int
    overtake_efficiency: int
    tyre_management: int
    wet_weather_skill: int

    # Team Context Features
    risk_tolerance: int
    undercut_bias: int
    tyre_focus: int
    weather_adaptability: int

    # Circuit Context Features
    track_length: float
    lap_count: int
    pit_loss: float


class FeatureContext(BaseModel):
    # Race State
    current_position: int
    laps_remaining: int
    compound: str
    tyre_age: int
    fuel_load: float = 50.0
    weather_factor: float = 1.0
    gap_ahead: float = 0.0
    gap_behind: float = 0.0

    # Driver (Primitives only)
    driver_aggression: int
    driver_consistency: int
    driver_racecraft: int
    driver_overtake_efficiency: int
    driver_tyre_management: int
    driver_wet_weather_skill: int

    # Team (Primitives only)
    team_risk_tolerance: int
    team_undercut_bias: int
    team_tyre_focus: int
    team_weather_adaptability: int

    # Circuit (Primitives only)
    track_length: float
    track_lap_count: int
    track_pit_loss: float
