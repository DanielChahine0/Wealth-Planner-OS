from __future__ import annotations
from pydantic import BaseModel, Field
from app.schemas.profile import UserProfile


class SimulationRequest(BaseModel):
    profile: UserProfile
    n_simulations: int = Field(default=10000, ge=1)


class Percentiles(BaseModel):
    p10: list[float]
    p25: list[float]
    p50: list[float]
    p75: list[float]
    p90: list[float]


class SimulationMetadata(BaseModel):
    n_simulations: int
    n_years: int
    simulation_duration_ms: float


class SimulationResult(BaseModel):
    years: list[int]
    percentiles: Percentiles
    success_rate: float
    median_final_value: float
    worst_case_final_value: float
    best_case_final_value: float
    simulation_metadata: SimulationMetadata
    # Raw paths for risk analysis (sampled subset to keep payload small)
    paths_sample: list[list[float]] = []
