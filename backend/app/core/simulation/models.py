from __future__ import annotations
"""
Capital market assumptions (CMA) for asset class returns, volatilities,
and correlation matrix. Based on long-term historical averages.
"""
import numpy as np

# Expected annual returns per asset class
EXPECTED_RETURNS = {
    "us_equity": 0.095,      # 9.5% nominal
    "intl_equity": 0.08,     # 8.0% nominal
    "bonds": 0.04,           # 4.0% nominal
    "real_estate": 0.07,     # 7.0% nominal (REITs)
    "cash": 0.045,           # 4.5% (current HY savings / T-bills)
}

# Annual volatilities (standard deviation)
VOLATILITIES = {
    "us_equity": 0.17,
    "intl_equity": 0.19,
    "bonds": 0.06,
    "real_estate": 0.14,
    "cash": 0.005,
}

# Asset class ordering for matrix ops
ASSET_CLASSES = ["us_equity", "intl_equity", "bonds", "real_estate", "cash"]

# Correlation matrix (symmetric)
CORRELATION_MATRIX = np.array([
    # us_eq  intl_eq  bonds  re_est  cash
    [1.00,   0.85,   -0.10,  0.60,   0.00],   # us_equity
    [0.85,   1.00,   -0.05,  0.55,   0.00],   # intl_equity
    [-0.10, -0.05,    1.00, -0.05,   0.10],   # bonds
    [0.60,   0.55,   -0.05,  1.00,   0.00],   # real_estate
    [0.00,   0.00,    0.10,  0.00,   1.00],   # cash
])

INFLATION_RATE = 0.025  # 2.5% long-run average


def get_portfolio_params(allocation: dict[str, float]) -> tuple[float, float]:
    """
    Given a weight dict {asset_class: weight}, compute portfolio
    expected return and volatility using CMA.
    Returns (expected_return, volatility).
    """
    weights = np.array([allocation.get(a, 0.0) for a in ASSET_CLASSES])
    returns = np.array([EXPECTED_RETURNS[a] for a in ASSET_CLASSES])
    vols = np.array([VOLATILITIES[a] for a in ASSET_CLASSES])

    port_return = float(np.dot(weights, returns))

    # Covariance matrix = diag(vols) @ corr @ diag(vols)
    cov = np.diag(vols) @ CORRELATION_MATRIX @ np.diag(vols)
    port_variance = float(weights @ cov @ weights)
    port_vol = float(np.sqrt(port_variance))

    return port_return, port_vol
