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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 flex flex-col">
      {/* Top nav */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">WealthPlanner<span className="text-blue-600">OS</span></span>
        </div>
        <Link href="/dashboard" className="group flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-all">
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Dashboard
        </Link>
      </nav>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden max-w-6xl mx-auto w-full p-6 gap-6">
        {/* Sidebar: context snapshot */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Your Plan Snapshot
            </h3>
            <div className="space-y-3">
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
                <div key={item.label} className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="font-semibold text-gray-800 tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {riskReport && (
            <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Risk Summary
              </h3>
              <div className="text-sm text-gray-600 leading-relaxed">
                {riskReport.risk_narrative}
              </div>
            </div>
          )}
        </div>

        {/* Chat panel */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200/80 flex flex-col overflow-hidden shadow-sm">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
