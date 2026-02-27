from __future__ import annotations
"""
Unit tests for core/simulation/models.py: capital market assumptions and
get_portfolio_params().

Covers:
- 100% single-asset portfolios → correct return
- Mixed portfolio → weighted-average return
- Volatility always positive for non-zero allocation
- Diversified portfolio has lower vol than pure equity
- Correlation matrix symmetry and unit diagonal
- CMA constants completeness (all asset classes present, returns/vols positive)
"""
import numpy as np
import pytest
from app.core.simulation.models import (
    get_portfolio_params,
    EXPECTED_RETURNS,
    VOLATILITIES,
    ASSET_CLASSES,
    CORRELATION_MATRIX,
)


# ---------------------------------------------------------------------------
# get_portfolio_params
# ---------------------------------------------------------------------------

class TestGetPortfolioParams:
    def _alloc(self, **weights) -> dict:
        base = {a: 0.0 for a in ASSET_CLASSES}
        base.update(weights)
        return base

    def test_all_us_equity_return(self):
        alloc = self._alloc(us_equity=1.0)
        ret, _ = get_portfolio_params(alloc)
        assert ret == pytest.approx(EXPECTED_RETURNS["us_equity"], rel=1e-9)

    def test_all_bonds_return(self):
        alloc = self._alloc(bonds=1.0)
        ret, _ = get_portfolio_params(alloc)
        assert ret == pytest.approx(EXPECTED_RETURNS["bonds"], rel=1e-9)

    def test_all_cash_return(self):
        alloc = self._alloc(cash=1.0)
        ret, _ = get_portfolio_params(alloc)
        assert ret == pytest.approx(EXPECTED_RETURNS["cash"], rel=1e-9)

    def test_50_50_equity_bonds_return_is_weighted_avg(self):
        alloc = self._alloc(us_equity=0.5, bonds=0.5)
        ret, _ = get_portfolio_params(alloc)
        expected = 0.5 * EXPECTED_RETURNS["us_equity"] + 0.5 * EXPECTED_RETURNS["bonds"]
        assert ret == pytest.approx(expected, rel=1e-9)

    def test_volatility_positive_for_equity_heavy(self):
        alloc = self._alloc(us_equity=0.6, intl_equity=0.2, bonds=0.2)
        _, vol = get_portfolio_params(alloc)
        assert vol > 0

    def test_all_cash_very_low_volatility(self):
        """100% cash has near-zero volatility (VOLATILITIES['cash'] = 0.005)."""
        alloc = self._alloc(cash=1.0)
        _, vol = get_portfolio_params(alloc)
        assert vol < 0.02

    def test_diversified_lower_vol_than_pure_equity(self):
        """Adding bonds/cash to equities reduces portfolio volatility."""
        pure_equity = self._alloc(us_equity=1.0)
        diversified = self._alloc(us_equity=0.5, bonds=0.3, cash=0.2)
        _, vol_equity = get_portfolio_params(pure_equity)
        _, vol_div = get_portfolio_params(diversified)
        assert vol_div < vol_equity

    def test_return_is_float(self):
        alloc = self._alloc(us_equity=0.6, bonds=0.4)
        ret, vol = get_portfolio_params(alloc)
        assert isinstance(ret, float)
        assert isinstance(vol, float)

    def test_zero_allocation_gives_zero_return_and_vol(self):
        """All-zero allocation: return=0, vol=0."""
        alloc = {a: 0.0 for a in ASSET_CLASSES}
        ret, vol = get_portfolio_params(alloc)
        assert ret == pytest.approx(0.0)
        assert vol == pytest.approx(0.0)


# ---------------------------------------------------------------------------
# Correlation matrix structural properties
# ---------------------------------------------------------------------------

class TestCorrelationMatrix:
    def test_symmetric(self):
        assert np.allclose(CORRELATION_MATRIX, CORRELATION_MATRIX.T)

    def test_unit_diagonal(self):
        assert np.allclose(np.diag(CORRELATION_MATRIX), 1.0)

    def test_shape(self):
        n = len(ASSET_CLASSES)
        assert CORRELATION_MATRIX.shape == (n, n)

    def test_values_in_minus_one_to_one(self):
        assert np.all(CORRELATION_MATRIX >= -1.0)
        assert np.all(CORRELATION_MATRIX <= 1.0)


# ---------------------------------------------------------------------------
# CMA constants completeness
# ---------------------------------------------------------------------------

class TestCMAConstants:
    def test_all_asset_classes_have_expected_return(self):
        for ac in ASSET_CLASSES:
            assert ac in EXPECTED_RETURNS, f"Missing expected return for {ac}"

    def test_all_asset_classes_have_volatility(self):
        for ac in ASSET_CLASSES:
            assert ac in VOLATILITIES, f"Missing volatility for {ac}"

    def test_all_expected_returns_positive(self):
        for ac, ret in EXPECTED_RETURNS.items():
            assert ret > 0, f"Expected return for {ac} must be positive"

    def test_all_volatilities_positive(self):
        for ac, vol in VOLATILITIES.items():
            assert vol > 0, f"Volatility for {ac} must be positive"

    def test_equity_return_higher_than_bonds(self):
        assert EXPECTED_RETURNS["us_equity"] > EXPECTED_RETURNS["bonds"]

    def test_equity_vol_higher_than_bonds_vol(self):
        assert VOLATILITIES["us_equity"] > VOLATILITIES["bonds"]
