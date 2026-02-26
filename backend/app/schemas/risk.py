from __future__ import annotations
from pydantic import BaseModel
from app.schemas.simulation import SimulationResult
from app.schemas.profile import UserProfile


class RiskRequest(BaseModel):
    profile: UserProfile
    simulation_result: SimulationResult


class MisalignmentFlag(BaseModel):
    goal_id: str
    goal_name: str
    severity: str  # "critical" | "warning" | "ok"
    message: str
    projected_value: float
    required_value: float


class RiskReport(BaseModel):
    fragility_score: float  # 0-100 (higher = more fragile)
    var_5th_percentile: float  # Value at Risk at 5th pct
    cvar_5th_percentile: float  # Conditional VaR (expected shortfall)
    misalignment_flags: list[MisalignmentFlag]
    risk_narrative: str
    portfolio_volatility: float
    max_drawdown_median: float
