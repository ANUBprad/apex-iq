from pydantic import BaseModel

class StrategyInput(BaseModel):

    compound: str
    tyre_age: int
    circuit: str

    gap_ahead: float
    gap_behind: float

    track_temp: float = 35
    air_temp: float = 25
    rain_probability: float = 0
    weather: str = "Dry"

    fuel_load: float = 100
    fuel_burn_rate: float = 1.8
    laps_remaining: int = 20