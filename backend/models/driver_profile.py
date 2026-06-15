from pydantic import BaseModel

class DriverProfile(BaseModel):
    name: str
    aggression: int
    tyre_management: int
    overtake_efficiency: int
    wet_weather_skill: int
    consistency: int
    racecraft: int