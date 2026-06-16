import enum
from datetime import datetime
from uuid import UUID, uuid4
from typing import List, Optional, Dict, Any
from sqlalchemy import ForeignKey, String, Integer, Float, DateTime, JSON, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import Base

class Team(Base):
    __tablename__ = "teams"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, init=True)
    name: Mapped[str] = mapped_column(String, nullable=False, init=True)
    aggression: Mapped[int] = mapped_column(Integer, default=50, init=True)
    undercut_bias: Mapped[int] = mapped_column(Integer, default=50, init=True)
    risk_tolerance: Mapped[int] = mapped_column(Integer, default=50, init=True)
    tyre_focus: Mapped[int] = mapped_column(Integer, default=50, init=True)
    weather_adaptability: Mapped[int] = mapped_column(Integer, default=50, init=True)

    drivers: Mapped[List["Driver"]] = relationship(back_populates="team", init=False)

class Driver(Base):
    __tablename__ = "drivers"

    id: Mapped[str] = mapped_column(String, primary_key=True, init=True)
    name: Mapped[str] = mapped_column(String, nullable=False, init=True)
    team_id: Mapped[str] = mapped_column(ForeignKey("teams.id"), init=True)
    
    aggression: Mapped[int] = mapped_column(Integer, init=True)
    tyre_management: Mapped[int] = mapped_column(Integer, init=True)
    overtake_efficiency: Mapped[int] = mapped_column(Integer, init=True)
    wet_weather_skill: Mapped[int] = mapped_column(Integer, init=True)
    consistency: Mapped[int] = mapped_column(Integer, init=True)
    racecraft: Mapped[int] = mapped_column(Integer, init=True)

    team: Mapped["Team"] = relationship(back_populates="drivers", init=False)
    sessions: Mapped[List["RaceSession"]] = relationship(back_populates="driver", init=False)

class Circuit(Base):
    __tablename__ = "circuits"

    id: Mapped[str] = mapped_column(String, primary_key=True, init=True)
    name: Mapped[str] = mapped_column(String, nullable=False, init=True)
    laps: Mapped[int] = mapped_column(Integer, init=True)
    length_km: Mapped[float] = mapped_column(Float, init=True)
    avg_pit_loss: Mapped[float] = mapped_column(Float, init=True)
    characteristics: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True, init=True)

    sessions: Mapped[List["RaceSession"]] = relationship(back_populates="circuit", init=False)

class RaceSession(Base):
    __tablename__ = "race_sessions"

    id: Mapped[UUID] = mapped_column(primary_key=True, default_factory=uuid4, init=False)
    circuit_id: Mapped[str] = mapped_column(ForeignKey("circuits.id"), init=True)
    driver_id: Mapped[str] = mapped_column(ForeignKey("drivers.id"), init=True)
    
    start_time: Mapped[datetime] = mapped_column(DateTime, default_factory=datetime.utcnow, init=False)
    config: Mapped[Dict[str, Any]] = mapped_column(JSON, init=True) # compound, tyre_age, gaps, etc.
    status: Mapped[str] = mapped_column(String, default="LIVE", init=True) # LIVE, COMPLETED

    circuit: Mapped["Circuit"] = relationship(back_populates="sessions", init=False)
    driver: Mapped["Driver"] = relationship(back_populates="sessions", init=False)
    simulations: Mapped[List["SimulationResult"]] = relationship(back_populates="session", init=False)
    memories: Mapped[List["StrategyMemory"]] = relationship(back_populates="session", init=False)

class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id: Mapped[UUID] = mapped_column(primary_key=True, default_factory=uuid4, init=False)
    session_id: Mapped[UUID] = mapped_column(ForeignKey("race_sessions.id"), init=True)
    
    win_prob: Mapped[float] = mapped_column(Float, init=True)
    podium_prob: Mapped[float] = mapped_column(Float, init=True)
    avg_finish: Mapped[float] = mapped_column(Float, init=True)
    best_case: Mapped[int] = mapped_column(Integer, init=True)
    worst_case: Mapped[int] = mapped_column(Integer, init=True)
    
    iteration_count: Mapped[int] = mapped_column(Integer, init=True)
    execution_time_ms: Mapped[int] = mapped_column(Integer, init=True)
    raw_output: Mapped[Dict[str, Any]] = mapped_column(JSON, init=True)

    session: Mapped["RaceSession"] = relationship(back_populates="simulations", init=False)

class JobStatus(str, enum.Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class SimulationJob(Base):
    __tablename__ = "simulation_jobs"

    id: Mapped[UUID] = mapped_column(primary_key=True, default_factory=uuid4, init=False)
    params: Mapped[Dict[str, Any]] = mapped_column(JSON, init=True)
    result_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("simulation_results.id"), nullable=True, default=None, init=True)
    error_message: Mapped[Optional[str]] = mapped_column(String, nullable=True, default=None, init=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, default=None, init=True)
    status: Mapped[JobStatus] = mapped_column(SAEnum(JobStatus), default=JobStatus.PENDING, init=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default_factory=datetime.utcnow, init=False)

    result: Mapped[Optional["SimulationResult"]] = relationship(init=False)

class StrategyMemory(Base):
    __tablename__ = "strategy_memory"

    id: Mapped[UUID] = mapped_column(primary_key=True, default_factory=uuid4, init=False)
    session_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("race_sessions.id"), nullable=True, init=True)
    circuit_id: Mapped[str] = mapped_column(ForeignKey("circuits.id"), init=True)
    driver_id: Mapped[str] = mapped_column(ForeignKey("drivers.id"), init=True)
    
    strategy: Mapped[str] = mapped_column(String, init=True)
    success_score: Mapped[float] = mapped_column(Float, init=True) # 0.0 - 1.0
    confidence_score: Mapped[float] = mapped_column(Float, init=True)
    outcome_metadata: Mapped[Dict[str, Any]] = mapped_column(JSON, init=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default_factory=datetime.utcnow, init=False)

    session: Mapped[Optional["RaceSession"]] = relationship(back_populates="memories", init=False)

class HistoricalRace(Base):
    __tablename__ = "historical_races"

    id: Mapped[UUID] = mapped_column(primary_key=True, default_factory=uuid4, init=False)
    circuit_id: Mapped[str] = mapped_column(ForeignKey("circuits.id"), init=True)
    season: Mapped[int] = mapped_column(Integer, init=True)
    winner_id: Mapped[str] = mapped_column(ForeignKey("drivers.id"), init=True)
    
    winning_strategy: Mapped[str] = mapped_column(String, init=True)
    pit_stop_lap: Mapped[int] = mapped_column(Integer, init=True)
    
    starting_grid: Mapped[Dict[str, Any]] = mapped_column(JSON, init=True)
    weather: Mapped[str] = mapped_column(String, init=True)
    fastest_lap: Mapped[Optional[str]] = mapped_column(String, nullable=True, init=True)
    winning_gap: Mapped[Optional[float]] = mapped_column(Float, nullable=True, init=True)
    tyre_strategy: Mapped[Dict[str, Any]] = mapped_column(JSON, init=True)
    race_pace_metrics: Mapped[Dict[str, Any]] = mapped_column(JSON, init=True)
    safety_cars: Mapped[int] = mapped_column(Integer, default=0, init=True)
