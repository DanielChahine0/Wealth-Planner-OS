from __future__ import annotations
import time
import numpy as np
from fastapi import APIRouter
from app.config import settings

_start_time: float = time.time()

router = APIRouter()


@router.get("/health/detailed")
async def health_detailed() -> dict:
    return {
        "status": "ok",
        "environment": settings.environment,
        "anthropic_configured": bool(settings.anthropic_api_key),
        "numpy_version": np.__version__,
        "uptime_seconds": time.time() - _start_time,
    }
