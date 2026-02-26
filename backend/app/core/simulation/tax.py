from __future__ import annotations
"""
Federal income tax bracket model for after-tax withdrawal computation.
Uses 2024 brackets (single / MFJ). State tax is approximated as flat rate.
"""
from typing import Literal

# 2024 federal brackets: (max_income, rate)
FEDERAL_BRACKETS_SINGLE = [
    (11_600,  0.10),
    (47_150,  0.12),
    (100_525, 0.22),
    (191_950, 0.24),
    (243_725, 0.32),
    (609_350, 0.35),
    (float("inf"), 0.37),
]

FEDERAL_BRACKETS_MFJ = [
    (23_200,  0.10),
    (94_300,  0.12),
    (201_050, 0.22),
    (383_900, 0.24),
    (487_450, 0.32),
    (731_200, 0.35),
    (float("inf"), 0.37),
]

STANDARD_DEDUCTION = {
    "single": 14_600,
    "married_filing_jointly": 29_200,
    "head_of_household": 21_900,
}

STATE_FLAT_RATES = {
    "CA": 0.093, "NY": 0.0685, "TX": 0.0, "FL": 0.0,
    "WA": 0.0,  "IL": 0.0495, "PA": 0.0307,
}
DEFAULT_STATE_RATE = 0.05


def effective_tax_rate(
    gross_income: float,
    filing_status: str = "single",
    state: str = "CA",
) -> float:
    """Return effective combined federal + state tax rate (0-1)."""
    if gross_income <= 0:
        return 0.0

    deduction = STANDARD_DEDUCTION.get(filing_status, STANDARD_DEDUCTION["single"])
    taxable = max(0.0, gross_income - deduction)

    brackets = (
        FEDERAL_BRACKETS_MFJ
        if filing_status == "married_filing_jointly"
        else FEDERAL_BRACKETS_SINGLE
    )

    federal_tax = 0.0
    prev_limit = 0.0
    for limit, rate in brackets:
        if taxable <= prev_limit:
            break
        band = min(taxable, limit) - prev_limit
        federal_tax += band * rate
        prev_limit = limit

    state_rate = STATE_FLAT_RATES.get(state, DEFAULT_STATE_RATE)
    state_tax = taxable * state_rate

    total_tax = federal_tax + state_tax
    return total_tax / gross_income


def after_tax_income(
    gross_income: float,
    filing_status: str = "single",
    state: str = "CA",
) -> float:
    rate = effective_tax_rate(gross_income, filing_status, state)
    return gross_income * (1.0 - rate)
