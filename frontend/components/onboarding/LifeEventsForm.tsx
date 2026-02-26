"use client";
import { useState } from "react";
import { Button } from "@/components/shared/Button";
import type { LifeEvent } from "@/lib/types";

interface LifeEventsFormProps {
  defaultEvents?: LifeEvent[];
  onSubmit: (events: LifeEvent[]) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const PRESET_EVENTS = [
  { name: "Marriage", income_delta: 0, expense_delta: 5000, one_time_cost: 30000 },
  { name: "Child born", income_delta: 0, expense_delta: 15000, one_time_cost: 10000 },
  { name: "Home purchase", income_delta: 0, expense_delta: 12000, one_time_cost: 60000 },
  { name: "Job change", income_delta: 20000, expense_delta: 0, one_time_cost: 0 },
];

const emptyEvent = (): LifeEvent => ({
  id: crypto.randomUUID(),
  name: "",
  year: new Date().getFullYear() + 5,
  income_delta: 0,
  expense_delta: 0,
  one_time_cost: 0,
});

export function LifeEventsForm({ defaultEvents = [], onSubmit, onBack, isLoading }: LifeEventsFormProps) {
  const [events, setEvents] = useState<LifeEvent[]>(defaultEvents);

  const addPreset = (preset: typeof PRESET_EVENTS[0]) => {
    setEvents((prev) => [
      ...prev,
      { ...emptyEvent(), ...preset },
    ]);
  };

  const updateEvent = (id: string, field: keyof LifeEvent, value: string | number) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const removeEvent = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id));

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Add major life events that will affect your income or expenses. These are injected into your simulation.
      </p>

      <div className="flex flex-wrap gap-2">
        {PRESET_EVENTS.map((p) => (
          <button
            key={p.name}
            onClick={() => addPreset(p)}
            className="px-3 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100"
          >
            + {p.name}
          </button>
        ))}
      </div>

      {events.map((event, i) => (
        <div key={event.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Event {i + 1}</span>
            <button
              onClick={() => removeEvent(event.id)}
              className="text-red-400 hover:text-red-600 text-xs"
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Event Name</label>
              <input
                type="text"
                value={event.name}
                onChange={(e) => updateEvent(event.id, "name", e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
              <input
                type="number"
                value={event.year}
                onChange={(e) => updateEvent(event.id, "year", Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Income Change ($/yr)</label>
              <input
                type="number"
                value={event.income_delta || ""}
                onChange={(e) => updateEvent(event.id, "income_delta", Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expense Change ($/yr)</label>
              <input
                type="number"
                value={event.expense_delta || ""}
                onChange={(e) => updateEvent(event.id, "expense_delta", Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">One-Time Cost ($)</label>
              <input
                type="number"
                value={event.one_time_cost || ""}
                onChange={(e) => updateEvent(event.id, "one_time_cost", Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      ))}

      {events.length === 0 && (
        <button
          onClick={() => setEvents([emptyEvent()])}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          + Add Life Event
        </button>
      )}

      <div className="flex gap-3 mt-4">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={() => onSubmit(events)} loading={isLoading} className="flex-1">
          {isLoading ? "Running Simulation..." : "Run My Plan"}
        </Button>
      </div>
    </div>
  );
}
