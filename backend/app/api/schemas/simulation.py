from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime


class SimulationRunRequest(BaseModel):
    circuit_id: Optional[str] = Field(default=None, description="Circuit slug (contextual metadata)")
    driver_id: Optional[str] = Field(default=None, description="Driver slug (contextual metadata)")
    compound: str = Field(..., description="Tyre compound")
    tyre_age: int = Field(..., ge=0)
    laps_remaining: int = Field(..., ge=1)
    base_position: int = Field(..., ge=1)
    gap_ahead: float = Field(default=0.0)
    gap_behind: float = Field(default=0.0)
    iterations: int = Field(default=1000, ge=100, le=100_000)
    degradation_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    weather_factor: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    fuel_load: Optional[float] = Field(default=None, ge=0.0)


class SimulationRunResponse(BaseModel):
    job_id: UUID
    status: str


class SimulationResultData(BaseModel):
    win_prob: float
    podium_prob: float
    avg_finish: float
    best_case: int
    worst_case: int
    iteration_count: int
    execution_time_ms: int


class SimulationJobStatusResponse(BaseModel):
    job_id: UUID
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    result: Optional[SimulationResultData] = None
    error_message: Optional[str] = None
