from __future__ import annotations
"""
Unit tests for advisor/prompt_builder.py.

Covers:
- _format_currency: millions, thousands, sub-thousand, negatives
- build_recommend_prompt: key sections, profile data, JSON format instructions
- build_chat_system_prompt: advisor persona, disclaimer instruction, context block
"""
import pytest
from app.core.simulation.engine import run_simulation
from app.core.risk.analyzer import analyze_risk
from app.core.risk.alignment import detect_misalignment
from app.core.advisor.prompt_builder import (
    _format_currency,
    build_recommend_prompt,
    build_chat_system_prompt,
)
from app.schemas.profile import FinancialGoal, LifeEvent
from app.schemas.risk import RiskReport
from tests.conftest import make_profile


# ---------------------------------------------------------------------------
# Shared fixture
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def base_context():
    profile = make_profile()
    result = run_simulation(profile, n_simulations=200)
    risk = analyze_risk(result)
    return profile, result, risk


# ---------------------------------------------------------------------------
# _format_currency
# ---------------------------------------------------------------------------

class TestFormatCurrency:
    def test_millions(self):
        assert _format_currency(2_500_000) == "$2.5M"

    def test_millions_round(self):
        assert _format_currency(1_000_000) == "$1.0M"

    def test_thousands(self):
        assert _format_currency(75_000) == "$75K"

    def test_thousands_exact(self):
        assert _format_currency(1_000) == "$1K"

    def test_sub_thousand(self):
        assert _format_currency(500) == "$500"

    def test_zero(self):
        assert _format_currency(0) == "$0"

    def test_negative_millions(self):
        # abs(-1_500_000) >= 1_000_000, so formatted with M suffix
        result = _format_currency(-1_500_000)
        assert "M" in result
        assert "-" in result

    def test_negative_thousands(self):
        result = _format_currency(-20_000)
        assert "K" in result
        assert "-" in result


# ---------------------------------------------------------------------------
# build_recommend_prompt
# ---------------------------------------------------------------------------

class TestBuildRecommendPrompt:
    def test_contains_success_rate_section(self, base_context):
        profile, result, risk = base_context
        prompt = build_recommend_prompt(profile, result, risk)
        assert "Success Rate" in prompt

    def test_contains_fragility_score_section(self, base_context):
        profile, result, risk = base_context
        prompt = build_recommend_prompt(profile, result, risk)
        assert "Fragility Score" in prompt

    def test_contains_json_format_instruction(self, base_context):
        profile, result, risk = base_context
        prompt = build_recommend_prompt(profile, result, risk)
        assert "strategy_actions" in prompt
        assert "narrative" in prompt

    def test_contains_profile_ages(self, base_context):
        profile, result, risk = base_context
        prompt = build_recommend_prompt(profile, result, risk)
        assert str(profile.current_age) in prompt
        assert str(profile.retirement_age) in prompt

    def test_no_goals_shows_placeholder(self, base_context):
        profile, result, risk = base_context
        prompt = build_recommend_prompt(profile, result, risk)
        assert "No specific goals defined" in prompt

    def test_goals_listed_when_present(self):
        profile = make_profile(
            goals=[FinancialGoal(id="g1", name="College Fund", target_amount=100_000, target_year=2040)],
        )
        result = run_simulation(profile, n_simulations=200)
        risk = analyze_risk(result)
        prompt = build_recommend_prompt(profile, result, risk)
        assert "College Fund" in prompt

    def test_life_events_listed_when_present(self):
        profile = make_profile(
            life_events=[LifeEvent(id="e1", name="Career Break", year=2028, income_delta=-30_000)],
        )
        result = run_simulation(profile, n_simulations=200)
        risk = analyze_risk(result)
        prompt = build_recommend_prompt(profile, result, risk)
        assert "Career Break" in prompt

    def test_no_life_events_shows_none_placeholder(self, base_context):
        profile, result, risk = base_context
        prompt = build_recommend_prompt(profile, result, risk)
        # The template uses "  - None" for empty life events
        assert "None" in prompt

    def test_contains_risk_tolerance(self, base_context):
        profile, result, risk = base_context
        prompt = build_recommend_prompt(profile, result, risk)
        assert profile.risk_tolerance.value in prompt

    def test_contains_simulation_count(self, base_context):
        profile, result, risk = base_context
        prompt = build_recommend_prompt(profile, result, risk)
        assert str(result.simulation_metadata.n_simulations) in prompt

    def test_contains_var_section(self, base_context):
        profile, result, risk = base_context
        prompt = build_recommend_prompt(profile, result, risk)
        assert "VaR" in prompt


# ---------------------------------------------------------------------------
# build_chat_system_prompt
# ---------------------------------------------------------------------------

class TestBuildChatSystemPrompt:
    def test_contains_advisor_persona(self, base_context):
        profile, result, risk = base_context
        prompt = build_chat_system_prompt(profile, result, risk)
        assert "financial advisor" in prompt.lower()

    def test_contains_disclaimer_instruction(self, base_context):
        profile, result, risk = base_context
        prompt = build_chat_system_prompt(profile, result, risk)
        assert "disclaimer" in prompt.lower()

    def test_contains_client_profile_context(self, base_context):
        profile, result, risk = base_context
        prompt = build_chat_system_prompt(profile, result, risk)
        assert "Client Financial Profile" in prompt

    def test_different_from_recommend_prompt(self, base_context):
        """Chat system prompt has a different preamble from recommend prompt."""
        profile, result, risk = base_context
        chat_prompt = build_chat_system_prompt(profile, result, risk)
        rec_prompt = build_recommend_prompt(profile, result, risk)
        # The recommend prompt instructs JSON output; chat prompt does not
        assert "JSON object" not in chat_prompt
