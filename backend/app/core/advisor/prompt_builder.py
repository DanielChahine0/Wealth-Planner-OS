from __future__ import annotations
"""
Builds structured prompts for Claude from simulation and risk context.
Compresses data into a token-efficient format.
"""
from app.schemas.profile import UserProfile
from app.schemas.simulation import SimulationResult
from app.schemas.risk import RiskReport


def _format_currency(amount: float) -> str:
    if abs(amount) >= 1_000_000:
        return f"${amount/1_000_000:.1f}M"
    if abs(amount) >= 1_000:
        return f"${amount/1_000:.0f}K"
    return f"${amount:.0f}"


def _build_context_block(
    profile: UserProfile,
    result: SimulationResult,
    risk: RiskReport,
) -> str:
    allocation = profile.asset_allocation.model_dump()
    alloc_str = ", ".join(
        f"{k.replace('_', ' ').title()}: {v:.0%}"
        for k, v in allocation.items()
        if v > 0
    )

    goals_str = "\n".join(
        f"  - {g.name}: {_format_currency(g.target_amount)} by {g.target_year} [{g.priority}]"
        for g in profile.goals
    ) or "  - No specific goals defined"

    flags_str = "\n".join(
        f"  - [{f.severity.upper()}] {f.goal_name}: {f.message}"
        for f in risk.misalignment_flags
    ) or "  - No misalignment flags"

    life_events_str = "\n".join(
        f"  - {e.name} ({e.year}): income Δ${e.income_delta:+,.0f}, expense Δ${e.expense_delta:+,.0f}"
        for e in profile.life_events
    ) or "  - None"

    return f"""## Client Financial Profile

**Demographics**: Age {profile.current_age} → Retirement at {profile.retirement_age}
**Income**: {_format_currency(profile.annual_income)}/yr (growth: {profile.income_growth_rate:.1%}/yr)
**Expenses**: {_format_currency(profile.annual_expenses)}/yr
**Portfolio**: {_format_currency(profile.current_portfolio_value)} current | {_format_currency(profile.annual_contribution)}/yr contribution
**Allocation**: {alloc_str}
**Risk Tolerance**: {profile.risk_tolerance.value}
**Tax**: {profile.tax_info.filing_status}, {profile.tax_info.state}

**Financial Goals**:
{goals_str}

**Planned Life Events**:
{life_events_str}

## Monte Carlo Simulation Results (n={result.simulation_metadata.n_simulations:,})

- **Success Rate**: {result.success_rate:.1%} of simulations reach retirement with positive portfolio
- **Median Final Portfolio**: {_format_currency(result.median_final_value)}
- **P90 (Optimistic)**: {_format_currency(result.percentiles.p90[-1])}
- **P10 (Pessimistic)**: {_format_currency(result.percentiles.p10[-1])}
- **Worst Case (5th pct)**: {_format_currency(result.worst_case_final_value)}

## Risk Analysis

- **Fragility Score**: {risk.fragility_score:.0f}/100 (higher = more fragile)
- **VaR (5th pct)**: {_format_currency(risk.var_5th_percentile)}
- **CVaR (Expected Shortfall)**: {_format_currency(risk.cvar_5th_percentile)}
- **Portfolio Volatility**: {risk.portfolio_volatility:.1%}
- **Median Max Drawdown**: {risk.max_drawdown_median:.1%}
- **Risk Narrative**: {risk.risk_narrative}

**Goal Misalignment Flags**:
{flags_str}"""


def build_recommend_prompt(
    profile: UserProfile,
    result: SimulationResult,
    risk: RiskReport,
) -> str:
    context = _build_context_block(profile, result, risk)
    return f"""{context}

---

## Task

You are an expert fee-only financial advisor. Based on the above client profile and simulation results, provide **5 to 7 ranked strategy recommendations** to improve the client's financial outcome.

Respond with a JSON object (no markdown, no code fences) in exactly this format:
{{
  "narrative": "2-3 sentence summary of the client's situation and overall strategy direction",
  "strategy_actions": [
    {{
      "id": "action_1",
      "title": "Short action title (max 8 words)",
      "description": "Specific, actionable description with numbers where possible (2-4 sentences)",
      "category": "savings|allocation|tax|insurance|income|spending",
      "projected_impact": "Quantified impact estimate (e.g., '+$180K median portfolio by retirement')",
      "priority": 1
    }}
  ]
}}

Rules:
- Priority 1 = highest impact; number them 1 through N
- Be specific: use the client's actual numbers
- categories must be one of: savings, allocation, tax, insurance, income, spending
- Avoid generic advice; tailor everything to this client's situation
- Do NOT include a disclaimer in the JSON (it is added automatically)
"""


def build_chat_system_prompt(
    profile: UserProfile,
    result: SimulationResult,
    risk: RiskReport,
) -> str:
    context = _build_context_block(profile, result, risk)
    return f"""You are an expert fee-only financial advisor and wealth planning AI assistant.
You have access to the client's complete financial profile and simulation results below.
Answer questions concisely, use specific numbers from their profile, and always provide
actionable guidance. Be honest about uncertainty. Do not recommend specific securities.

{context}

Always end responses with a brief disclaimer reminding the user this is AI-generated
information and not a substitute for licensed financial advice."""
