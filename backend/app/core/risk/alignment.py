from __future__ import annotations
"""
Goal-to-risk misalignment detection.
Compares each financial goal's target against the projected portfolio path
at the target year, using the p10 (pessimistic) and p50 (median) percentiles.
"""
from app.schemas.profile import UserProfile
from app.schemas.simulation import SimulationResult
from app.schemas.risk import MisalignmentFlag


def detect_misalignment(
    profile: UserProfile,
    result: SimulationResult,
) -> list[MisalignmentFlag]:
    flags: list[MisalignmentFlag] = []

    if not profile.goals:
        return flags

    start_year = result.years[0]
    end_year = result.years[-1]

    for goal in profile.goals:
        # Find the index of the goal's target year in the years list
        if goal.target_year < start_year or goal.target_year > end_year:
            # Goal is outside simulation window — flag as warning
            flags.append(
                MisalignmentFlag(
                    goal_id=goal.id,
                    goal_name=goal.name,
                    severity="warning",
                    message=f"Goal target year {goal.target_year} is outside simulation window.",
                    projected_value=0.0,
                    required_value=goal.target_amount,
                )
            )
            continue

        idx = result.years.index(goal.target_year)
        p10_value = result.percentiles.p10[idx]
        p50_value = result.percentiles.p50[idx]
        required = goal.target_amount

        # Determine severity
        if p10_value >= required:
            severity = "ok"
            message = (
                f"Even in pessimistic scenarios, the portfolio is projected to "
                f"exceed your {goal.name} goal of ${required:,.0f}."
            )
        elif p50_value >= required:
            severity = "warning"
            message = (
                f"The median scenario meets your {goal.name} goal, but "
                f"pessimistic scenarios fall short by "
                f"${required - p10_value:,.0f}."
            )
        else:
            severity = "critical"
            shortfall = required - p50_value
            if goal.priority == "critical":
                message = (
                    f"CRITICAL: Your {goal.name} goal is at high risk. "
                    f"The median scenario falls short by ${shortfall:,.0f}. "
                    f"Immediate action recommended."
                )
            else:
                message = (
                    f"Your {goal.name} goal may not be achievable under current projections. "
                    f"The median scenario falls short by ${shortfall:,.0f}."
                )

        flags.append(
            MisalignmentFlag(
                goal_id=goal.id,
                goal_name=goal.name,
                severity=severity,
                message=message,
                projected_value=round(p50_value, 2),
                required_value=required,
            )
        )

    return flags
