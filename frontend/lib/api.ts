import type {
  UserProfile,
  SimulationResult,
  RiskReport,
  AdvisorResponse,
  ChatMessage,
  WhatIfResponse,
  CoachingResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API ${path} failed (${res.status}): ${error}`);
  }
  return res.json() as Promise<T>;
}

export async function runSimulation(
  profile: UserProfile,
  nSimulations = 10000
): Promise<SimulationResult> {
  return post<SimulationResult>("/simulate", { profile, n_simulations: nSimulations });
}

export async function analyzeRisk(
  profile: UserProfile,
  simulationResult: SimulationResult
): Promise<RiskReport> {
  return post<RiskReport>("/risk/analyze", {
    profile,
    simulation_result: simulationResult,
  });
}

export async function getRecommendations(
  profile: UserProfile,
  simulationResult: SimulationResult,
  riskReport: RiskReport
): Promise<AdvisorResponse> {
  return post<AdvisorResponse>("/advisor/recommend", {
    profile,
    simulation_result: simulationResult,
    risk_report: riskReport,
  });
}

export async function parseWhatIf(
  question: string,
  profile: UserProfile
): Promise<WhatIfResponse> {
  return post<WhatIfResponse>("/whatif/parse", { question, profile });
}

export async function getCoachingInsights(
  profile: UserProfile,
  simulationResult: SimulationResult,
  riskReport: RiskReport
): Promise<CoachingResponse> {
  return post<CoachingResponse>("/advisor/coaching", {
    profile,
    simulation_result: simulationResult,
    risk_report: riskReport,
  });
}

export function streamChat(
  profile: UserProfile,
  simulationResult: SimulationResult,
  riskReport: RiskReport,
  messages: ChatMessage[],
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): AbortController {
  const controller = new AbortController();

  fetch(`${API_BASE}/advisor/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profile,
      simulation_result: simulationResult,
      risk_report: riskReport,
      messages,
    }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`Chat API failed: ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") {
              onDone();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.token) onToken(parsed.token);
            } catch {
              // ignore parse errors on partial lines
            }
          }
        }
      }
      onDone();
    })
    .catch((err) => {
      if (err.name !== "AbortError") onError(err);
    });

  return controller;
}
