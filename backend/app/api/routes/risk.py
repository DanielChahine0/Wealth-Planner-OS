from __future__ import annotations
from fastapi import APIRouter
from app.schemas.risk import RiskRequest, RiskReport
from app.core.risk.analyzer import analyze_risk
from app.core.risk.alignment import detect_misalignment

router = APIRouter(prefix="/risk")


@router.post("/analyze", response_model=RiskReport)
async def analyze(request: RiskRequest) -> RiskReport:
    report = analyze_risk(request.simulation_result)
    flags = detect_misalignment(request.profile, request.simulation_result)
    report.misalignment_flags = flags
    return report
