"use client";
import { useState, useCallback } from "react";
import { useStore } from "@/lib/store";
import { runSimulation, analyzeRisk, getRecommendations } from "@/lib/api";
import type { UserProfile } from "@/lib/types";

export type SimulationStage =
  | "idle"
  | "simulating"
  | "analyzing"
  | "recommending"
  | "done"
  | "error";

export function useSimulation() {
  const [stage, setStage] = useState<SimulationStage>("idle");
  const [error, setError] = useState<string | null>(null);

  const { setProfile, setSimulationResult, setRiskReport, setAdvisorResponse } =
    useStore();

  const run = useCallback(async (profile: UserProfile) => {
    setError(null);
    try {
      setProfile(profile);

      // Stage 1: Run Monte Carlo simulation
      setStage("simulating");
      const simResult = await runSimulation(profile);
      setSimulationResult(simResult);

      // Stage 2: Risk analysis
      setStage("analyzing");
      const riskReport = await analyzeRisk(profile, simResult);
      setRiskReport(riskReport);

      // Stage 3: AI recommendations (longest — Claude API call)
      setStage("recommending");
      const advisorResp = await getRecommendations(profile, simResult, riskReport);
      setAdvisorResponse(advisorResp);

      setStage("done");
    } catch (err) {
      setStage("error");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [setProfile, setSimulationResult, setRiskReport, setAdvisorResponse]);

  return { run, stage, error };
}
