"use client";
import React, { useState } from "react";
import { Card } from "@/components/shared/Card";
import type { AdvisorResponse, StrategyAction, AssetCategory } from "@/lib/types";

const CATEGORY_COLORS: Record<AssetCategory, string> = {
  savings: "bg-green-100 text-green-700 border border-green-200/50",
  allocation: "bg-blue-100 text-blue-700 border border-blue-200/50",
  tax: "bg-purple-100 text-purple-700 border border-purple-200/50",
  insurance: "bg-yellow-100 text-yellow-700 border border-yellow-200/50",
  income: "bg-teal-100 text-teal-700 border border-teal-200/50",
  spending: "bg-orange-100 text-orange-700 border border-orange-200/50",
};

interface StrategyCardProps {
  action: StrategyAction;
  onToggle: (id: string, approved: boolean | null) => void;
}

const StrategyCard = React.memo(function StrategyCard({ action, onToggle }: StrategyCardProps) {
  return (
    <div
      className={`border rounded-xl p-5 transition-all duration-200 ${
        action.approved === true
          ? "border-green-300 bg-green-50/80 shadow-sm shadow-green-500/5"
          : action.approved === false
          ? "border-gray-200 bg-gray-50/80 opacity-50"
          : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold text-gray-300 bg-gray-50 rounded-md px-2 py-0.5">#{action.priority}</span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-md font-medium ${
              CATEGORY_COLORS[action.category] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {action.category}
          </span>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onToggle(action.id, action.approved === true ? null : true)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
              action.approved === true
                ? "bg-green-500 text-white border-green-500 shadow-sm"
                : "text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-600 hover:bg-green-50"
            }`}
          >
            {action.approved === true ? '✓ Approved' : 'Approve'}
          </button>
          <button
            onClick={() => onToggle(action.id, action.approved === false ? null : false)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
              action.approved === false
                ? "bg-gray-400 text-white border-gray-400"
                : "text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50"
            }`}
          >
            Skip
          </button>
        </div>
      </div>
      <h4 className="font-semibold text-gray-900 text-sm mb-1.5">{action.title}</h4>
      <p className="text-sm text-gray-600 leading-relaxed mb-3">{action.description}</p>
      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
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
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            AI Strategy Recommendations
          </h2>
          <p className="text-sm text-gray-500 mt-1">{response.narrative}</p>
        </div>
        {approvedCount > 0 && (
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-semibold shadow-sm">
            {approvedCount} approved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => (
          <StrategyCard key={action.id} action={action} onToggle={handleToggle} />
        ))}
      </div>

      <p className="text-xs text-gray-400 italic pt-2 border-t border-gray-100">{response.disclaimer}</p>
    </div>
  );
}
