"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  UserProfile,
  SimulationResult,
  RiskReport,
  AdvisorResponse,
  CoachingResponse,
} from "./types";

interface WealthPlannerState {
  profile: UserProfile | null;
  simulationResult: SimulationResult | null;
  riskReport: RiskReport | null;
  advisorResponse: AdvisorResponse | null;
  coachingResponse: CoachingResponse | null;

  setProfile: (profile: UserProfile) => void;
  setSimulationResult: (result: SimulationResult) => void;
  setRiskReport: (report: RiskReport) => void;
  setAdvisorResponse: (response: AdvisorResponse) => void;
  setCoachingResponse: (response: CoachingResponse) => void;
  reset: () => void;
}

export const useStore = create<WealthPlannerState>()(
  persist(
    (set) => ({
      profile: null,
      simulationResult: null,
      riskReport: null,
      advisorResponse: null,
      coachingResponse: null,

      setProfile: (profile) => set({ profile }),
      setSimulationResult: (simulationResult) => set({ simulationResult }),
      setRiskReport: (riskReport) => set({ riskReport }),
      setAdvisorResponse: (advisorResponse) => set({ advisorResponse }),
      setCoachingResponse: (coachingResponse) => set({ coachingResponse }),
      reset: () =>
        set({
          profile: null,
          simulationResult: null,
          riskReport: null,
          advisorResponse: null,
          coachingResponse: null,
        }),
    }),
    {
      name: "wealth-planner-state",
      partialize: (state) => ({
        profile: state.profile,
        simulationResult: state.simulationResult
          ? { ...state.simulationResult, paths_sample: [] }
          : null,
        riskReport: state.riskReport,
        advisorResponse: state.advisorResponse,
        coachingResponse: state.coachingResponse,
      }),
    }
  )
);
