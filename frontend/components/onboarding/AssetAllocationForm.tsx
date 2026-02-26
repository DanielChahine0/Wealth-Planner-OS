"use client";
import { useState } from "react";
import { Button } from "@/components/shared/Button";

interface Allocation {
  us_equity: number;
  intl_equity: number;
  bonds: number;
  real_estate: number;
  cash: number;
}

interface AssetAllocationFormProps {
  defaultValues?: Allocation;
  onNext: (allocation: Allocation) => void;
  onBack: () => void;
}

const ASSET_LABELS: { key: keyof Allocation; label: string; color: string; barColor: string }[] = [
  { key: "us_equity",   label: "US Equity",    color: "bg-[#4A7FA5]", barColor: "#4A7FA5" },
  { key: "intl_equity", label: "Intl Equity",  color: "bg-[#7A5FA5]", barColor: "#7A5FA5" },
  { key: "bonds",       label: "Bonds",        color: "bg-[#4A8B6A]", barColor: "#4A8B6A" },
  { key: "real_estate", label: "Real Estate",  color: "bg-gold",      barColor: "#C8A254" },
  { key: "cash",        label: "Cash",         color: "bg-rim-strong", barColor: "#38383F" },
];

const DEFAULT_PCT: Allocation = {
  us_equity: 60, intl_equity: 20, bonds: 15, real_estate: 5, cash: 0,
};

export function AssetAllocationForm({ defaultValues, onNext, onBack }: AssetAllocationFormProps) {
  const toPercent = (a: Allocation) => ({
    us_equity: Math.round((a.us_equity ?? DEFAULT_PCT.us_equity) * (a.us_equity <= 1 ? 100 : 1)),
    intl_equity: Math.round((a.intl_equity ?? DEFAULT_PCT.intl_equity) * (a.intl_equity <= 1 ? 100 : 1)),
    bonds: Math.round((a.bonds ?? DEFAULT_PCT.bonds) * (a.bonds <= 1 ? 100 : 1)),
    real_estate: Math.round((a.real_estate ?? DEFAULT_PCT.real_estate) * (a.real_estate <= 1 ? 100 : 1)),
    cash: Math.round((a.cash ?? DEFAULT_PCT.cash) * (a.cash <= 1 ? 100 : 1)),
  });

  const [pct, setPct] = useState<Allocation>(
    defaultValues ? toPercent(defaultValues) : { ...DEFAULT_PCT }
  );
  const [locked, setLocked] = useState<Set<keyof Allocation>>(new Set());

  const total = Object.values(pct).reduce((s, v) => s + v, 0);
  const isValid = total === 100;

  const handleChange = (key: keyof Allocation, value: number) => {
    const next = { ...pct, [key]: value };
    const newTotal = Object.values(next).reduce((s, v) => s + v, 0);
    const diff = 100 - newTotal;
    if (diff !== 0) {
      const unlocked = ASSET_LABELS.map(a => a.key).filter(k => k !== key && !locked.has(k));
      if (unlocked.length > 0) {
        const unlockSum = unlocked.reduce((s, k) => s + next[k], 0);
        if (unlockSum > 0 || diff < 0) {
          unlocked.forEach(k => {
            const share = unlockSum > 0 ? next[k] / unlockSum : 1 / unlocked.length;
            next[k] = Math.max(0, Math.min(100, Math.round(next[k] + diff * share)));
          });
        }
      }
    }
    setPct(next);
  };

  const toggleLock = (key: keyof Allocation) => {
    setLocked(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!isValid) return;
    onNext({
      us_equity: pct.us_equity / 100,
      intl_equity: pct.intl_equity / 100,
      bonds: pct.bonds / 100,
      real_estate: pct.real_estate / 100,
      cash: pct.cash / 100,
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-mist">
        Set your target asset allocation. Sliders auto-balance — lock any to hold it fixed.
      </p>

      {/* Visual allocation bar */}
      <div className="h-2 bg-rim overflow-hidden flex">
        {ASSET_LABELS.map(({ key, barColor }) => (
          pct[key] > 0 && (
            <div
              key={key}
              className="transition-all duration-300"
              style={{ width: `${pct[key]}%`, backgroundColor: barColor }}
            />
          )
        ))}
      </div>

      <div className="space-y-5">
        {ASSET_LABELS.map(({ key, label, color, barColor }) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="inline-block w-2.5 h-2.5"
                  style={{ backgroundColor: barColor }}
                />
                <label className="text-sm text-parchment">{label}</label>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-parchment w-12 text-right tabular-nums">
                  {pct[key]}%
                </span>
                <button
                  type="button"
                  onClick={() => toggleLock(key)}
                  className={`p-1.5 text-xs transition-all border ${
                    locked.has(key)
                      ? "border-gold text-gold bg-gold/10"
                      : "border-rim text-dust hover:border-rim-strong hover:text-mist"
                  }`}
                  title={locked.has(key) ? "Unlock" : "Lock"}
                >
                  {locked.has(key) ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={pct[key]}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              className="w-full h-1 cursor-pointer bg-rim appearance-none"
              style={{ accentColor: barColor }}
            />
          </div>
        ))}
      </div>

      <div className={`flex items-center justify-between p-4 border transition-colors ${
        isValid
          ? "bg-sage-bg border-sage/30 text-sage"
          : "bg-crimson-bg border-crimson/30 text-crimson"
      }`}>
        <div className="flex items-center gap-2">
          {isValid ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          )}
          <span className="text-sm">Total Allocation</span>
        </div>
        <span className="font-mono text-sm tabular-nums">
          {total}% {!isValid && `(${total > 100 ? "over" : "under"} by ${Math.abs(100 - total)}%)`}
        </span>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={!isValid} className="flex-1">
          Continue to Life Events
        </Button>
      </div>
    </div>
  );
}
