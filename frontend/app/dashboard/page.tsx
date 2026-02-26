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
import { formatCurrency } from "@/lib/formatters";

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

  useEffect(() => {
    if (!simulationResult) {
      router.replace("/onboarding");
    }
  }, [simulationResult, router]);

  if (!simulationResult || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your plan..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="font-bold text-gray-900 text-lg">Wealth Planner OS</div>
        <div className="flex items-center gap-3">
          <Link
            href="/advisor"
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Chat with Advisor
          </Link>
          <Link href="/onboarding" className="text-sm text-gray-500 hover:text-gray-700">
            Edit Plan
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Summary Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Age", value: `${profile.current_age} → ${profile.retirement_age}` },
            { label: "Portfolio Today", value: formatCurrency(profile.current_portfolio_value, true) },
            { label: "Median at Retirement", value: formatCurrency(simulationResult.median_final_value, true) },
            { label: "Best Case (95th pct)", value: formatCurrency(simulationResult.best_case_final_value, true) },
          ].map((s) => (
            <Card key={s.label} padding="sm">
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className="text-lg font-bold text-gray-900 mt-0.5">{s.value}</div>
            </Card>
          ))}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chart (2/3 width) */}
          <Card className="lg:col-span-2">
            <ErrorBoundary fallback={<div className="p-4 text-sm text-gray-500">Chart failed to load</div>}>
              <SimulationChart result={simulationResult} />
            </ErrorBoundary>
          </Card>

          {/* Right: Success gauge + Risk (1/3 width) */}
          <div className="space-y-4">
            <Card>
              <SuccessRateGauge successRate={simulationResult.success_rate} />
            </Card>
            {riskReport ? (
              <Card>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Risk Analysis</h3>
                <ErrorBoundary fallback={<div className="p-4 text-sm text-gray-500">Risk analysis unavailable</div>}>
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
            <ErrorBoundary fallback={<div className="p-4 text-sm text-gray-500">Strategy unavailable</div>}>
              <StrategyCards response={advisorResponse} />
            </ErrorBoundary>
          </Card>
        ) : (
          <Card className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" message="Claude is generating your personalized strategy..." />
          </Card>
        )}
      </div>
    </div>
  );
}
