"use client";
import { create } from "zustand";
import type {
  UserProfile,
  SimulationResult,
  RiskReport,
  AdvisorResponse,
} from "./types";

interface WealthPlannerState {
  profile: UserProfile | null;
  simulationResult: SimulationResult | null;
  riskReport: RiskReport | null;
  advisorResponse: AdvisorResponse | null;

  setProfile: (profile: UserProfile) => void;
  setSimulationResult: (result: SimulationResult) => void;
  setRiskReport: (report: RiskReport) => void;
  setAdvisorResponse: (response: AdvisorResponse) => void;
  reset: () => void;
}

export const useStore = create<WealthPlannerState>((set) => ({
  profile: null,
  simulationResult: null,
  riskReport: null,
  advisorResponse: null,

  setProfile: (profile) => set({ profile }),
  setSimulationResult: (simulationResult) => set({ simulationResult }),
  setRiskReport: (riskReport) => set({ riskReport }),
  setAdvisorResponse: (advisorResponse) => set({ advisorResponse }),
  reset: () =>
    set({
      profile: null,
      simulationResult: null,
      riskReport: null,
      advisorResponse: null,
    }),
}));
