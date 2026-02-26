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
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian flex flex-col">
      {/* Top nav */}
      <nav className="bg-surface/90 backdrop-blur-lg border-b border-rim px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-gold text-xs">◆</span>
          <span className="font-serif text-parchment text-lg tracking-widest">
            WEALTHPLANNER<span className="text-gold">OS</span>
          </span>
        </div>
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 text-xs text-mist hover:text-parchment tracking-wide transition-colors"
        >
          <svg
            className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Dashboard
        </Link>
      </nav>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden max-w-6xl mx-auto w-full p-6 gap-5">
        {/* Sidebar: context snapshot */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
          <div className="bg-surface border border-rim p-5">
            <h3 className="text-xs text-dust tracking-widest uppercase mb-4 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Plan Snapshot
            </h3>
            <div className="space-y-3">
              {[
                { label: "Age", value: `${profile.current_age} → ${profile.retirement_age}` },
                { label: "Income", value: formatCurrency(profile.annual_income, true) + "/yr" },
                { label: "Portfolio", value: formatCurrency(profile.current_portfolio_value, true) },
                { label: "Success Rate", value: formatPercent(simulationResult.success_rate, 0) },
                { label: "Median Final", value: formatCurrency(simulationResult.median_final_value, true) },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center text-sm border-b border-rim pb-2 last:border-0 last:pb-0">
                  <span className="text-dust text-xs tracking-wide">{item.label}</span>
                  <span className="font-mono text-parchment text-xs">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {riskReport && (
            <div className="bg-surface border border-rim p-5">
              <h3 className="text-xs text-dust tracking-widest uppercase mb-3 flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Risk Summary
              </h3>
              <div className="text-xs text-mist leading-relaxed">
                {riskReport.risk_narrative}
              </div>
            </div>
          )}
        </div>

        {/* Chat panel */}
        <div className="flex-1 bg-surface border border-rim flex flex-col overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
