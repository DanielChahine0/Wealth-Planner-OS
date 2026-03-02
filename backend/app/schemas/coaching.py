from __future__ import annotations
from pydantic import BaseModel
from typing import Literal


class CoachingInsight(BaseModel):
    id: str
    bias_type: str  # recency_bias | loss_aversion | optimism_bias | status_quo_bias | concentration_risk | sequence_risk | under_insurance
    title: str
    observation: str
    impact: str      # quantified, e.g. "costs ~$340K over 30 years"
    suggestion: str
    severity: Literal["high", "medium", "low"]


class CoachingResponse(BaseModel):
    insights: list[CoachingInsight]
