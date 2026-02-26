from __future__ import annotations
"""
Unit tests for the federal + state income tax model.
"""
import pytest
from app.core.simulation.tax import after_tax_income, effective_tax_rate


# ---------------------------------------------------------------------------
# Basic sanity tests
# ---------------------------------------------------------------------------

def test_single_filer_low_income():
    """Single filer at $40k in TX: net > 0, net < gross, effective rate < 15%."""
    net = after_tax_income(40_000, "single", "TX")
    assert net > 0
    assert net < 40_000
    rate = effective_tax_rate(40_000, "single", "TX")
    assert rate < 0.15, f"Expected effective rate < 15% for $40k single TX, got {rate:.2%}"


def test_single_filer_high_income():
    """Single filer at $500k in CA: effective rate > 35% (net < 65% of gross)."""
    net = after_tax_income(500_000, "single", "CA")
    assert net < 500_000 * 0.65, (
        f"Expected net < $325,000 for $500k single CA (rate >35%), got net={net:,.0f}"
    )


def test_mfj_lower_rate():
    """MFJ rate should be lower than single rate at the same income level."""
    income = 200_000
    rate_single = effective_tax_rate(income, "single", "CA")
    rate_mfj = effective_tax_rate(income, "married_filing_jointly", "CA")
    assert rate_mfj < rate_single, (
        f"Expected MFJ rate ({rate_mfj:.2%}) < single rate ({rate_single:.2%}) "
        f"at ${income:,} income in CA"
    )


def test_zero_income():
    """Zero income should return exactly 0.0 with no division errors."""
    net = after_tax_income(0, "single", "CA")
    assert net == 0.0


def test_after_tax_always_less():
    """after_tax_income(100k, single, CA) must be strictly less than gross."""
    net = after_tax_income(100_000, "single", "CA")
    assert net < 100_000, f"Expected net < $100k, got {net:,.2f}"


def test_state_no_income_tax():
    """TX (no state income tax) should yield higher net than CA at the same income."""
    income = 150_000
    net_tx = after_tax_income(income, "single", "TX")
    net_ca = after_tax_income(income, "single", "CA")
    assert net_tx > net_ca, (
        f"Expected TX net ({net_tx:,.0f}) > CA net ({net_ca:,.0f}) at ${income:,}"
    )


@pytest.mark.parametrize(
    "gross, filing_status",
    [
        (30_000,  "single"),
        (60_000,  "married_filing_jointly"),
        (100_000, "single"),
        (250_000, "head_of_household"),
    ],
)
def test_parametrized(gross: float, filing_status: str):
    """after_tax_income should always return 0 < net < gross for reasonable incomes."""
    net = after_tax_income(gross, filing_status, "CA")
    assert 0 < net < gross, (
        f"Expected 0 < net < {gross} for {filing_status} at ${gross:,}, got {net:,.2f}"
    )
