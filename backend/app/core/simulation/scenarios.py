from __future__ import annotations
"""
Stochastic life event injection.
Life events defined in the user profile are applied deterministically.
Additionally, random shocks (job loss, medical emergency, windfall) are
probabilistically injected to model unplanned disruptions.
"""
import numpy as np
from app.schemas.profile import UserProfile, LifeEvent


# Probability per year of each stochastic shock
SHOCK_PROBABILITIES = {
    "job_loss":         0.03,   # 3% annual probability
    "medical_emergency": 0.02,  # 2% annual probability
    "windfall":         0.01,   # 1% (inheritance, bonus, sale)
}

SHOCK_IMPACTS = {
    # (income_multiplier_change, one_time_cost_range)
    "job_loss":          (0.0, (0, 0)),       # lose income for a year
    "medical_emergency": (1.0, (5_000, 150_000)),
    "windfall":          (1.0, (-200_000, -20_000)),  # negative cost = inflow
}


def build_event_map(life_events: list[LifeEvent], start_year: int, end_year: int) -> dict:
    """Map calendar year → list of life events."""
    event_map: dict[int, list[LifeEvent]] = {}
    for event in life_events:
        if start_year <= event.year <= end_year:
            event_map.setdefault(event.year, []).append(event)
    return event_map


def apply_deterministic_events(
    year: int,
    income: float,
    expenses: float,
    event_map: dict,
) -> tuple[float, float, float]:
    """Apply deterministic life events. Returns (income, expenses, one_time_cost)."""
    one_time_cost = 0.0
    for event in event_map.get(year, []):
        income += event.income_delta
        expenses += event.expense_delta
        one_time_cost += event.one_time_cost
    return income, expenses, one_time_cost


def generate_shock_matrix(
    n_simulations: int,
    n_years: int,
    rng: np.random.Generator,
) -> dict[str, np.ndarray]:
    """
    Returns a dict of boolean matrices (n_simulations, n_years)
    indicating which sim/year cells experience each shock type.
    """
    shocks = {}
    for shock_name, prob in SHOCK_PROBABILITIES.items():
        shocks[shock_name] = rng.random((n_simulations, n_years)) < prob
    return shocks


def compute_shock_costs(
    shocks: dict[str, np.ndarray],
    rng: np.random.Generator,
) -> np.ndarray:
    """
    Returns net one-time cost matrix (n_simulations, n_years).
    Positive = outflow, negative = inflow (windfall).
    """
    n_sim, n_years = next(iter(shocks.values())).shape
    cost_matrix = np.zeros((n_sim, n_years))

    for shock_name, shock_matrix in shocks.items():
        _, (low, high) = SHOCK_IMPACTS[shock_name]
        if low == high == 0:
            continue
        amounts = rng.uniform(low, high, size=(n_sim, n_years))
        cost_matrix += shock_matrix * amounts

    return cost_matrix
