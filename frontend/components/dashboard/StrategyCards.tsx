"use client";
import React, { useState } from "react";
import type { AdvisorResponse, StrategyAction, AssetCategory } from "@/lib/types";

// ─── Human-in-the-Loop Gate Banner ───────────────────────────────────────────

interface HiTLGateProps {
  reason: string;
  acknowledged: boolean;
  onAcknowledge: (v: boolean) => void;
}

function HiTLGate({ reason, acknowledged, onAcknowledge }: HiTLGateProps) {
  return (
    <div
      className={`mb-3 px-3.5 py-3 border transition-all ${
        acknowledged
          ? "border-rim bg-surface/50 opacity-60"
          : "border-ember/40 bg-ember-bg"
      }`}
    >
      {!acknowledged && (
        <div className="flex items-start gap-2 mb-2.5">
          <svg className="w-3.5 h-3.5 text-ember flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-xs font-mono text-ember tracking-wide mb-0.5">HUMAN REVIEW REQUIRED</p>
            <p className="text-xs text-mist leading-relaxed">{reason}</p>
          </div>
        </div>
      )}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => onAcknowledge(e.target.checked)}
          className="accent-ember w-3.5 h-3.5"
        />
        <span className="text-xs text-dust font-mono tracking-wide">
          {acknowledged ? "Acknowledged — consult a licensed advisor" : "I understand this requires professional advice"}
        </span>
      </label>
    </div>
  );
}

const CATEGORY_STYLES: Record<AssetCategory, { bg: string; text: string; border: string }> = {
  savings:    { bg: "bg-sage-bg",    text: "text-sage",    border: "border-sage/25" },
  allocation: { bg: "bg-[#0D1A2A]",  text: "text-[#4A7FA5]", border: "border-[#4A7FA5]/25" },
  tax:        { bg: "bg-[#1A0D2A]",  text: "text-[#7A5FA5]", border: "border-[#7A5FA5]/25" },
  insurance:  { bg: "bg-ember-bg",   text: "text-ember",   border: "border-ember/25" },
  income:     { bg: "bg-[#0D1A1A]",  text: "text-[#4A9A8A]", border: "border-[#4A9A8A]/25" },
  spending:   { bg: "bg-[#1A140D]",  text: "text-[#A5854A]", border: "border-[#A5854A]/25" },
};

interface StrategyCardProps {
  action: StrategyAction;
  onToggle: (id: string, approved: boolean | null) => void;
}

const StrategyCard = React.memo(function StrategyCard({ action, onToggle }: StrategyCardProps) {
  const [hitlAcknowledged, setHitlAcknowledged] = useState(false);
  const catStyle = CATEGORY_STYLES[action.category] ?? { bg: "bg-elevated", text: "text-mist", border: "border-rim" };
  const needsReview = action.requires_human_review && !hitlAcknowledged;

  return (
    <div
      className={`border p-5 transition-all duration-200 ${
        action.approved === true
          ? "border-sage/40 bg-sage-bg"
          : action.approved === false
          ? "border-rim bg-elevated opacity-40"
          : action.requires_human_review && !hitlAcknowledged
          ? "border-ember/30 bg-ember-bg/30"
          : "border-rim bg-surface hover:border-rim-strong"
      }`}
    >
      {action.requires_human_review && (
        <HiTLGate
          reason={action.human_review_reason ?? "This decision has significant financial consequences that require professional judgment."}
          acknowledged={hitlAcknowledged}
          onAcknowledge={setHitlAcknowledged}
        />
      )}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-xs text-dust">#{action.priority}</span>
          <span
            className={`text-xs px-2.5 py-0.5 font-mono tracking-wide border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
          >
            {action.category}
          </span>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onToggle(action.id, action.approved === true ? null : true)}
            disabled={needsReview}
            className={`text-xs px-3 py-1.5 border font-mono tracking-wide transition-all ${
              needsReview
                ? "opacity-40 cursor-not-allowed text-dust border-rim"
                : action.approved === true
                ? "bg-sage border-sage/50 text-parchment"
                : "text-dust border-rim hover:border-sage hover:text-sage"
            }`}
          >
            {action.approved === true ? "✓ Done" : "Approve"}
          </button>
          <button
            onClick={() => onToggle(action.id, action.approved === false ? null : false)}
            disabled={needsReview}
            className={`text-xs px-3 py-1.5 border font-mono tracking-wide transition-all ${
              needsReview
                ? "opacity-40 cursor-not-allowed text-dust border-rim"
                : action.approved === false
                ? "bg-elevated border-rim-strong text-mist"
                : "text-dust border-rim hover:border-rim-strong hover:text-mist"
            }`}
          >
            Skip
          </button>
        </div>
      </div>
      <h4 className="text-parchment text-sm mb-1.5">{action.title}</h4>
      <p className="text-sm text-mist leading-relaxed mb-3">{action.description}</p>
      <div className="inline-flex items-center gap-1.5 text-xs font-mono text-gold border border-gold-dim px-3 py-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
        {action.projected_impact}
      </div>
    </div>
  );
});

interface StrategyCardsProps {
  response: AdvisorResponse;
}

export function StrategyCards({ response }: StrategyCardsProps) {
  const [actions, setActions] = useState(response.strategy_actions);

  const handleToggle = (id: string, approved: boolean | null) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, approved } : a))
    );
  };

  const approvedCount = actions.filter((a) => a.approved === true).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-parchment flex items-center gap-2 mb-1">
            <span className="text-gold text-xs">◆</span>
            <span className="font-serif text-xl">AI Strategy Recommendations</span>
          </h2>
          <p className="text-sm text-mist">{response.narrative}</p>
        </div>
        {approvedCount > 0 && (
          <span className="font-mono text-xs bg-sage-bg text-sage border border-sage/25 px-3 py-1.5">
            {approvedCount} approved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => (
          <StrategyCard key={action.id} action={action} onToggle={handleToggle} />
        ))}
      </div>

      <p className="text-xs text-dust italic pt-3 border-t border-rim">{response.disclaimer}</p>
    </div>
  );
}
