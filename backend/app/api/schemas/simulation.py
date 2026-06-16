from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime


class SimulationRunRequest(BaseModel):
    circuit_id: str = Field(..., description="Circuit slug")
    driver_id: str = Field(..., description="Driver slug")
    compound: str = Field(..., description="Tyre compound")
    tyre_age: int = Field(..., ge=0)
    laps_remaining: int = Field(..., ge=1)
    gap_ahead: float = Field(default=0.0)
    gap_behind: float = Field(default=0.0)
    base_position: int = Field(default=3, ge=1)
    iterations: int = Field(default=1000, ge=100, le=100_000)


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
