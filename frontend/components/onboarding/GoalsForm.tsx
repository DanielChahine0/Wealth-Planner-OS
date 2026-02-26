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

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Define your financial goals. These will be tracked against your simulation results.
      </p>

      {goals.map((goal, i) => (
        <div key={goal.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Goal {i + 1}</span>
            {goals.length > 1 && (
              <button
                onClick={() => removeGoal(goal.id)}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={`goal-name-${goal.id}`} className="block text-xs font-medium text-gray-600 mb-1">Goal Name</label>
              <input
                id={`goal-name-${goal.id}`}
                type="text"
                placeholder="e.g. Retirement, College Fund"
                value={goal.name}
                onChange={(e) => updateGoal(goal.id, "name", e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor={`goal-amount-${goal.id}`} className="block text-xs font-medium text-gray-600 mb-1">Target Amount ($)</label>
              <input
                id={`goal-amount-${goal.id}`}
                type="number"
                value={goal.target_amount || ""}
                onChange={(e) => updateGoal(goal.id, "target_amount", Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor={`goal-year-${goal.id}`} className="block text-xs font-medium text-gray-600 mb-1">Target Year</label>
              <input
                id={`goal-year-${goal.id}`}
                type="number"
                value={goal.target_year}
                onChange={(e) => updateGoal(goal.id, "target_year", Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor={`goal-priority-${goal.id}`} className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
              <select
                id={`goal-priority-${goal.id}`}
                value={goal.priority}
                onChange={(e) => updateGoal(goal.id, "priority", e.target.value as GoalPriority)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + Add Another Goal
      </button>

      <div className="flex gap-3 mt-4">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          Continue to Life Events
        </Button>
      </div>
    </div>
  );
}
