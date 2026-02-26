from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, model_validator
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

    @model_validator(mode="after")
    def weights_sum_to_one(self) -> AssetAllocation:
        total = (
            self.us_equity
            + self.intl_equity
            + self.bonds
            + self.real_estate
            + self.cash
        )
        if not (0.99 <= total <= 1.01):
            raise ValueError(
                f"Asset allocation weights must sum to 1.0 (got {total:.4f})"
            )
        return self


class FinancialGoal(BaseModel):
    id: str
    name: str
    target_amount: float = Field(gt=0)
    target_year: int
    priority: Literal["critical", "important", "nice_to_have"] = "important"

    @field_validator("target_year")
    @classmethod
    def target_year_in_future(cls, v: int) -> int:
        current_year = datetime.now().year
        if v <= current_year:
            raise ValueError(
                f"target_year must be greater than {current_year} (got {v})"
            )
        return v


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
    emergency_fund_months: float = Field(default=6.0, ge=0)
    asset_allocation: AssetAllocation
    risk_tolerance: RiskTolerance = RiskTolerance.moderate
    goals: list[FinancialGoal] = []
    life_events: list[LifeEvent] = []
    tax_info: TaxInfo = TaxInfo()

    @model_validator(mode="after")
    def retirement_age_after_current_age(self) -> UserProfile:
        if self.retirement_age <= self.current_age:
            raise ValueError(
                f"retirement_age ({self.retirement_age}) must be greater than "
                f"current_age ({self.current_age})"
            )
        return self
