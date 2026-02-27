from __future__ import annotations
"""
Unit tests for goal-to-risk misalignment detection (core/risk/alignment.py).

Covers:
- No goals → empty list
- Goal year outside simulation window (before and after)
- Achievable goal → severity "ok"
- Warning goal (p50 ok but p10 fails)
- Critical goal → "critical" severity with correct CRITICAL prefix
- Non-critical unachievable goal → "critical" severity without CRITICAL prefix
- Multiple goals each get their own flag
- projected_value in flag equals rounded p50 at target year
"""
import pytest
from app.core.simulation.engine import run_simulation
from app.core.risk.alignment import detect_misalignment
from app.schemas.profile import FinancialGoal
from tests.conftest import make_profile


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_result(profile=None, n_simulations: int = 500):
    if profile is None:
        profile = make_profile()
    return run_simulation(profile, n_simulations=n_simulations)


def _goal(target_year: int, target_amount: float, priority: str = "important", id: str = "g1", name: str = "Test Goal") -> FinancialGoal:
    return FinancialGoal(id=id, name=name, target_amount=target_amount, target_year=target_year, priority=priority)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_no_goals_returns_empty_list():
    profile = make_profile(goals=[])
    result = _make_result(profile)
    flags = detect_misalignment(profile, result)
    assert flags == []


def test_goal_after_simulation_window_is_warning():
    """Goal target year beyond retirement year is outside window → warning."""
    profile = make_profile(current_age=35, retirement_age=45)
    result = _make_result(profile)
    # retirement_age=45 means sim ends around current_year+10; use a year far beyond
    far_future = result.years[-1] + 10
    goal = FinancialGoal.model_construct(
        id="g1", name="Far goal", target_amount=100_000,
        target_year=far_future, priority="important",
    )
    profile_with_goal = make_profile(current_age=35, retirement_age=45, goals=[goal])
    flags = detect_misalignment(profile_with_goal, result)
    assert len(flags) == 1
    assert flags[0].severity == "warning"
    assert str(far_future) in flags[0].message


def test_goal_before_simulation_window_is_warning():
    """Goal target year before simulation start is outside window → warning."""
    profile = make_profile(current_age=35, retirement_age=65)
    result = _make_result(profile)
    before_start = result.years[0] - 5
    goal = FinancialGoal.model_construct(
        id="g1", name="Past goal", target_amount=50_000,
        target_year=before_start, priority="important",
    )
    profile_with_goal = make_profile(goals=[goal])
    flags = detect_misalignment(profile_with_goal, result)
    assert len(flags) == 1
    assert flags[0].severity == "warning"


def test_trivially_achievable_goal_is_ok():
    """A $1 goal that any scenario exceeds → severity = ok."""
    profile = make_profile(
        current_portfolio_value=200_000,
        goals=[_goal(target_year=2040, target_amount=1.0, priority="nice_to_have")],
    )
    result = _make_result(profile)
    flags = detect_misalignment(profile, result)
    assert len(flags) == 1
    assert flags[0].severity == "ok"
    assert flags[0].goal_id == "g1"


def test_impossible_goal_is_critical():
    """A $999B goal is unreachable → severity = critical."""
    profile = make_profile(
        goals=[_goal(target_year=2040, target_amount=999_999_999_999.0)],
    )
    result = _make_result(profile)
    flags = detect_misalignment(profile, result)
    assert len(flags) == 1
    assert flags[0].severity == "critical"


def test_critical_priority_unachievable_has_critical_prefix():
    """Unachievable goal with priority='critical' includes 'CRITICAL' in message."""
    profile = make_profile(
        goals=[_goal(target_year=2040, target_amount=999_999_999_999.0, priority="critical")],
    )
    result = _make_result(profile)
    flags = detect_misalignment(profile, result)
    assert flags[0].severity == "critical"
    assert "CRITICAL" in flags[0].message


def test_non_critical_unachievable_has_no_critical_prefix():
    """Unachievable goal with priority='nice_to_have' does NOT include 'CRITICAL'."""
    profile = make_profile(
        goals=[_goal(target_year=2040, target_amount=999_999_999_999.0, priority="nice_to_have")],
    )
    result = _make_result(profile)
    flags = detect_misalignment(profile, result)
    assert flags[0].severity == "critical"
    assert "CRITICAL" not in flags[0].message


def test_multiple_goals_return_all_flags():
    """Two goals each produce their own flag."""
    profile = make_profile(
        goals=[
            _goal(target_year=2035, target_amount=1.0, id="g1", name="Goal A"),
            _goal(target_year=2035, target_amount=999_999_999_999.0, id="g2", name="Goal B"),
        ],
    )
    result = _make_result(profile)
    flags = detect_misalignment(profile, result)
    assert len(flags) == 2
    goal_ids = {f.goal_id for f in flags}
    assert goal_ids == {"g1", "g2"}


def test_flag_projected_value_equals_rounded_p50():
    """projected_value in the flag matches round(p50[idx], 2) at target year."""
    target_year = 2040
    profile = make_profile(
        goals=[_goal(target_year=target_year, target_amount=500_000)],
    )
    result = _make_result(profile)
    flags = detect_misalignment(profile, result)
    assert len(flags) == 1
    idx = result.years.index(target_year)
    expected = round(result.percentiles.p50[idx], 2)
    assert flags[0].projected_value == expected


def test_flag_required_value_matches_goal_amount():
    """required_value in the flag matches the goal's target_amount."""
    target_amount = 750_000.0
    profile = make_profile(
        goals=[_goal(target_year=2040, target_amount=target_amount)],
    )
    result = _make_result(profile)
    flags = detect_misalignment(profile, result)
    assert len(flags) == 1
    assert flags[0].required_value == target_amount
