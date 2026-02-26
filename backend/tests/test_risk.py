"""Unit tests for the risk analysis module."""
import pytest
from app.schemas.profile import UserProfile, AssetAllocation, RiskTolerance, TaxInfo, FinancialGoal
from app.core.simulation.engine import run_simulation
from app.core.risk.analyzer import analyze_risk
from app.core.risk.alignment import detect_misalignment


def make_profile(**overrides) -> UserProfile:
    defaults = dict(
        current_age=35,
        retirement_age=65,
        annual_income=120_000,
        income_growth_rate=0.03,
        annual_expenses=80_000,
        current_portfolio_value=200_000,
        annual_contribution=20_000,
        asset_allocation=AssetAllocation(
            us_equity=0.6, intl_equity=0.2, bonds=0.15, real_estate=0.05, cash=0.0
        ),
        risk_tolerance=RiskTolerance.moderate,
        goals=[],
        life_events=[],
        tax_info=TaxInfo(),
    )
    defaults.update(overrides)
    return UserProfile(**defaults)


def test_fragility_score_range():
    """Fragility score must be between 0 and 100."""
    profile = make_profile()
    result = run_simulation(profile, n_simulations=500)
    report = analyze_risk(result)
    assert 0 <= report.fragility_score <= 100


def test_high_success_rate_low_fragility():
    """A very healthy plan should have a low fragility score."""
    profile = make_profile(
        annual_income=300_000,
        annual_expenses=60_000,
        current_portfolio_value=2_000_000,
    )
    result = run_simulation(profile, n_simulations=500)
    report = analyze_risk(result)
    assert report.fragility_score < 40, f"Expected fragility < 40, got {report.fragility_score}"


def test_misalignment_critical_goal():
    """A goal that's clearly unachievable should generate a critical flag."""
    profile = make_profile(
        current_portfolio_value=10_000,
        annual_contribution=1_000,
        goals=[
            FinancialGoal(
                id="g1",
                name="House Down Payment",
                target_amount=5_000_000,
                target_year=2035,
                priority="critical",
            )
        ],
    )
    result = run_simulation(profile, n_simulations=500)
    flags = detect_misalignment(profile, result)
    assert any(f.severity == "critical" for f in flags), "Expected at least one critical flag"


def test_misalignment_achievable_goal():
    """A small goal clearly within reach should be flagged as 'ok'."""
    profile = make_profile(
        current_portfolio_value=500_000,
        annual_contribution=30_000,
        goals=[
            FinancialGoal(
                id="g1",
                name="Vacation Fund",
                target_amount=10_000,
                target_year=2030,
                priority="nice_to_have",
            )
        ],
    )
    result = run_simulation(profile, n_simulations=500)
    flags = detect_misalignment(profile, result)
    assert any(f.severity == "ok" for f in flags), "Expected at least one 'ok' flag"
