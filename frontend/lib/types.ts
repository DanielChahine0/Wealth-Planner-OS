// TypeScript types mirroring backend Pydantic schemas

export type RiskTolerance = "conservative" | "moderate" | "aggressive";
export type GoalPriority = "critical" | "important" | "nice_to_have";
export type FilingStatus = "single" | "married_filing_jointly" | "head_of_household";
export type AssetCategory = "savings" | "allocation" | "tax" | "insurance" | "income" | "spending";

export interface AssetAllocation {
  us_equity: number;
  intl_equity: number;
  bonds: number;
  real_estate: number;
  cash: number;
}

export interface FinancialGoal {
  id: string;
  name: string;
  target_amount: number;
  target_year: number;
  priority: GoalPriority;
}

export interface LifeEvent {
  id: string;
  name: string;
  year: number;
  income_delta: number;
  expense_delta: number;
  one_time_cost: number;
}

export interface TaxInfo {
  filing_status: FilingStatus;
  state: string;
  pre_tax_contribution_rate: number;
}

export interface UserProfile {
  current_age: number;
  retirement_age: number;
  annual_income: number;
  income_growth_rate: number;
  annual_expenses: number;
  current_portfolio_value: number;
  annual_contribution: number;
  asset_allocation: AssetAllocation;
  risk_tolerance: RiskTolerance;
  goals: FinancialGoal[];
  life_events: LifeEvent[];
  tax_info: TaxInfo;
}

export interface Percentiles {
  p10: number[];
  p25: number[];
  p50: number[];
  p75: number[];
  p90: number[];
}

export interface SimulationMetadata {
  n_simulations: number;
  n_years: number;
  simulation_duration_ms: number;
}

export interface SimulationResult {
  years: number[];
  percentiles: Percentiles;
  success_rate: number;
  median_final_value: number;
  worst_case_final_value: number;
  best_case_final_value: number;
  simulation_metadata: SimulationMetadata;
  paths_sample: number[][];
}

export interface MisalignmentFlag {
  goal_id: string;
  goal_name: string;
  severity: "critical" | "warning" | "ok";
  message: string;
  projected_value: number;
  required_value: number;
}

export interface RiskReport {
  fragility_score: number;
  var_5th_percentile: number;
  cvar_5th_percentile: number;
  misalignment_flags: MisalignmentFlag[];
  risk_narrative: string;
  portfolio_volatility: number;
  max_drawdown_median: number;
}

export interface StrategyAction {
  id: string;
  title: string;
  description: string;
  category: AssetCategory;
  projected_impact: string;
  priority: number;
  approved: boolean | null;
  requires_human_review?: boolean;
  human_review_reason?: string | null;
}

export interface AdvisorResponse {
  strategy_actions: StrategyAction[];
  narrative: string;
  disclaimer: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface WhatIfResponse {
  modified_profile: UserProfile;
  interpretation: string;
  changes_summary: string;
}

export type BiasSeverity = "high" | "medium" | "low";

export interface CoachingInsight {
  id: string;
  bias_type: string;
  title: string;
  observation: string;
  impact: string;
  suggestion: string;
  severity: BiasSeverity;
}

export interface CoachingResponse {
  insights: CoachingInsight[];
}
