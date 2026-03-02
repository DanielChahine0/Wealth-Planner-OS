from __future__ import annotations
from pydantic import BaseModel
from app.schemas.profile import UserProfile


class WhatIfRequest(BaseModel):
    question: str
    profile: UserProfile


class WhatIfResponse(BaseModel):
    modified_profile: UserProfile
    interpretation: str   # e.g. "You want to see what happens if you retire 5 years early"
    changes_summary: str  # e.g. "Changed retirement_age from 65 to 60"
