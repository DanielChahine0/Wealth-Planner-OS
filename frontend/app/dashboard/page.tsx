"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card } from "@/components/shared/Card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { SuccessRateGauge } from "@/components/dashboard/SuccessRateGauge";
import { RiskPanel } from "@/components/dashboard/RiskPanel";
import { StrategyCards } from "@/components/dashboard/StrategyCards";
import { WhatIfBar } from "@/components/dashboard/WhatIfBar";
import { CoachingPanel } from "@/components/dashboard/CoachingPanel";
import { useWhatIf } from "@/hooks/useWhatIf";
import { formatCurrency } from "@/lib/formatters";
import type { SimulationStage } from "@/hooks/useSimulation";

const SimulationChart = dynamic(
  () => import("@/components/dashboard/SimulationChart").then(m => ({ default: m.SimulationChart })),
  { ssr: false, loading: () => <LoadingSpinner size="sm" message="Loading chart..." /> }
);

export default function DashboardPage() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const simulationResult = useStore((s) => s.simulationResult);
  const riskReport = useStore((s) => s.riskReport);
  const advisorResponse = useStore((s) => s.advisorResponse);
  const coachingResponse = useStore((s) => s.coachingResponse);

  const whatIf = useWhatIf(profile);

  useEffect(() => {
    if (!simulationResult) {
      router.replace("/onboarding");
    }
  }, [simulationResult, router]);

  if (!simulationResult || !profile) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your plan..." />
      </div>
    );
  }

  // Determine if coaching is still loading (advisorResponse loaded but coaching not yet)
  const coachingLoading = !!advisorResponse && !coachingResponse;

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Top nav */}
      <nav className="bg-surface/90 backdrop-blur-lg border-b border-rim px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-gold text-xs">◆</span>
          <span className="font-serif text-parchment text-lg tracking-widest">
            WEALTHPLANNER<span className="text-gold">OS</span>
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/advisor"
            className="group flex items-center gap-2 text-xs text-gold hover:text-gold-bright border border-gold-dim hover:border-gold px-4 py-2 tracking-widest uppercase transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Advisor
          </Link>
          <Link
            href="/onboarding"
            className="text-xs text-mist hover:text-parchment tracking-wide transition-colors"
          >
            Edit Plan
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Age Range",
              value: `${profile.current_age} → ${profile.retirement_age}`,
              sub: "years",
            },
            {
              label: "Portfolio Today",
              value: formatCurrency(profile.current_portfolio_value, true),
              sub: "current balance",
            },
            {
              label: "Median at Retirement",
              value: formatCurrency(simulationResult.median_final_value, true),
              sub: "p50 projection",
              overlay: whatIf.isVisible && whatIf.whatIfSimResult
                ? formatCurrency(whatIf.whatIfSimResult.median_final_value, true)
                : null,
            },
            {
              label: "Best Case",
              value: formatCurrency(simulationResult.best_case_final_value, true),
              sub: "95th percentile",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-surface border border-rim p-5 transition-all hover:border-rim-strong"
            >
              <div className="text-xs text-dust tracking-widest uppercase mb-3">{s.label}</div>
              <div className="font-mono text-xl text-parchment mb-1">{s.value}</div>
              {"overlay" in s && s.overlay && (
                <div className="font-mono text-sm text-amber-400/80 mb-1">
                  → {s.overlay} <span className="text-xs text-dust">if scenario</span>
                </div>
              )}
              <div className="text-xs text-dust">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart (2/3 width) */}
          <Card className="lg:col-span-2 space-y-4">
            {/* What-If bar */}
            <WhatIfBar
              isLoading={whatIf.isLoading}
              interpretation={whatIf.interpretation}
              changesSummary={whatIf.changesSummary}
              error={whatIf.error}
              isVisible={whatIf.isVisible}
              onSubmit={whatIf.runWhatIf}
              onClear={whatIf.clear}
            />
            <ErrorBoundary fallback={<div className="p-4 text-sm text-mist">Chart failed to load</div>}>
              <SimulationChart
                result={simulationResult}
                overlayResult={whatIf.isVisible ? whatIf.whatIfSimResult : null}
              />
            </ErrorBoundary>
          </Card>

          {/* Success gauge + Risk (1/3 width) */}
          <div className="space-y-5">
            <Card>
              <SuccessRateGauge successRate={simulationResult.success_rate} />
            </Card>
            {riskReport ? (
              <Card>
                <h3 className="text-xs text-mist tracking-widest uppercase mb-4 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-dust" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  Risk Analysis
                </h3>
                <ErrorBoundary fallback={<div className="p-4 text-sm text-mist">Risk analysis unavailable</div>}>
                  <RiskPanel report={riskReport} />
                </ErrorBoundary>
              </Card>
            ) : (
              <Card>
                <LoadingSpinner size="sm" message="Analyzing risk..." />
              </Card>
            )}
          </div>
        </div>

        {/* Strategy Recommendations */}
        {advisorResponse ? (
          <Card>
            <ErrorBoundary fallback={<div className="p-4 text-sm text-mist">Strategy unavailable</div>}>
              <StrategyCards response={advisorResponse} />
            </ErrorBoundary>
          </Card>
        ) : (
          <Card className="flex items-center justify-center py-12">
            <div className="text-center">
              <LoadingSpinner size="md" message="Claude is generating your personalized strategy..." />
              <p className="text-xs text-dust mt-3">This typically takes 3–5 seconds</p>
            </div>
          </Card>
        )}

        {/* Behavioral Finance Coaching */}
        {(coachingLoading || (coachingResponse && coachingResponse.insights.length > 0)) && (
          <Card>
            <ErrorBoundary fallback={null}>
              <CoachingPanel
                insights={coachingResponse?.insights ?? []}
                isLoading={coachingLoading}
              />
            </ErrorBoundary>
          </Card>
        )}
      </div>
    </div>
  );
}
