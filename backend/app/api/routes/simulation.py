from __future__ import annotations
from fastapi import APIRouter
from app.schemas.simulation import SimulationRequest, SimulationResult
from app.core.simulation.engine import run_simulation

router = APIRouter()


@router.post("/simulate", response_model=SimulationResult)
async def simulate(request: SimulationRequest) -> SimulationResult:
    return run_simulation(request.profile, request.n_simulations)
