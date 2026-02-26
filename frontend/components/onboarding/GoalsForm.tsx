"use client";
import { useState } from "react";
import { Button } from "@/components/shared/Button";
import type { FinancialGoal, GoalPriority } from "@/lib/types";

interface GoalsFormProps {
  defaultGoals?: FinancialGoal[];
  onNext: (goals: FinancialGoal[]) => void;
  onBack: () => void;
}

const emptyGoal = (): FinancialGoal => ({
  id: crypto.randomUUID(),
  name: "",
  target_amount: 0,
  target_year: new Date().getFullYear() + 20,
  priority: "important",
});

export function GoalsForm({ defaultGoals = [], onNext, onBack }: GoalsFormProps) {
  const [goals, setGoals] = useState<FinancialGoal[]>(
    defaultGoals.length > 0 ? defaultGoals : [emptyGoal()]
  );

  const updateGoal = (id: string, field: keyof FinancialGoal, value: string | number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const addGoal = () => setGoals((prev) => [...prev, emptyGoal()]);
  const removeGoal = (id: string) => setGoals((prev) => prev.filter((g) => g.id !== id));

  const handleSubmit = () => {
    const valid = goals.filter((g) => g.name && g.target_amount > 0);
    onNext(valid);
  };

  const inputClasses = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400";

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Define your financial goals. These will be tracked against your simulation results.
      </p>

      {goals.map((goal, i) => (
        <div key={goal.id} className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50/50 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">Goal {i + 1}</span>
            {goals.length > 1 && (
              <button
                onClick={() => removeGoal(goal.id)}
                className="text-red-400 hover:text-red-600 text-xs font-medium flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`goal-name-${goal.id}`} className="block text-xs font-medium text-gray-600 mb-1.5">Goal Name</label>
              <input
                id={`goal-name-${goal.id}`}
                type="text"
                placeholder="e.g. Retirement, College Fund"
                value={goal.name}
                onChange={(e) => updateGoal(goal.id, "name", e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor={`goal-amount-${goal.id}`} className="block text-xs font-medium text-gray-600 mb-1.5">Target Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  id={`goal-amount-${goal.id}`}
                  type="number"
                  value={goal.target_amount || ""}
                  onChange={(e) => updateGoal(goal.id, "target_amount", Number(e.target.value))}
                  className={`${inputClasses} pl-7`}
                  placeholder="1,000,000"
                />
              </div>
            </div>
            <div>
              <label htmlFor={`goal-year-${goal.id}`} className="block text-xs font-medium text-gray-600 mb-1.5">Target Year</label>
              <input
                id={`goal-year-${goal.id}`}
                type="number"
                value={goal.target_year}
                onChange={(e) => updateGoal(goal.id, "target_year", Number(e.target.value))}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor={`goal-priority-${goal.id}`} className="block text-xs font-medium text-gray-600 mb-1.5">Priority</label>
              <select
                id={`goal-priority-${goal.id}`}
                value={goal.priority}
                onChange={(e) => updateGoal(goal.id, "priority", e.target.value as GoalPriority)}
                className={inputClasses}
              >
                <option value="critical">Critical</option>
                <option value="important">Important</option>
                <option value="nice_to_have">Nice to Have</option>
              </select>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addGoal}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3.5 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Another Goal
      </button>

      <div className="flex gap-3 mt-4">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          Continue to Allocation
        </Button>
      </div>
    </div>
  );
}
