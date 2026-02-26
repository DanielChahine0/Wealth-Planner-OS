from __future__ import annotations
"""
Risk analysis: VaR, CVaR, fragility score, portfolio volatility, max drawdown.
Operates on the SimulationResult (percentile paths + paths_sample).
"""
import numpy as np
from app.schemas.simulation import SimulationResult
from app.schemas.risk import RiskReport


def _compute_drawdown(path: np.ndarray) -> float:
    """Max drawdown for a single path."""
    peak = np.maximum.accumulate(path)
    # Avoid division by zero where peak == 0
    with np.errstate(invalid="ignore", divide="ignore"):
        drawdowns = np.where(peak > 0, (peak - path) / peak, 0.0)
    return float(np.max(drawdowns))


def analyze_risk(result: SimulationResult) -> RiskReport:
    paths = np.array(result.paths_sample) if result.paths_sample else None

    final_p10 = result.percentiles.p10[-1]
    final_p50 = result.percentiles.p50[-1]
    final_p90 = result.percentiles.p90[-1]

    # VaR at 5th percentile = worst_case_final_value (already computed in engine)
    var_5 = result.worst_case_final_value

    # CVaR = expected value of paths below the 5th percentile
    if paths is not None and len(paths) > 0:
        final_values = paths[:, -1]
        var_threshold = np.percentile(final_values, 5)
        tail_values = final_values[final_values <= var_threshold]
        cvar_5 = float(np.mean(tail_values)) if len(tail_values) > 0 else var_5

        # Portfolio volatility: std of year-over-year returns across sample paths
        if paths.shape[1] > 1:
            with np.errstate(invalid="ignore", divide="ignore"):
                yoy_returns = np.diff(paths, axis=1) / np.where(paths[:, :-1] > 0, paths[:, :-1], np.nan)
            valid_returns = yoy_returns[np.isfinite(yoy_returns)]
            port_vol = float(np.std(valid_returns)) if len(valid_returns) > 0 else 0.15
        else:
            port_vol = 0.15

        # Median max drawdown
        drawdowns = np.array([_compute_drawdown(path) for path in paths])
        median_drawdown = float(np.median(drawdowns))
    else:
        # Fallback from percentile data
        cvar_5 = var_5 * 0.7  # rough approximation
        port_vol = 0.15
        median_drawdown = 0.0

    # Fragility score (0-100): composite of multiple risk factors
    # Lower success rate → higher fragility
    success_component = (1.0 - result.success_rate) * 40  # up to 40 pts

    # High drawdown → high fragility
    drawdown_component = median_drawdown * 30  # up to 30 pts

    # Spread between p90 and p10 relative to p50 (dispersion)
    if final_p50 > 0:
        dispersion = (final_p90 - final_p10) / final_p50
        dispersion_component = min(dispersion / 10.0 * 20, 20)  # up to 20 pts
    else:
        dispersion_component = 20.0

    # CVaR severity
    if final_p50 > 0 and cvar_5 < 0:
        cvar_component = min(abs(cvar_5) / final_p50 * 10, 10)  # up to 10 pts
    else:
        cvar_component = 0.0

    fragility_score = min(
        100.0,
        success_component + drawdown_component + dispersion_component + cvar_component,
    )

    # Build risk narrative
    if fragility_score < 25:
        risk_level = "low"
        narrative_prefix = "Your portfolio shows strong resilience"
    elif fragility_score < 50:
        risk_level = "moderate"
        narrative_prefix = "Your portfolio has moderate risk exposure"
    elif fragility_score < 75:
        risk_level = "elevated"
        narrative_prefix = "Your portfolio shows elevated fragility"
    else:
        risk_level = "high"
        narrative_prefix = "Your portfolio is highly fragile"

    risk_narrative = (
        f"{narrative_prefix} with a fragility score of {fragility_score:.0f}/100. "
        f"In the worst 5% of scenarios, your portfolio reaches ${var_5:,.0f} at retirement. "
        f"The median max drawdown is {median_drawdown:.1%}, and the plan succeeds "
        f"in {result.success_rate:.1%} of simulations."
    )

    return RiskReport(
        fragility_score=round(fragility_score, 1),
        var_5th_percentile=round(var_5, 2),
        cvar_5th_percentile=round(cvar_5, 2),
        misalignment_flags=[],  # populated by alignment.py
        risk_narrative=risk_narrative,
        portfolio_volatility=round(port_vol, 4),
        max_drawdown_median=round(median_drawdown, 4),
    )
