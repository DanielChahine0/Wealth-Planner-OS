"use client";
import { useState, useCallback } from "react";
import { useStore } from "@/lib/store";
import { runSimulation, analyzeRisk, getRecommendations, getCoachingInsights } from "@/lib/api";
import type { UserProfile } from "@/lib/types";

export type SimulationStage =
  | "idle"
  | "simulating"
  | "analyzing"
  | "recommending"
  | "coaching"
  | "done"
  | "error";

export function useSimulation() {
  const [stage, setStage] = useState<SimulationStage>("idle");
  const [error, setError] = useState<string | null>(null);

  const { setProfile, setSimulationResult, setRiskReport, setAdvisorResponse, setCoachingResponse } =
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

      // Stage 4: Behavioral finance coaching
      setStage("coaching");
      try {
        const coachingResp = await getCoachingInsights(profile, simResult, riskReport);
        setCoachingResponse(coachingResp);
      } catch {
        // Coaching is non-critical — don't fail the whole pipeline
        setCoachingResponse({ insights: [] });
      }

      setStage("done");
    } catch (err) {
      setStage("error");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [setProfile, setSimulationResult, setRiskReport, setAdvisorResponse, setCoachingResponse]);

  return { run, stage, error };
}
