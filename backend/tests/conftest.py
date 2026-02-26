from __future__ import annotations
"""
Shared pytest fixtures for Wealth Planner OS backend tests.
"""
import json
import pytest
from unittest.mock import AsyncMock, patch

from app.schemas.profile import UserProfile, AssetAllocation, RiskTolerance, TaxInfo
from app.core.simulation.engine import run_simulation


def make_profile(**overrides) -> UserProfile:
    """Return a valid UserProfile with sensible defaults."""
    defaults = dict(
        current_age=35,
        retirement_age=65,
        annual_income=120_000,
        income_growth_rate=0.03,
        annual_expenses=80_000,
        current_portfolio_value=200_000,
        annual_contribution=20_000,
        asset_allocation=AssetAllocation(
            us_equity=0.6,
            intl_equity=0.2,
            bonds=0.15,
            real_estate=0.05,
            cash=0.0,
        ),
        risk_tolerance=RiskTolerance.moderate,
        goals=[],
        life_events=[],
        tax_info=TaxInfo(filing_status="single", state="CA"),
    )
    defaults.update(overrides)
    return UserProfile(**defaults)


@pytest.fixture
def sample_profile() -> UserProfile:
    """Fixture that returns a valid UserProfile with sensible defaults."""
    return make_profile()


@pytest.fixture
def sample_simulation_result():
    """Fixture that runs a real simulation and returns the result."""
    profile = make_profile()
    return run_simulation(profile, n_simulations=500)


# Valid AdvisorResponse JSON that parse_strategy_response can handle
_MOCK_ADVISOR_JSON = json.dumps({
    "strategy_actions": [
        {
            "id": "action_1",
            "title": "Increase Retirement Contributions",
            "description": "Maximize 401(k) contributions to reduce taxable income and accelerate portfolio growth.",
            "category": "savings",
            "projected_impact": "Adds ~$150,000 to retirement portfolio over 10 years",
            "priority": 1,
        },
        {
            "id": "action_2",
            "title": "Rebalance Asset Allocation",
            "description": "Shift 5% from US equity to international equity to improve diversification.",
            "category": "allocation",
            "projected_impact": "Reduces volatility by approximately 2%",
            "priority": 2,
        },
    ],
    "narrative": (
        "Based on your current financial profile and simulation results, "
        "your plan shows moderate resilience. Key opportunities exist to "
        "optimize contributions and diversify your portfolio allocation."
    ),
})


@pytest.fixture
def mock_claude_client():
    """
    Fixture that patches ClaudeClient.complete with an AsyncMock returning
    a valid JSON strategy string that parse_strategy_response can handle.
    """
    with patch(
        "app.core.advisor.claude_client.ClaudeClient.complete",
        new_callable=AsyncMock,
        return_value=_MOCK_ADVISOR_JSON,
    ) as mock:
        yield mock
