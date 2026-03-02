"use client";
import type { CoachingInsight, BiasSeverity } from "@/lib/types";

const BIAS_LABELS: Record<string, string> = {
  recency_bias: "Recency Bias",
  loss_aversion: "Loss Aversion",
  optimism_bias: "Optimism Bias",
  status_quo_bias: "Status Quo Bias",
  concentration_risk: "Concentration Risk",
  sequence_risk: "Sequence Risk",
  under_insurance: "Under-Insurance",
};

const SEVERITY_CONFIG: Record<BiasSeverity, { dot: string; border: string; bg: string; label: string }> = {
  high:   { dot: "bg-crimson",  border: "border-crimson/25",  bg: "bg-crimson-bg",  label: "HIGH"   },
  medium: { dot: "bg-ember",    border: "border-ember/25",    bg: "bg-ember-bg",    label: "MEDIUM" },
  low:    { dot: "bg-sage",     border: "border-sage/25",     bg: "bg-sage-bg",     label: "LOW"    },
};

interface CoachingInsightCardProps {
  insight: CoachingInsight;
}

function CoachingInsightCard({ insight }: CoachingInsightCardProps) {
  const sev = SEVERITY_CONFIG[insight.severity] ?? SEVERITY_CONFIG.low;
  const biasLabel = BIAS_LABELS[insight.bias_type] ?? insight.bias_type.replace(/_/g, " ");

  return (
    <div className={`border p-5 ${sev.border} ${sev.bg}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${sev.dot} mt-0.5 flex-shrink-0`} />
          <span className="text-xs font-mono text-mist tracking-wide">{biasLabel}</span>
        </div>
        <span className={`text-xs font-mono tracking-widest px-2 py-0.5 border ${sev.border} ${sev.dot.replace("bg-", "text-")}`}>
          {sev.label}
        </span>
      </div>

      {/* Title + observation */}
      <h4 className="text-parchment text-sm mb-1.5">{insight.title}</h4>
      <p className="text-sm text-mist leading-relaxed mb-3">{insight.observation}</p>

      {/* Impact highlight */}
      <div className="inline-flex items-center gap-1.5 text-xs font-mono text-ember border border-ember/25 px-3 py-1.5 mb-3">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {insight.impact}
      </div>

      {/* Suggestion */}
      <div className="border-t border-rim/50 pt-3">
        <p className="text-xs text-dust font-mono tracking-wide mb-1 uppercase">Suggested Action</p>
        <p className="text-sm text-mist leading-relaxed">{insight.suggestion}</p>
      </div>
    </div>
  );
}

interface CoachingPanelProps {
  insights: CoachingInsight[];
  isLoading?: boolean;
}

export function CoachingPanel({ insights, isLoading }: CoachingPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-ember text-xs">◆</span>
          <h2 className="font-serif text-xl text-parchment">Behavioral Finance Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="border border-rim bg-surface p-5 animate-pulse space-y-3">
              <div className="h-2 bg-rim rounded w-1/3" />
              <div className="h-3 bg-rim rounded w-2/3" />
              <div className="h-2 bg-rim rounded w-full" />
              <div className="h-2 bg-rim rounded w-4/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!insights || insights.length === 0) return null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-parchment flex items-center gap-2 mb-1">
          <span className="text-ember text-xs">◆</span>
          <span className="font-serif text-xl">Behavioral Finance Insights</span>
        </h2>
        <p className="text-sm text-mist">
          Patterns in your financial decisions that may be silently costing you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight) => (
          <CoachingInsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}
