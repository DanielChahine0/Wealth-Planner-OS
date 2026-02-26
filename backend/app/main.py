from __future__ import annotations
import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.api.routes import simulation, risk, advisor, health

logging.basicConfig(level=settings.log_level.upper())

app = FastAPI(
    title="Wealth Planner OS",
    description="AI-powered wealth planning engine with Monte Carlo simulation",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulation.router, tags=["simulation"])
app.include_router(risk.router, tags=["risk"])
app.include_router(advisor.router, tags=["advisor"])
app.include_router(health.router, tags=["health"])


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": "Validation error", "detail": exc.errors()},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "environment": settings.environment}
