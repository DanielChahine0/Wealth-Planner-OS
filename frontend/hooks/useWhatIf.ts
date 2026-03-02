"use client";
import { useState, useCallback } from "react";
import { parseWhatIf, runSimulation, analyzeRisk } from "@/lib/api";
import type { UserProfile, SimulationResult, RiskReport, WhatIfResponse } from "@/lib/types";

interface WhatIfState {
  isLoading: boolean;
  error: string | null;
  interpretation: string | null;
  changesSummary: string | null;
  whatIfSimResult: SimulationResult | null;
  whatIfRiskReport: RiskReport | null;
  isVisible: boolean;
}

export function useWhatIf(profile: UserProfile | null) {
  const [state, setState] = useState<WhatIfState>({
    isLoading: false,
    error: null,
    interpretation: null,
    changesSummary: null,
    whatIfSimResult: null,
    whatIfRiskReport: null,
    isVisible: false,
  });

  const runWhatIf = useCallback(
    async (question: string) => {
      if (!profile) return;

      setState((s) => ({ ...s, isLoading: true, error: null }));
      try {
        // Step 1: Claude parses the question into a modified profile
        const parsed: WhatIfResponse = await parseWhatIf(question, profile);

        // Step 2: Re-run simulation with modified profile
        const simResult = await runSimulation(parsed.modified_profile);

        // Step 3: Re-run risk analysis with modified profile
        const riskReport = await analyzeRisk(parsed.modified_profile, simResult);

        setState({
          isLoading: false,
          error: null,
          interpretation: parsed.interpretation,
          changesSummary: parsed.changes_summary,
          whatIfSimResult: simResult,
          whatIfRiskReport: riskReport,
          isVisible: true,
        });
      } catch (err) {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: err instanceof Error ? err.message : "Could not process scenario",
        }));
      }
    },
    [profile]
  );

  const clear = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      interpretation: null,
      changesSummary: null,
      whatIfSimResult: null,
      whatIfRiskReport: null,
      isVisible: false,
    });
  }, []);

  return { ...state, runWhatIf, clear };
}
