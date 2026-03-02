from __future__ import annotations
"""
Behavioral finance coaching layer.
Analyzes user profile for cognitive biases and returns 1-3 structured insights.
"""
import json
import re
from app.schemas.coaching import CoachingInsight, CoachingResponse
from app.schemas.profile import UserProfile
from app.schemas.simulation import SimulationResult
from app.schemas.risk import RiskReport
from app.core.advisor.claude_client import ClaudeClient
from app.core.advisor.prompt_builder import _build_context_block

_SYSTEM = """\
You are a behavioral finance expert. Your job is to identify cognitive biases and
behavioral patterns in a client's financial decisions that are silently costing them
money or increasing risk. Return ONLY valid JSON — no markdown, no prose.\
"""

_BIAS_TYPES = (
    "recency_bias | loss_aversion | optimism_bias | status_quo_bias | "
    "concentration_risk | sequence_risk | under_insurance"
)

_PROMPT_TEMPLATE = """\
{context}

---

## Behavioral Finance Coaching Task

Analyze the above client profile for behavioral biases and financially costly patterns.
Identify 1 to 3 of the most impactful issues from this list: {bias_types}

Definitions to guide you:
- recency_bias: Allocation is overly conservative/aggressive due to recent market events
- loss_aversion: Holding too much cash/bonds despite long timeline, sacrificing growth
- optimism_bias: Overestimating income growth, underestimating expenses, or ignoring sequence-of-returns risk near retirement
- status_quo_bias: Under-contributing despite high income capacity (savings_rate < 15% or contribution room unused)
- concentration_risk: >60% in a single asset class
- sequence_risk: >70% equities within 5 years of retirement
- under_insurance: Emergency fund < 3 months or no mention of adequate protection

Return a JSON object with exactly this structure (no markdown):
{{
  "insights": [
    {{
      "id": "insight_1",
      "bias_type": "loss_aversion",
      "title": "Short, direct title (max 8 words)",
      "observation": "What you detected in their profile (1-2 sentences, use their actual numbers)",
      "impact": "Quantified cost, e.g. 'costs ~$280K over 25 years vs moderate allocation'",
      "suggestion": "Specific actionable correction (1-2 sentences)",
      "severity": "high|medium|low"
    }}
  ]
}}

Rules:
- Only include biases that are clearly present — do NOT invent problems.
- Use their actual numbers: ages, amounts, percentages from the profile.
- severity high = estimated impact > $200K or success rate impact > 10pp; medium = $50K-$200K; low = < $50K.
- Return between 1 and 3 insights.
- Return ONLY the JSON object.
"""


class CoachingAnalyzer:
    def __init__(self, client: ClaudeClient):
        self._client = client

    async def analyze(
        self,
        profile: UserProfile,
        simulation_result: SimulationResult,
        risk_report: RiskReport,
    ) -> CoachingResponse:
        context = _build_context_block(profile, simulation_result, risk_report)
        prompt = _PROMPT_TEMPLATE.format(context=context, bias_types=_BIAS_TYPES)
        raw = await self._client.complete(prompt, system=_SYSTEM)

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
                    return CoachingResponse(insights=[])
            else:
                return CoachingResponse(insights=[])

        try:
            insights = []
            for i, raw_insight in enumerate(data.get("insights", [])):
                insights.append(
                    CoachingInsight(
                        id=raw_insight.get("id", f"insight_{i+1}"),
                        bias_type=raw_insight.get("bias_type", "status_quo_bias"),
                        title=raw_insight.get("title", "Financial Pattern Detected"),
                        observation=raw_insight.get("observation", ""),
                        impact=raw_insight.get("impact", ""),
                        suggestion=raw_insight.get("suggestion", ""),
                        severity=raw_insight.get("severity", "medium"),
                    )
                )
            return CoachingResponse(insights=insights[:3])
        except Exception:
            return CoachingResponse(insights=[])
