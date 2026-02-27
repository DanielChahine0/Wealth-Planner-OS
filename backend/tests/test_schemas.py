from __future__ import annotations
"""
Unit tests for schemas/profile.py Pydantic validation.

Covers:
- AssetAllocation: valid, weights-don't-sum-to-one, boundary tolerance, negatives, >1
- FinancialGoal: valid, past target_year, zero amount, invalid priority, all valid priorities
- UserProfile: valid, retirement_age <= current_age, negative income, age < 18, defaults
- TaxInfo: valid filing statuses
"""
import pytest
from pydantic import ValidationError
from app.schemas.profile import (
    AssetAllocation,
    FinancialGoal,
    UserProfile,
    TaxInfo,
    RiskTolerance,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _valid_allocation() -> AssetAllocation:
    return AssetAllocation(us_equity=0.6, intl_equity=0.2, bonds=0.15, real_estate=0.05, cash=0.0)


def _valid_profile_kwargs() -> dict:
    return dict(
        current_age=35,
        retirement_age=65,
        annual_income=120_000,
        annual_expenses=80_000,
        current_portfolio_value=200_000,
        annual_contribution=20_000,
        asset_allocation=_valid_allocation(),
    )


# ---------------------------------------------------------------------------
# AssetAllocation
# ---------------------------------------------------------------------------

class TestAssetAllocation:
    def test_valid_allocation_accepted(self):
        alloc = _valid_allocation()
        assert alloc.us_equity == pytest.approx(0.6)

    def test_weights_summing_to_09_rejected(self):
        with pytest.raises(ValidationError, match="sum to 1.0"):
            AssetAllocation(us_equity=0.5, intl_equity=0.2, bonds=0.15, real_estate=0.05, cash=0.0)

    def test_weights_summing_to_11_rejected(self):
        with pytest.raises(ValidationError, match="sum to 1.0"):
            AssetAllocation(us_equity=0.7, intl_equity=0.2, bonds=0.15, real_estate=0.05, cash=0.0)

    def test_tolerance_boundary_accepted(self):
        """0.995 total is within ±0.01 tolerance and must be accepted."""
        alloc = AssetAllocation(us_equity=0.595, intl_equity=0.2, bonds=0.15, real_estate=0.05, cash=0.0)
        assert alloc is not None

    def test_negative_weight_rejected(self):
        with pytest.raises(ValidationError):
            AssetAllocation(us_equity=-0.1, intl_equity=0.5, bonds=0.4, real_estate=0.2, cash=0.0)

    def test_weight_above_one_rejected(self):
        with pytest.raises(ValidationError):
            AssetAllocation(us_equity=1.5, intl_equity=0.0, bonds=0.0, real_estate=0.0, cash=0.0)

    def test_all_cash_valid(self):
        alloc = AssetAllocation(us_equity=0.0, intl_equity=0.0, bonds=0.0, real_estate=0.0, cash=1.0)
        assert alloc.cash == 1.0


# ---------------------------------------------------------------------------
# FinancialGoal
# ---------------------------------------------------------------------------

class TestFinancialGoal:
    def test_valid_goal_accepted(self):
        goal = FinancialGoal(id="g1", name="Retirement", target_amount=1_000_000, target_year=2060)
        assert goal.name == "Retirement"

    def test_past_target_year_rejected(self):
        with pytest.raises(ValidationError):
            FinancialGoal(id="g1", name="Old goal", target_amount=100_000, target_year=2020)

    def test_zero_target_amount_rejected(self):
        with pytest.raises(ValidationError):
            FinancialGoal(id="g1", name="Zero", target_amount=0, target_year=2040)

    def test_negative_target_amount_rejected(self):
        with pytest.raises(ValidationError):
            FinancialGoal(id="g1", name="Negative", target_amount=-1, target_year=2040)

    @pytest.mark.parametrize("priority", ["critical", "important", "nice_to_have"])
    def test_valid_priority_accepted(self, priority):
        goal = FinancialGoal(id="g1", name="Test", target_amount=100_000, target_year=2040, priority=priority)
        assert goal.priority == priority

    def test_invalid_priority_rejected(self):
        with pytest.raises(ValidationError):
            FinancialGoal(id="g1", name="Test", target_amount=100_000, target_year=2040, priority="low")

    def test_default_priority_is_important(self):
        goal = FinancialGoal(id="g1", name="Test", target_amount=100_000, target_year=2040)
        assert goal.priority == "important"


# ---------------------------------------------------------------------------
# UserProfile
# ---------------------------------------------------------------------------

class TestUserProfile:
    def test_valid_profile_accepted(self):
        profile = UserProfile(**_valid_profile_kwargs())
        assert profile.current_age == 35

    def test_retirement_age_equal_to_current_age_rejected(self):
        kwargs = _valid_profile_kwargs()
        kwargs["retirement_age"] = kwargs["current_age"]
        with pytest.raises(ValidationError, match="retirement_age"):
            UserProfile(**kwargs)

    def test_retirement_age_less_than_current_age_rejected(self):
        kwargs = _valid_profile_kwargs()
        kwargs["retirement_age"] = kwargs["current_age"] - 5
        with pytest.raises(ValidationError):
            UserProfile(**kwargs)

    def test_negative_income_rejected(self):
        kwargs = _valid_profile_kwargs()
        kwargs["annual_income"] = -1
        with pytest.raises(ValidationError):
            UserProfile(**kwargs)

    def test_zero_income_rejected(self):
        kwargs = _valid_profile_kwargs()
        kwargs["annual_income"] = 0
        with pytest.raises(ValidationError):
            UserProfile(**kwargs)

    def test_age_below_18_rejected(self):
        kwargs = _valid_profile_kwargs()
        kwargs["current_age"] = 17
        with pytest.raises(ValidationError):
            UserProfile(**kwargs)

    def test_age_above_100_rejected(self):
        kwargs = _valid_profile_kwargs()
        kwargs["current_age"] = 101
        with pytest.raises(ValidationError):
            UserProfile(**kwargs)

    def test_zero_portfolio_value_accepted(self):
        """current_portfolio_value=0 is valid (ge=0 constraint)."""
        kwargs = _valid_profile_kwargs()
        kwargs["current_portfolio_value"] = 0
        profile = UserProfile(**kwargs)
        assert profile.current_portfolio_value == 0

    def test_default_risk_tolerance_is_moderate(self):
        profile = UserProfile(**_valid_profile_kwargs())
        assert profile.risk_tolerance == RiskTolerance.moderate

    def test_default_goals_is_empty_list(self):
        profile = UserProfile(**_valid_profile_kwargs())
        assert profile.goals == []

    def test_default_life_events_is_empty_list(self):
        profile = UserProfile(**_valid_profile_kwargs())
        assert profile.life_events == []


# ---------------------------------------------------------------------------
# TaxInfo
# ---------------------------------------------------------------------------

class TestTaxInfo:
    @pytest.mark.parametrize("status", ["single", "married_filing_jointly", "head_of_household"])
    def test_valid_filing_status(self, status):
        info = TaxInfo(filing_status=status, state="CA")
        assert info.filing_status == status

    def test_invalid_filing_status_rejected(self):
        with pytest.raises(ValidationError):
            TaxInfo(filing_status="divorced", state="CA")

    def test_pre_tax_rate_above_one_rejected(self):
        with pytest.raises(ValidationError):
            TaxInfo(filing_status="single", state="CA", pre_tax_contribution_rate=1.5)

    def test_pre_tax_rate_negative_rejected(self):
        with pytest.raises(ValidationError):
            TaxInfo(filing_status="single", state="CA", pre_tax_contribution_rate=-0.1)
