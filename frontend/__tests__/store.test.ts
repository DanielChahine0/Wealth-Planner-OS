import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useStore } from "../lib/store";
import type { UserProfile, SimulationResult, RiskReport, AdvisorResponse } from "../lib/types";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const mockProfile: UserProfile = {
  current_age: 35,
  retirement_age: 65,
  annual_income: 120_000,
  income_growth_rate: 0.03,
  annual_expenses: 80_000,
  current_portfolio_value: 200_000,
  annual_contribution: 20_000,
  asset_allocation: { us_equity: 0.6, intl_equity: 0.2, bonds: 0.15, real_estate: 0.05, cash: 0.0 },
  risk_tolerance: "moderate",
  goals: [],
  life_events: [],
  tax_info: { filing_status: "single", state: "CA", pre_tax_contribution_rate: 0.15 },
};

const mockSimulationResult: SimulationResult = {
  years: [2026, 2027, 2028],
  percentiles: { p10: [100, 110, 120], p25: [150, 160, 170], p50: [200, 210, 220], p75: [250, 260, 270], p90: [300, 310, 320] },
  success_rate: 0.88,
  median_final_value: 220,
  worst_case_final_value: 80,
  best_case_final_value: 400,
  simulation_metadata: { n_simulations: 500, n_years: 3, simulation_duration_ms: 10 },
  paths_sample: [[200, 210, 220]],
};

const mockRiskReport: RiskReport = {
  fragility_score: 30,
  var_5th_percentile: 80,
  cvar_5th_percentile: 60,
  misalignment_flags: [],
  risk_narrative: "Low risk.",
  portfolio_volatility: 0.12,
  max_drawdown_median: 0.15,
};

const mockAdvisorResponse: AdvisorResponse = {
  strategy_actions: [
    {
      id: "action_1",
      title: "Increase Savings",
      description: "Save more each month.",
      category: "savings",
      projected_impact: "+$50K",
      priority: 1,
      approved: null,
    },
  ],
  narrative: "Your plan looks solid.",
  disclaimer: "AI-generated. Not financial advice.",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useStore", () => {
  beforeEach(() => {
    // Reset state between tests
    act(() => {
      useStore.getState().reset();
    });
  });

  it("initial state: all data fields are null", () => {
    const { result } = renderHook(() => useStore());
    expect(result.current.profile).toBeNull();
    expect(result.current.simulationResult).toBeNull();
    expect(result.current.riskReport).toBeNull();
    expect(result.current.advisorResponse).toBeNull();
  });

  it("setProfile stores the profile", () => {
    const { result } = renderHook(() => useStore());
    act(() => {
      result.current.setProfile(mockProfile);
    });
    expect(result.current.profile).toEqual(mockProfile);
  });

  it("setSimulationResult stores the simulation result", () => {
    const { result } = renderHook(() => useStore());
    act(() => {
      result.current.setSimulationResult(mockSimulationResult);
    });
    expect(result.current.simulationResult).toEqual(mockSimulationResult);
  });

  it("setRiskReport stores the risk report", () => {
    const { result } = renderHook(() => useStore());
    act(() => {
      result.current.setRiskReport(mockRiskReport);
    });
    expect(result.current.riskReport).toEqual(mockRiskReport);
  });

  it("setAdvisorResponse stores the advisor response", () => {
    const { result } = renderHook(() => useStore());
    act(() => {
      result.current.setAdvisorResponse(mockAdvisorResponse);
    });
    expect(result.current.advisorResponse).toEqual(mockAdvisorResponse);
  });

  it("reset clears all data fields back to null", () => {
    const { result } = renderHook(() => useStore());
    act(() => {
      result.current.setProfile(mockProfile);
      result.current.setSimulationResult(mockSimulationResult);
      result.current.setRiskReport(mockRiskReport);
      result.current.setAdvisorResponse(mockAdvisorResponse);
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.profile).toBeNull();
    expect(result.current.simulationResult).toBeNull();
    expect(result.current.riskReport).toBeNull();
    expect(result.current.advisorResponse).toBeNull();
  });

  it("store actions are functions", () => {
    const { result } = renderHook(() => useStore());
    expect(typeof result.current.setProfile).toBe("function");
    expect(typeof result.current.setSimulationResult).toBe("function");
    expect(typeof result.current.setRiskReport).toBe("function");
    expect(typeof result.current.setAdvisorResponse).toBe("function");
    expect(typeof result.current.reset).toBe("function");
  });

  it("setProfile with different value overwrites previous", () => {
    const { result } = renderHook(() => useStore());
    act(() => {
      result.current.setProfile(mockProfile);
    });
    const updated: UserProfile = { ...mockProfile, current_age: 40 };
    act(() => {
      result.current.setProfile(updated);
    });
    expect(result.current.profile?.current_age).toBe(40);
  });
});
