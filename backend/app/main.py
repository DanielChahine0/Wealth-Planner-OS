from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes import simulation, risk, advisor

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


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "environment": settings.environment}
