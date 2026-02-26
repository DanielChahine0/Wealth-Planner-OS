"""Unit tests for the Monte Carlo simulation engine."""
import pytest
from app.schemas.profile import UserProfile, AssetAllocation, RiskTolerance, TaxInfo
from app.core.simulation.engine import run_simulation


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


def test_healthy_profile_high_success_rate():
    """A high-income, high-saving profile should have near-100% success rate."""
    profile = make_profile(
        annual_income=300_000,
        annual_expenses=60_000,
        current_portfolio_value=1_000_000,
        annual_contribution=80_000,
    )
    result = run_simulation(profile, n_simulations=1000)
    assert result.success_rate > 0.90, f"Expected >90% success, got {result.success_rate:.1%}"


def test_broke_profile_low_success_rate():
    """A profile spending more than it earns should have low success rate."""
    profile = make_profile(
        annual_income=50_000,
        annual_expenses=80_000,
        current_portfolio_value=10_000,
        annual_contribution=0,
    )
    result = run_simulation(profile, n_simulations=1000)
    assert result.success_rate < 0.50, f"Expected <50% success, got {result.success_rate:.1%}"


def test_percentile_ordering():
    """p10 < p25 < p50 < p75 < p90 must hold for all years."""
    profile = make_profile()
    result = run_simulation(profile, n_simulations=500)
    n = len(result.years)
    for i in range(n):
        assert result.percentiles.p10[i] <= result.percentiles.p25[i], f"p10 > p25 at year {i}"
        assert result.percentiles.p25[i] <= result.percentiles.p50[i], f"p25 > p50 at year {i}"
        assert result.percentiles.p50[i] <= result.percentiles.p75[i], f"p50 > p75 at year {i}"
        assert result.percentiles.p75[i] <= result.percentiles.p90[i], f"p75 > p90 at year {i}"


def test_years_length():
    """Years array should span from current year to retirement year."""
    profile = make_profile(current_age=30, retirement_age=60)
    result = run_simulation(profile, n_simulations=200)
    assert len(result.years) == 31  # 30 years + initial year


def test_initial_value():
    """First percentile values should equal the initial portfolio value."""
    initial = 500_000.0
    profile = make_profile(current_portfolio_value=initial)
    result = run_simulation(profile, n_simulations=500)
    # All percentiles at year 0 should be the initial value
    assert abs(result.percentiles.p50[0] - initial) < 1.0


def test_metadata():
    """Simulation metadata should be populated correctly."""
    profile = make_profile()
    result = run_simulation(profile, n_simulations=500)
    assert result.simulation_metadata.n_simulations == 500
    assert result.simulation_metadata.n_years == 30
    assert result.simulation_metadata.simulation_duration_ms > 0
