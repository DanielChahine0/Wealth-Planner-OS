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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      {/* Top nav */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">WealthPlanner<span className="text-blue-600">OS</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/advisor"
            className="group flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-all"
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Chat with Advisor
          </Link>
          <Link href="/onboarding" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Edit Plan
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Summary Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Age Range",
              value: `${profile.current_age} → ${profile.retirement_age}`,
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              ),
              color: "text-indigo-600 bg-indigo-50",
            },
            {
              label: "Portfolio Today",
              value: formatCurrency(profile.current_portfolio_value, true),
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              ),
              color: "text-blue-600 bg-blue-50",
            },
            {
              label: "Median at Retirement",
              value: formatCurrency(simulationResult.median_final_value, true),
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              ),
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              label: "Best Case (95th pct)",
              value: formatCurrency(simulationResult.best_case_final_value, true),
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              ),
              color: "text-amber-600 bg-amber-50",
            },
          ].map((s) => (
            <Card key={s.label} padding="sm" className="card-hover transition-all duration-200">
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                  {s.icon}
                </div>
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              </div>
              <div className="text-xl font-bold text-gray-900 tabular-nums">{s.value}</div>
            </Card>
          ))}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chart (2/3 width) */}
          <Card className="lg:col-span-2 shadow-sm">
            <ErrorBoundary fallback={<div className="p-4 text-sm text-gray-500">Chart failed to load</div>}>
              <SimulationChart result={simulationResult} />
            </ErrorBoundary>
          </Card>

          {/* Right: Success gauge + Risk (1/3 width) */}
          <div className="space-y-4">
            <Card className="shadow-sm">
              <SuccessRateGauge successRate={simulationResult.success_rate} />
            </Card>
            {riskReport ? (
              <Card className="shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  Risk Analysis
                </h3>
                <ErrorBoundary fallback={<div className="p-4 text-sm text-gray-500">Risk analysis unavailable</div>}>
                  <RiskPanel report={riskReport} />
                </ErrorBoundary>
              </Card>
            ) : (
              <Card className="shadow-sm">
                <LoadingSpinner size="sm" message="Analyzing risk..." />
              </Card>
            )}
          </div>
        </div>

        {/* Strategy Recommendations */}
        {advisorResponse ? (
          <Card className="shadow-sm">
            <ErrorBoundary fallback={<div className="p-4 text-sm text-gray-500">Strategy unavailable</div>}>
              <StrategyCards response={advisorResponse} />
            </ErrorBoundary>
          </Card>
        ) : (
          <Card className="flex items-center justify-center py-12 shadow-sm">
            <div className="text-center">
              <LoadingSpinner size="md" message="Claude is generating your personalized strategy..." />
              <p className="text-xs text-gray-400 mt-3">This typically takes 3-5 seconds</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
