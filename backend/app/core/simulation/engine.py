from __future__ import annotations
"""
Monte Carlo simulation engine.
Vectorized NumPy implementation: paths matrix is (n_simulations, n_years+1).
Runs 10,000 simulations in <1s on a single core.
"""
import time
import numpy as np
from app.schemas.profile import UserProfile
from app.schemas.simulation import SimulationResult, Percentiles, SimulationMetadata
from app.core.simulation.models import get_portfolio_params, INFLATION_RATE
from app.core.simulation.tax import after_tax_income
from app.core.simulation.scenarios import (
    build_event_map,
    apply_deterministic_events,
    generate_shock_matrix,
    compute_shock_costs,
    SHOCK_IMPACTS,
    SHOCK_PROBABILITIES,
)

PATHS_SAMPLE_SIZE = 200  # paths returned to frontend for risk analysis


def run_simulation(profile: UserProfile, n_simulations: int = 10000) -> SimulationResult:
    t_start = time.perf_counter()
    rng = np.random.default_rng()

    n_years = profile.retirement_age - profile.current_age
    if n_years <= 0:
        n_years = 1

    allocation = profile.asset_allocation.model_dump()
    port_return, port_vol = get_portfolio_params(allocation)

    # GBM: lognormal returns each year
    # drift = mu - 0.5*sigma^2, shock = sigma * Z
    drift = port_return - 0.5 * port_vol ** 2
    returns_matrix = np.exp(
        drift + port_vol * rng.standard_normal((n_simulations, n_years))
    )  # shape: (n_simulations, n_years)

    # Income and expense trajectories (scalar per year, broadcast across sims)
    income_vec = np.zeros(n_years)
    expense_vec = np.zeros(n_years)
    contribution_vec = np.zeros(n_years)

    current_year = 2026  # baseline calendar year
    event_map = build_event_map(
        profile.life_events,
        start_year=current_year,
        end_year=current_year + n_years,
    )

    income = profile.annual_income
    expenses = profile.annual_expenses
    for i in range(n_years):
        year = current_year + i
        income_adj, expenses_adj, _ = apply_deterministic_events(year, income, expenses, event_map)
        net_income = after_tax_income(
            income_adj,
            profile.tax_info.filing_status,
            profile.tax_info.state,
        )
        # Positive = surplus added to portfolio; negative = deficit withdrawn from portfolio
        contribution_vec[i] = net_income - expenses_adj
        income_vec[i] = income_adj
        expense_vec[i] = expenses_adj
        # Apply income growth
        income = income * (1 + profile.income_growth_rate)
        # Apply inflation to expenses
        expenses = expenses * (1 + INFLATION_RATE)

    # Stochastic shocks (job loss, medical, windfall)
    shocks = generate_shock_matrix(n_simulations, n_years, rng)
    shock_costs = compute_shock_costs(shocks, rng)

    # Job loss: kill income contribution for that year in affected sims
    job_loss_mask = shocks["job_loss"]  # (n_sim, n_years)
    contribution_matrix = np.broadcast_to(contribution_vec, (n_simulations, n_years)).copy()
    contribution_matrix[job_loss_mask] = 0.0
    contribution_matrix -= shock_costs  # net shocks (medical costs reduce portfolio)

    # Build paths matrix: (n_simulations, n_years+1)
    paths = np.zeros((n_simulations, n_years + 1))
    paths[:, 0] = profile.current_portfolio_value

    for t in range(n_years):
        paths[:, t + 1] = (
            paths[:, t] * returns_matrix[:, t]
            + contribution_matrix[:, t]
        )
        # Floor at 0 (can't have negative portfolio in basic model)
        paths[:, t + 1] = np.maximum(paths[:, t + 1], 0.0)

    # Compute percentiles across all simulations at each year
    pct_values = np.percentile(paths, [10, 25, 50, 75, 90], axis=0)

    years = list(range(current_year, current_year + n_years + 1))

    # Success rate: % of simulations where final portfolio > 0
    final_values = paths[:, -1]
    success_rate = float(np.mean(final_values > 0))

    t_end = time.perf_counter()
    duration_ms = (t_end - t_start) * 1000

    # Sample subset of paths for risk analysis (keep payload manageable)
    sample_indices = rng.choice(n_simulations, size=min(PATHS_SAMPLE_SIZE, n_simulations), replace=False)
    paths_sample = paths[sample_indices].tolist()

    return SimulationResult(
        years=years,
        percentiles=Percentiles(
            p10=pct_values[0].tolist(),
            p25=pct_values[1].tolist(),
            p50=pct_values[2].tolist(),
            p75=pct_values[3].tolist(),
            p90=pct_values[4].tolist(),
        ),
        success_rate=round(success_rate, 4),
        median_final_value=float(np.median(final_values)),
        worst_case_final_value=float(np.percentile(final_values, 5)),
        best_case_final_value=float(np.percentile(final_values, 95)),
        simulation_metadata=SimulationMetadata(
            n_simulations=n_simulations,
            n_years=n_years,
            simulation_duration_ms=round(duration_ms, 2),
        ),
        paths_sample=paths_sample,
    )
