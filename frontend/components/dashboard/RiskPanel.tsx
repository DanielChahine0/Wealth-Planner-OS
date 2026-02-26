"use client";
import { Card } from "@/components/shared/Card";
import { formatCurrency, formatPercent, getFragilityColor, getSeverityColor } from "@/lib/formatters";
import type { RiskReport } from "@/lib/types";

interface RiskPanelProps {
  report: RiskReport;
}

export function RiskPanel({ report }: RiskPanelProps) {
  const fragilityColor = getFragilityColor(report.fragility_score);

  return (
    <div className="space-y-4">
      {/* Fragility Score */}
      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
          style={{ backgroundColor: fragilityColor }}
        >
          {Math.round(report.fragility_score)}
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-800">Fragility Score</div>
          <div className="text-xs text-gray-500">{report.risk_narrative}</div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-0.5">VaR (5th pct)</div>
          <div className="text-sm font-semibold text-gray-800">
            {formatCurrency(report.var_5th_percentile, true)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-0.5">CVaR (Exp. Shortfall)</div>
          <div className="text-sm font-semibold text-gray-800">
            {formatCurrency(report.cvar_5th_percentile, true)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-0.5">Portfolio Volatility</div>
          <div className="text-sm font-semibold text-gray-800">
            {formatPercent(report.portfolio_volatility)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-0.5">Median Max Drawdown</div>
          <div className="text-sm font-semibold text-gray-800">
            {formatPercent(report.max_drawdown_median)}
          </div>
        </div>
      </div>

      {/* Misalignment Flags */}
      {report.misalignment_flags.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Goal Alignment
          </div>
          <div className="space-y-2">
            {report.misalignment_flags.map((flag) => (
              <div
                key={flag.goal_id}
                className={`flex items-start gap-2 p-2 rounded-lg border text-xs ${getSeverityColor(flag.severity)}`}
              >
                <span className="font-semibold capitalize flex-shrink-0">{flag.severity}</span>
                <span>{flag.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
