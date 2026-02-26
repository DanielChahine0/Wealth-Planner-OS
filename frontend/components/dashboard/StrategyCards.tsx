"use client";
import React, { useState } from "react";
import { Card } from "@/components/shared/Card";
import type { AdvisorResponse, StrategyAction, AssetCategory } from "@/lib/types";

const CATEGORY_COLORS: Record<AssetCategory, string> = {
  savings: "bg-green-100 text-green-700",
  allocation: "bg-blue-100 text-blue-700",
  tax: "bg-purple-100 text-purple-700",
  insurance: "bg-yellow-100 text-yellow-700",
  income: "bg-teal-100 text-teal-700",
  spending: "bg-orange-100 text-orange-700",
};

interface StrategyCardProps {
  action: StrategyAction;
  onToggle: (id: string, approved: boolean | null) => void;
}

const StrategyCard = React.memo(function StrategyCard({ action, onToggle }: StrategyCardProps) {
  return (
    <div
      className={`border rounded-xl p-4 transition-all ${
        action.approved === true
          ? "border-green-400 bg-green-50"
          : action.approved === false
          ? "border-gray-200 bg-gray-50 opacity-60"
          : "border-gray-200 bg-white hover:border-blue-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-400">#{action.priority}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              CATEGORY_COLORS[action.category] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {action.category}
          </span>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => onToggle(action.id, action.approved === true ? null : true)}
            className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
              action.approved === true
                ? "bg-green-500 text-white border-green-500"
                : "text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-600"
            }`}
          >
            Approve
          </button>
          <button
            onClick={() => onToggle(action.id, action.approved === false ? null : false)}
            className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
              action.approved === false
                ? "bg-gray-400 text-white border-gray-400"
                : "text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-600"
            }`}
          >
            Skip
          </button>
        </div>
      </div>
      <h4 className="font-semibold text-gray-900 text-sm mb-1">{action.title}</h4>
      <p className="text-xs text-gray-600 leading-relaxed mb-2">{action.description}</p>
      <div className="text-xs font-medium text-blue-600 bg-blue-50 rounded px-2 py-1">
        Impact: {action.projected_impact}
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AI Strategy Recommendations</h2>
          <p className="text-sm text-gray-500 mt-0.5">{response.narrative}</p>
        </div>
        {approvedCount > 0 && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            {approvedCount} approved
          </span>
        )}
      </div>

      {actions.map((action) => (
        <StrategyCard key={action.id} action={action} onToggle={handleToggle} />
      ))}

      <p className="text-xs text-gray-400 italic pt-1">{response.disclaimer}</p>
    </div>
  );
}
