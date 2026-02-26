"use client";
import { formatCurrency, formatPercent, getFragilityColor, getSeverityColor } from "@/lib/formatters";
import type { RiskReport } from "@/lib/types";

interface RiskPanelProps {
  report: RiskReport;
}

export function RiskPanel({ report }: RiskPanelProps) {
  const { color: fragilityColor, label: fragilityLabel } = getFragilityColor(report.fragility_score);

  return (
    <div className="space-y-4">
      {/* Fragility Score */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center flex-shrink-0">
          <div
            className="w-14 h-14 flex items-center justify-center font-mono font-bold text-parchment text-lg border"
            style={{
              borderColor: fragilityColor,
              color: fragilityColor,
              boxShadow: `0 0 20px ${fragilityColor}22`,
            }}
          >
            {Math.round(report.fragility_score)}
          </div>
          <span className="text-xs font-mono mt-1.5 tracking-wide" style={{ color: fragilityColor }}>
            {fragilityLabel}
          </span>
        </div>
        <div>
          <div className="text-sm text-parchment mb-0.5">Fragility Score</div>
          <div className="text-xs text-mist leading-relaxed">{report.risk_narrative}</div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "VaR (5th pct)",        value: formatCurrency(report.var_5th_percentile, true) },
          { label: "CVaR (Exp. Shortfall)", value: formatCurrency(report.cvar_5th_percentile, true) },
          { label: "Portfolio Volatility",  value: formatPercent(report.portfolio_volatility) },
          { label: "Median Max Drawdown",   value: formatPercent(report.max_drawdown_median) },
        ].map((metric) => (
          <div key={metric.label} className="bg-elevated border border-rim p-3">
            <div className="text-xs text-dust mb-1 leading-tight">{metric.label}</div>
            <div className="font-mono text-sm text-parchment tabular-nums">{metric.value}</div>
          </div>
        ))}
      </div>

      {/* Misalignment Flags */}
      {report.misalignment_flags.length > 0 ? (
        <div>
          <div className="text-xs text-dust uppercase tracking-widest mb-2.5 font-mono flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
            Goal Alignment
          </div>
          <div className="space-y-2">
            {report.misalignment_flags.map((flag) => {
              const isOk       = flag.severity === "ok";
              const isWarning  = flag.severity === "warning";
              const isCritical = flag.severity === "critical";
              return (
                <div
                  key={flag.goal_id}
                  className={`flex items-start gap-2.5 p-3 border text-xs leading-relaxed ${
                    isOk
                      ? "bg-sage-bg border-sage/25 text-sage"
                      : isWarning
                      ? "bg-ember-bg border-ember/25 text-ember"
                      : "bg-crimson-bg border-crimson/25 text-crimson"
                  }`}
                >
                  <span className="font-mono font-semibold capitalize flex-shrink-0 mt-0.5 tracking-wide">
                    {flag.severity}
                  </span>
                  <span>{flag.message}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-sage bg-sage-bg border border-sage/25 p-3">
          <svg className="w-4 h-4 text-sage flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          All goals on track
        </div>
      )}
    </div>
  );
}
