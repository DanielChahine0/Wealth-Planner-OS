"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { ChatInterface } from "@/components/advisor/ChatInterface";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { formatCurrency, formatPercent } from "@/lib/formatters";

export default function AdvisorPage() {
  const router = useRouter();
  const { profile, simulationResult, riskReport } = useStore();

  useEffect(() => {
    if (!simulationResult) {
      router.replace("/onboarding");
    }
  }, [simulationResult, router]);

  if (!simulationResult || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="font-bold text-gray-900 text-lg">Wealth Planner OS</div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden max-w-6xl mx-auto w-full p-6 gap-6">
        {/* Sidebar: context snapshot */}
        <div className="w-64 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Your Plan Snapshot
            </h3>
            <div className="space-y-2">
              {[
                { label: "Age", value: `${profile.current_age} → ${profile.retirement_age}` },
                { label: "Income", value: formatCurrency(profile.annual_income, true) + "/yr" },
                {
                  label: "Portfolio",
                  value: formatCurrency(profile.current_portfolio_value, true),
                },
                {
                  label: "Success Rate",
                  value: formatPercent(simulationResult.success_rate, 0),
                },
                {
                  label: "Median Final",
                  value: formatCurrency(simulationResult.median_final_value, true),
                },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-medium text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {riskReport && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Risk Summary
              </h3>
              <div className="text-xs text-gray-600 leading-relaxed">
                {riskReport.risk_narrative}
              </div>
            </div>
          )}
        </div>

        {/* Chat panel */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
