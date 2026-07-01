from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID

from backend.app.api.schemas.strategy import StrategyInput


class ReasoningItem(BaseModel):
    source: str = Field(..., description="Source of evidence: historical, driver_trait, team_dna, simulation, strategy_memory")
    detail: str = Field(..., description="Human-readable explanation")
    impact: str = Field(..., description="Impact direction: positive, negative, neutral")


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
    distribution: List[Dict[str, Any]] = []
    best_case: int = 1
    worst_case: int = 20


class HistorySummary(BaseModel):
    similarity: float
    historical_strategy: str
    success_rate: float


class FactorScore(BaseModel):
    name: str
    friendly_name: str
    impact: float


class PredictionExplanation(BaseModel):
    prediction: float
    factors: List[FactorScore] = []
    explanation_type: str


class ConfidenceWeight(BaseModel):
    source: str
    weight: float
    value: float


class DashboardAggregateResponse(BaseModel):
    circuit_id: str
    recommendation: str
    confidence: float

    confidence_weights: List[ConfidenceWeight] = []
    pit_window: Optional[int] = None
    risk_level: str
    historical_success_rate: float
    memory_success_rate: float
    memory_match_count: int
    win_probability: float
    win_probability_ml: float
    podium_probability_ml: float
    top5_probability_ml: float
    prediction_explanation: PredictionExplanation
    reasoning: List[ReasoningItem]
    driver: DriverSummary
    team: TeamSummary
    strategy: StrategySummary
    simulation: SimulationSummary
    history: HistorySummary
    status: str = "success"



class DashboardAggregateRequest(BaseModel):
    circuit_id: str = Field(..., description="Circuit slug")
    driver_id: str = Field(..., description="Driver slug")
    compound: str
    tyre_age: int
    laps_remaining: int
    current_position: int = Field(5, ge=1, le=20)
    iterations: int = Field(1000, ge=100, le=10000)
