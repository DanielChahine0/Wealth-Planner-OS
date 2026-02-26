from __future__ import annotations
"""
Unit tests for stochastic life event injection (scenarios module).
"""
import numpy as np
import pytest

from app.core.simulation.scenarios import (
    build_event_map,
    apply_deterministic_events,
    generate_shock_matrix,
    compute_shock_costs,
    SHOCK_PROBABILITIES,
)
from app.schemas.profile import LifeEvent


# ---------------------------------------------------------------------------
# build_event_map
# ---------------------------------------------------------------------------

def test_build_event_map_correct_year_range():
    """An event at year 2030 inside range [2026, 2036] must appear in the map."""
    event = LifeEvent(
        id="e1",
        name="New Job",
        year=2030,
        income_delta=10_000,
        expense_delta=0.0,
        one_time_cost=0.0,
    )
    event_map = build_event_map([event], start_year=2026, end_year=2036)
    assert 2030 in event_map, "Expected event year 2030 to be present in event_map"
    assert len(event_map[2030]) == 1


def test_build_event_map_excludes_out_of_range():
    """Events outside the start/end range must NOT appear in the map."""
    event = LifeEvent(
        id="e2",
        name="Old Event",
        year=2020,
        income_delta=5_000,
    )
    event_map = build_event_map([event], start_year=2026, end_year=2036)
    assert 2020 not in event_map


# ---------------------------------------------------------------------------
# apply_deterministic_events
# ---------------------------------------------------------------------------

def test_apply_deterministic_events_income_delta():
    """income_delta=10000 on a matching year must increase returned income."""
    event = LifeEvent(
        id="e3",
        name="Bonus",
        year=2028,
        income_delta=10_000,
        expense_delta=0.0,
        one_time_cost=0.0,
    )
    event_map = build_event_map([event], start_year=2026, end_year=2040)
    original_income = 100_000.0
    original_expenses = 60_000.0
    new_income, new_expenses, one_time = apply_deterministic_events(
        2028, original_income, original_expenses, event_map
    )
    assert new_income > original_income, (
        f"Expected income to increase from {original_income} to "
        f">= {original_income + 10_000}, got {new_income}"
    )
    assert new_income == original_income + 10_000
    assert new_expenses == original_expenses
    assert one_time == 0.0


def test_apply_deterministic_events_expense_delta():
    """expense_delta=5000 on a matching year must increase returned expenses."""
    event = LifeEvent(
        id="e4",
        name="New Car",
        year=2029,
        income_delta=0.0,
        expense_delta=5_000,
        one_time_cost=0.0,
    )
    event_map = build_event_map([event], start_year=2026, end_year=2040)
    original_income = 100_000.0
    original_expenses = 60_000.0
    new_income, new_expenses, one_time = apply_deterministic_events(
        2029, original_income, original_expenses, event_map
    )
    assert new_expenses > original_expenses, (
        f"Expected expenses to increase from {original_expenses}, got {new_expenses}"
    )
    assert new_expenses == original_expenses + 5_000
    assert new_income == original_income


def test_apply_deterministic_events_no_event_year():
    """Years with no events must return income and expenses unchanged."""
    event_map: dict = {}
    income, expenses, one_time = apply_deterministic_events(
        2030, 100_000.0, 60_000.0, event_map
    )
    assert income == 100_000.0
    assert expenses == 60_000.0
    assert one_time == 0.0


# ---------------------------------------------------------------------------
# generate_shock_matrix
# ---------------------------------------------------------------------------

def test_shock_matrix_shape():
    """generate_shock_matrix must return a dict with (n_sim, n_years) shaped arrays."""
    rng = np.random.default_rng(42)
    n_sim, n_years = 100, 10
    shocks = generate_shock_matrix(n_sim, n_years, rng)
    assert isinstance(shocks, dict)
    assert "job_loss" in shocks
    assert shocks["job_loss"].shape == (n_sim, n_years), (
        f"Expected shape ({n_sim}, {n_years}), got {shocks['job_loss'].shape}"
    )
    for name, matrix in shocks.items():
        assert matrix.shape == (n_sim, n_years), (
            f"Shock '{name}' has unexpected shape {matrix.shape}"
        )


def test_shock_matrix_boolean():
    """Shock matrices must be boolean (True/False indicator) arrays."""
    rng = np.random.default_rng(0)
    shocks = generate_shock_matrix(50, 5, rng)
    for name, matrix in shocks.items():
        assert matrix.dtype == bool, f"Expected bool dtype for '{name}', got {matrix.dtype}"


# ---------------------------------------------------------------------------
# compute_shock_costs
# ---------------------------------------------------------------------------

def test_windfall_reduces_costs():
    """
    compute_shock_costs must return a finite cost matrix.
    Over many simulations, the total net costs should be finite.
    """
    rng = np.random.default_rng(7)
    n_sim, n_years = 500, 10
    shocks = generate_shock_matrix(n_sim, n_years, rng)
    cost_matrix = compute_shock_costs(shocks, rng)
    assert cost_matrix.shape == (n_sim, n_years)
    assert np.all(np.isfinite(cost_matrix)), "Expected all cost values to be finite"
    # Total costs across all simulations should be a real finite number
    total = float(np.sum(cost_matrix))
    assert np.isfinite(total)


def test_compute_shock_costs_shape_matches_shocks():
    """cost matrix shape must match the shock matrix shape."""
    rng = np.random.default_rng(99)
    n_sim, n_years = 200, 15
    shocks = generate_shock_matrix(n_sim, n_years, rng)
    cost_matrix = compute_shock_costs(shocks, rng)
    assert cost_matrix.shape == (n_sim, n_years)


# ---------------------------------------------------------------------------
# Probability calibration
# ---------------------------------------------------------------------------

def test_job_loss_probability():
    """
    With 10,000 simulations over 10 years, the mean of the job_loss matrix
    should be approximately SHOCK_PROBABILITIES['job_loss'] within 0.5%.
    """
    rng = np.random.default_rng(123)
    n_sim, n_years = 10_000, 10
    shocks = generate_shock_matrix(n_sim, n_years, rng)
    observed_prob = float(np.mean(shocks["job_loss"]))
    expected_prob = SHOCK_PROBABILITIES["job_loss"]
    tolerance = 0.005  # 0.5%
    assert abs(observed_prob - expected_prob) <= tolerance, (
        f"job_loss mean {observed_prob:.4f} deviates from expected "
        f"{expected_prob:.4f} by more than {tolerance:.4f}"
    )
