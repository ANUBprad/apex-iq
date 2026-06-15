from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID

# Existing schemas to reference or include
from backend.app.api.schemas.strategy import StrategyInput

class DriverSummary(BaseModel):
    id: str
    name: str
    aggression: int
    consistency: int

class TeamSummary(BaseModel):
    id: str
    name: str
    risk_tolerance: int

class StrategySummary(BaseModel):
    action: str
    optimal_lap: int
    confidence: float
    reasoning: str

class SimulationSummary(BaseModel):
    win_prob: float
    podium_prob: float
    avg_finish: float

class HistorySummary(BaseModel):
    similarity: float
    historical_strategy: str
    success_rate: float

class DashboardAggregateResponse(BaseModel):
    driver: DriverSummary
    team: TeamSummary
    strategy: StrategySummary
    simulation: Optional[SimulationSummary] = None
    history: HistorySummary
    status: str = "success"

class DashboardAggregateParams(BaseModel):
    circuit_id: str = Field(..., description="Circuit slug")
    driver_id: str = Field(..., description="Driver slug")
    compound: str
    tyre_age: int
    laps_remaining: int
