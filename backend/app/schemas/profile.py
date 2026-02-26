from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Literal
from enum import Enum


class RiskTolerance(str, Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"


class AssetAllocation(BaseModel):
    us_equity: float = Field(ge=0, le=1, description="US equity allocation 0-1")
    intl_equity: float = Field(ge=0, le=1, description="International equity 0-1")
    bonds: float = Field(ge=0, le=1, description="Fixed income 0-1")
    real_estate: float = Field(ge=0, le=1, description="Real estate / REITs 0-1")
    cash: float = Field(ge=0, le=1, description="Cash / money market 0-1")


class FinancialGoal(BaseModel):
    id: str
    name: str
    target_amount: float = Field(gt=0)
    target_year: int = Field(gt=2024)
    priority: Literal["critical", "important", "nice_to_have"] = "important"


class LifeEvent(BaseModel):
    id: str
    name: str
    year: int
    income_delta: float = 0.0
    expense_delta: float = 0.0
    one_time_cost: float = 0.0


class TaxInfo(BaseModel):
    filing_status: Literal["single", "married_filing_jointly", "head_of_household"] = "single"
    state: str = "CA"
    pre_tax_contribution_rate: float = Field(default=0.15, ge=0, le=1)


class UserProfile(BaseModel):
    current_age: int = Field(ge=18, le=100)
    retirement_age: int = Field(ge=40, le=100)
    annual_income: float = Field(gt=0)
    income_growth_rate: float = Field(default=0.03, ge=0, le=0.5)
    annual_expenses: float = Field(gt=0)
    current_portfolio_value: float = Field(ge=0)
    annual_contribution: float = Field(ge=0)
    asset_allocation: AssetAllocation
    risk_tolerance: RiskTolerance = RiskTolerance.moderate
    goals: list[FinancialGoal] = []
    life_events: list[LifeEvent] = []
    tax_info: TaxInfo = TaxInfo()
