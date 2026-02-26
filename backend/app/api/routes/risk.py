"""
Risk analysis route.

Exposes POST /risk/analyze, which computes the fragility score (0–100),
VaR, CVaR, and median max drawdown from a simulation result, then appends
goal-to-risk misalignment flags derived from p10/p50 projections at each
goal's target year.
"""
from __future__ import annotations
from fastapi import APIRouter
from app.schemas.risk import RiskRequest, RiskReport
from app.core.risk.analyzer import analyze_risk
from app.core.risk.alignment import detect_misalignment

router = APIRouter(prefix="/risk")


@router.post("/analyze", response_model=RiskReport)
async def analyze(request: RiskRequest) -> RiskReport:
    """
    Analyze portfolio risk from a completed simulation result.

    Runs the fragility analyzer (VaR, CVaR, drawdown, composite score) against
    the provided simulation result, then overlays goal misalignment flags that
    indicate which goals are at risk of not being met at the p10 or p50 level.
    Returns a complete RiskReport including the fragility score and all flags.
    """
    report = analyze_risk(request.simulation_result)
    flags = detect_misalignment(request.profile, request.simulation_result)
    report.misalignment_flags = flags
    return report
