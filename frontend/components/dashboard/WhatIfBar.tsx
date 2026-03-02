"use client";
import { useState, FormEvent } from "react";

interface WhatIfBarProps {
  isLoading: boolean;
  interpretation: string | null;
  changesSummary: string | null;
  error: string | null;
  isVisible: boolean;
  onSubmit: (question: string) => void;
  onClear: () => void;
}

const STARTERS = [
  "What if I retire at 60?",
  "What if I lose my job for 1 year?",
  "What if I buy a house for $800K in 2 years?",
  "What if I increase contributions by $1,000/month?",
];

export function WhatIfBar({
  isLoading,
  interpretation,
  changesSummary,
  error,
  isVisible,
  onSubmit,
  onClear,
}: WhatIfBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || isLoading) return;
    onSubmit(q);
  };

  const handleStarter = (s: string) => {
    setQuery(s);
    onSubmit(s);
  };

  return (
    <div className="space-y-3">
      {/* Input bar */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dust pointer-events-none">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a what-if question... e.g. What if I retire at 60?"
            disabled={isLoading}
            className="w-full bg-surface border border-rim text-sm text-parchment placeholder:text-dust pl-9 pr-4 py-2.5 focus:outline-none focus:border-gold/40 transition-colors font-mono disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-4 py-2.5 bg-surface border border-gold/30 text-gold text-xs font-mono tracking-widest hover:border-gold/60 hover:bg-gold/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border border-gold/40 border-t-gold rounded-full animate-spin inline-block" />
              Simulating...
            </span>
          ) : (
            "Run Scenario"
          )}
        </button>
        {isVisible && (
          <button
            type="button"
            onClick={() => { onClear(); setQuery(""); }}
            className="px-3 py-2.5 border border-rim text-dust text-xs font-mono hover:border-rim-strong hover:text-mist transition-all"
          >
            Clear
          </button>
        )}
      </form>

      {/* Starter suggestions (only when nothing is showing) */}
      {!isVisible && !isLoading && (
        <div className="flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => handleStarter(s)}
              className="text-xs text-dust border border-rim px-3 py-1.5 font-mono hover:border-gold/30 hover:text-gold/70 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-crimson font-mono border border-crimson/20 bg-crimson-bg px-3.5 py-2.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* Result interpretation */}
      {isVisible && interpretation && (
        <div className="border border-gold/20 bg-gold/[0.03] px-4 py-3 space-y-2">
          <p className="text-xs text-gold/80 font-mono tracking-wide">{interpretation}</p>
          {changesSummary && (
            <p className="text-xs text-dust font-mono leading-relaxed whitespace-pre-line">
              {changesSummary}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
