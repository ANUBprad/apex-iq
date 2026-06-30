from typing import Optional, Dict, Any
from backend.app.ml.schemas import FeatureVector, FeatureContext

class FeatureGenerator:
    @staticmethod
    def generate_vector(ctx: FeatureContext) -> FeatureVector:
        """
        Consumes FeatureContext DTO (Primitives only) to produce FeatureVector.
        Completely ORM-independent.
        """
        return FeatureVector(
            # Race State
            current_position=ctx.current_position,
            laps_remaining=ctx.laps_remaining,
            compound=ctx.compound,
            tyre_age=ctx.tyre_age,
            fuel_load=ctx.fuel_load,
            weather_factor=ctx.weather_factor,
            gap_ahead=ctx.gap_ahead,
            gap_behind=ctx.gap_behind,

            # Driver
            aggression=ctx.driver_aggression,
            consistency=ctx.driver_consistency,
            racecraft=ctx.driver_racecraft,
            overtake_efficiency=ctx.driver_overtake_efficiency,
            tyre_management=ctx.driver_tyre_management,
            wet_weather_skill=ctx.driver_wet_weather_skill,

            # Team
            risk_tolerance=ctx.team_risk_tolerance,
            undercut_bias=ctx.team_undercut_bias,
            tyre_focus=ctx.team_tyre_focus,
            weather_adaptability=ctx.team_weather_adaptability,

            # Circuit
            track_length=ctx.track_length,
            lap_count=ctx.track_lap_count,
            pit_loss=ctx.track_pit_loss
        )

    @staticmethod
    def to_array(vector: FeatureVector) -> list:
        # One-hot or label encoding for compound
        compound_map = {"SOFT": 0, "MEDIUM": 1, "HARD": 2, "INTERMEDIATE": 3, "WET": 4}
        compound_val = compound_map.get(vector.compound.upper(), 1)
        
        return [
            vector.current_position,
            vector.laps_remaining,
            compound_val,
            vector.tyre_age,
            vector.fuel_load,
            vector.weather_factor,
            vector.gap_ahead,
            vector.gap_behind,
            vector.aggression,
            vector.consistency,
            vector.racecraft,
            vector.overtake_efficiency,
            vector.tyre_management,
            vector.wet_weather_skill,
            vector.risk_tolerance,
            vector.undercut_bias,
            vector.tyre_focus,
            vector.weather_adaptability,
            vector.track_length,
            vector.lap_count,
            vector.pit_loss
        ]

    @staticmethod
    def get_feature_names() -> list:
        return [
            "current_position", "laps_remaining", "compound", "tyre_age",
            "fuel_load", "weather_factor", "gap_ahead", "gap_behind",
            "aggression", "consistency", "racecraft", "overtake_efficiency",
            "tyre_management", "wet_weather_skill", "risk_tolerance",
            "undercut_bias", "tyre_focus", "weather_adaptability",
            "track_length", "lap_count", "pit_loss"
        ]
