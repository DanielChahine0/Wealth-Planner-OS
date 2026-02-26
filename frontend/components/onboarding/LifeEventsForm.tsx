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
  { name: "Marriage",      income_delta: 0,     expense_delta: 5000,  one_time_cost: 30000 },
  { name: "Child born",    income_delta: 0,     expense_delta: 15000, one_time_cost: 10000 },
  { name: "Home purchase", income_delta: 0,     expense_delta: 12000, one_time_cost: 60000 },
  { name: "Job change",    income_delta: 20000, expense_delta: 0,     one_time_cost: 0     },
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
    setEvents((prev) => [...prev, { ...emptyEvent(), ...preset }]);
  };

  const updateEvent = (id: string, field: keyof LifeEvent, value: string | number) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const removeEvent = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id));

  const inputClasses = "w-full border border-rim bg-elevated text-parchment rounded-none px-3 py-2.5 text-sm hover:border-rim-strong focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-dust";

  return (
    <div className="space-y-5">
      <p className="text-sm text-mist">
        Add major life events that will affect your income or expenses. These are injected into your simulation.
      </p>

      {/* Preset quick-add buttons */}
      <div>
        <h3 className="text-xs font-mono text-gold tracking-widest uppercase mb-3">Quick Add</h3>
        <div className="flex flex-wrap gap-2">
          {PRESET_EVENTS.map((p) => (
            <button
              key={p.name}
              onClick={() => addPreset(p)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs text-mist border border-rim hover:border-gold hover:text-gold transition-all"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {events.map((event, i) => (
        <div key={event.id} className="border border-rim p-5 space-y-4 bg-elevated hover:border-rim-strong transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gold tracking-wide">
              Event {String(i + 1).padStart(2, "0")}{event.name ? `: ${event.name}` : ""}
            </span>
            <button
              onClick={() => removeEvent(event.id)}
              className="text-crimson/70 hover:text-crimson text-xs flex items-center gap-1 px-2 py-1 hover:bg-crimson-bg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`event-name-${event.id}`} className="block text-xs text-mist tracking-wide mb-1.5">Event Name</label>
              <input
                id={`event-name-${event.id}`}
                type="text"
                value={event.name}
                onChange={(e) => updateEvent(event.id, "name", e.target.value)}
                className={inputClasses}
                placeholder="e.g. Marriage, New baby"
              />
            </div>
            <div>
              <label htmlFor={`event-year-${event.id}`} className="block text-xs text-mist tracking-wide mb-1.5">Year</label>
              <input
                id={`event-year-${event.id}`}
                type="number"
                min={new Date().getFullYear()}
                value={event.year}
                onChange={(e) => updateEvent(event.id, "year", Number(e.target.value))}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor={`event-income-${event.id}`} className="block text-xs text-mist tracking-wide mb-1.5">Income Change</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dust text-sm font-mono">$</span>
                <input
                  id={`event-income-${event.id}`}
                  type="number"
                  value={event.income_delta || ""}
                  onChange={(e) => updateEvent(event.id, "income_delta", Number(e.target.value))}
                  className={`${inputClasses} pl-7`}
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dust text-xs font-mono">/yr</span>
              </div>
            </div>
            <div>
              <label htmlFor={`event-expense-${event.id}`} className="block text-xs text-mist tracking-wide mb-1.5">Expense Change</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dust text-sm font-mono">$</span>
                <input
                  id={`event-expense-${event.id}`}
                  type="number"
                  value={event.expense_delta || ""}
                  onChange={(e) => updateEvent(event.id, "expense_delta", Number(e.target.value))}
                  className={`${inputClasses} pl-7`}
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dust text-xs font-mono">/yr</span>
              </div>
            </div>
            <div className="col-span-full">
              <label htmlFor={`event-cost-${event.id}`} className="block text-xs text-mist tracking-wide mb-1.5">One-Time Cost</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dust text-sm font-mono">$</span>
                <input
                  id={`event-cost-${event.id}`}
                  type="number"
                  value={event.one_time_cost || ""}
                  onChange={(e) => updateEvent(event.id, "one_time_cost", Number(e.target.value))}
                  className={`${inputClasses} pl-7`}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {events.length === 0 && (
        <div className="text-center py-10 border border-dashed border-rim">
          <svg className="w-8 h-8 text-dust mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <p className="text-sm text-dust mb-3">No life events added yet</p>
          <button
            onClick={() => setEvents([emptyEvent()])}
            className="text-xs text-gold hover:text-gold-bright font-mono tracking-wide"
          >
            + Add a custom event
          </button>
        </div>
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
