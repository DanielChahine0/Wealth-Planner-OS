from __future__ import annotations
from fastapi import APIRouter, HTTPException
from app.schemas.simulation import SimulationRequest, SimulationResult
from app.core.simulation.engine import run_simulation
from app.config import settings

router = APIRouter()


@router.post("/simulate", response_model=SimulationResult)
async def simulate(request: SimulationRequest) -> SimulationResult:
    """
    Run a Monte Carlo simulation for the given user profile.

    Validates that n_simulations does not exceed the configured maximum,
    then runs the vectorized simulation engine and returns the result.
    """
    if request.n_simulations > settings.max_simulations:
        raise HTTPException(
            status_code=422,
            detail=f"n_simulations cannot exceed {settings.max_simulations}",
        )
    try:
        return run_simulation(request.profile, request.n_simulations)
    except MemoryError:
        raise HTTPException(
            status_code=503,
            detail="Insufficient memory for simulation",
        )
