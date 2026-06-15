from pydantic import BaseModel, Field
from typing import Optional

class StrategyInput(BaseModel):
    circuit: str = Field(..., description="Circuit slug (e.g., 'monaco')")
    driver: str = Field(..., description="Driver slug (e.g., 'verstappen')")
    compound: str = Field(..., description="Tyre compound")
    tyre_age: int = Field(..., ge=0)
    gap_ahead: float = Field(..., description="Gap to car ahead in seconds")
    gap_behind: float = Field(..., description="Gap to car behind in seconds")
    laps_remaining: Optional[int] = 20
    track_temp: Optional[float] = 35.0
    air_temp: Optional[float] = 25.0
    rain_probability: Optional[float] = 0.0
    fuel_load: Optional[float] = 100.0
