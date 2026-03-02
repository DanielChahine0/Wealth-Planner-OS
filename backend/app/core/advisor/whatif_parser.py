from __future__ import annotations
"""
Interprets natural language what-if questions and returns a modified UserProfile.
Uses Claude to understand the question and translate it into profile changes.
"""
import json
import re
from typing import Optional
from app.schemas.whatif import WhatIfRequest, WhatIfResponse
from app.schemas.profile import UserProfile
from app.core.advisor.claude_client import ClaudeClient

CURRENT_YEAR = 2026

_SYSTEM = """\
You are a financial data transformation assistant. Your only job is to interpret a
user's what-if scenario question and produce a modified version of their financial
profile as valid JSON. You must return ONLY a JSON object — no prose, no markdown,
no code fences.\
"""


def _build_whatif_prompt(request: WhatIfRequest) -> str:
    profile_json = request.profile.model_dump_json(indent=2)
    return f"""\
The user has the following financial profile (JSON):

{profile_json}

Current calendar year: {CURRENT_YEAR}

The user is asking: "{request.question}"

Interpret this scenario and return a JSON object with exactly these three fields:

{{
  "interpretation": "One sentence explaining what the user wants to explore",
  "changes_summary": "Bullet-point list of every field changed, e.g. '• retirement_age: 65 → 60'",
  "modified_profile": {{ ...complete modified UserProfile as JSON... }}
}}

Rules for modified_profile:
- Return the COMPLETE profile JSON, not just the changed fields.
- retirement_age MUST remain strictly greater than current_age.
- asset_allocation weights MUST sum to exactly 1.0 (±0.01 tolerance).
- LifeEvent year values MUST be calendar years (e.g. {CURRENT_YEAR + 1}, {CURRENT_YEAR + 3}).
- If the question involves a future purchase (e.g. "buy a house"), add a LifeEvent with an appropriate one_time_cost and/or expense_delta; use a reasonable income_delta of 0 unless the question implies an income change.
- If the question involves job loss for N months, add a LifeEvent with income_delta = -(monthly_income * N) for the affected year.
- If the question involves a contribution change, update annual_contribution accordingly.
- Do NOT invent fields that are not in the original schema.
- Keep all fields not mentioned in the question identical to the original profile.
- Do NOT include fields "approved", "requires_human_review", or "human_review_reason" in the profile.

Respond ONLY with valid JSON matching the format above.\
"""


class WhatIfParser:
    def __init__(self, client: ClaudeClient):
        self._client = client

    async def parse(self, request: WhatIfRequest) -> WhatIfResponse:
        prompt = _build_whatif_prompt(request)
        raw = await self._client.complete(prompt, system=_SYSTEM)

        # Strip markdown fences if Claude wraps them anyway
        text = raw.strip()
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if match:
                try:
                    data = json.loads(match.group())
                except json.JSONDecodeError:
                    return _fallback_response(request)
            else:
                return _fallback_response(request)

        try:
            modified_profile = UserProfile(**data["modified_profile"])
            return WhatIfResponse(
                modified_profile=modified_profile,
                interpretation=data.get("interpretation", "Scenario applied."),
                changes_summary=data.get("changes_summary", "Profile modified."),
            )
        except Exception:
            return _fallback_response(request)


def _fallback_response(request: WhatIfRequest) -> WhatIfResponse:
    return WhatIfResponse(
        modified_profile=request.profile,
        interpretation="Could not interpret this scenario. Showing original plan.",
        changes_summary="No changes applied.",
    )
