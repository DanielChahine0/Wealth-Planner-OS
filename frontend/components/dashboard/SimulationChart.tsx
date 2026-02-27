"use client";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import type { SimulationResult } from "@/lib/types";

interface SimulationChartProps {
  result: SimulationResult;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const PERCENTILE_ROWS: Array<{
  key: string;
  label: string;
  alpha: number;
  bold?: boolean;
}> = [
  { key: "_p90", label: "90th pct", alpha: 0.38 },
  { key: "_p75", label: "75th pct", alpha: 0.58 },
  { key: "_p50", label: "Median",   alpha: 1.00, bold: true },
  { key: "_p25", label: "25th pct", alpha: 0.58 },
  { key: "_p10", label: "10th pct", alpha: 0.38 },
];

function FanTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d: Record<string, number> = payload[0]?.payload;
  if (!d?._p50) return null;

  return (
    <div
      style={{
        background: "#0F0F11",
        border: "1px solid #38383F",
        borderRadius: 2,
        padding: "10px 14px",
        boxShadow: "0 16px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(200,162,84,0.06)",
        minWidth: 172,
      }}
    >
      {/* Year header */}
      <div
        style={{
          color: "#6B5628",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 8,
          paddingBottom: 7,
          borderBottom: "1px solid #1E1E22",
          fontFamily: "monospace",
        }}
      >
        {label}
      </div>

      {PERCENTILE_ROWS.map(({ key, label: rowLabel, alpha, bold }) => (
        <div
          key={key}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 20,
            marginBottom: key === "_p10" ? 0 : bold ? 5 : 3,
            paddingBottom: bold ? 5 : 0,
            borderBottom: bold ? "1px solid #1E1E22" : "none",
            color: `rgba(200, 162, 84, ${alpha})`,
            fontSize: bold ? 12 : 10,
            fontWeight: bold ? 700 : 400,
            fontFamily: "monospace",
          }}
        >
          <span
            style={{
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              fontSize: bold ? 10 : 9,
            }}
          >
            {rowLabel}
          </span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatCurrency(d[key], true)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SimulationChart({ result }: SimulationChartProps) {
  const lastIdx = result.years.length - 1;
  const retirementYear = result.years[lastIdx];
  const p10Final = Math.round(result.percentiles.p10[lastIdx]);
  const p90Final = Math.round(result.percentiles.p90[lastIdx]);

  // Build data: raw values for tooltip + stacked band heights for the fan chart
  const data = result.years.map((year, i) => {
    const p10 = result.percentiles.p10[i];
    const p25 = result.percentiles.p25[i];
    const p50 = result.percentiles.p50[i];
    const p75 = result.percentiles.p75[i];
    const p90 = result.percentiles.p90[i];
    return {
      year,
      // Stored for tooltip only (not rendered as chart series)
      _p10: Math.round(p10),
      _p25: Math.round(p25),
      _p50: Math.round(p50),
      _p75: Math.round(p75),
      _p90: Math.round(p90),
      // Stacked band heights (difference between consecutive percentiles)
      bandBase:      Math.max(0, Math.round(p10)),
      bandInnerBot:  Math.max(0, Math.round(p25 - p10)),
      bandCenterBot: Math.max(0, Math.round(p50 - p25)),
      bandCenterTop: Math.max(0, Math.round(p75 - p50)),
      bandOuterTop:  Math.max(0, Math.round(p90 - p75)),
    };
  });

  const yMax = Math.round(p90Final * 1.09);

  return (
    <div>
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            {/* Nested diamond icon — matches nav branding */}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <path d="M6.5 0.7L12.3 6.5L6.5 12.3L0.7 6.5L6.5 0.7Z" stroke="#C8A254" strokeWidth="0.8" fill="none" />
              <path d="M6.5 3.5L9.5 6.5L6.5 9.5L3.5 6.5L6.5 3.5Z" fill="#C8A254" fillOpacity="0.32" />
            </svg>
            <h2
              className="text-parchment tracking-wider"
              style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: "0.95rem" }}
            >
              Wealth Trajectory
            </h2>
          </div>
          <p
            className="text-xs tracking-widest"
            style={{ color: "#4A4742", letterSpacing: "0.1em" }}
          >
            {formatNumber(result.simulation_metadata.n_simulations)}&nbsp;simulations
            <span className="mx-2" style={{ color: "#26262D" }}>·</span>
            {result.simulation_metadata.n_years}&nbsp;year horizon
          </p>
        </div>

        {/* Retirement summary stat */}
        <div
          className="text-right px-4 py-2.5 relative overflow-hidden"
          style={{ border: "1px solid #6B5628" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(200,162,84,0.05) 0%, transparent 60%)",
            }}
          />
          <div
            className="uppercase mb-1"
            style={{ color: "#4A4742", fontSize: "0.6rem", letterSpacing: "0.14em", fontFamily: "monospace" }}
          >
            Median at Retirement
          </div>
          <div
            className="font-bold text-gold tabular-nums"
            style={{ fontFamily: "var(--font-data, monospace)", fontSize: "1.2rem", lineHeight: 1.15 }}
          >
            {formatCurrency(result.median_final_value, true)}
          </div>
          <div
            style={{
              color: "#6B5628",
              fontSize: "0.6rem",
              fontFamily: "monospace",
              marginTop: "0.2rem",
              letterSpacing: "0.04em",
            }}
          >
            {formatCurrency(p10Final, true)}&thinsp;—&thinsp;{formatCurrency(p90Final, true)}
          </div>
        </div>
      </div>

      {/* ─── Chart ──────────────────────────────────────────────────────── */}
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
          <defs>
            {/* Outer bands: p10–p25, p75–p90 */}
            <linearGradient id="sc-grad-outer" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#C8A254" stopOpacity={0.11} />
              <stop offset="100%" stopColor="#C8A254" stopOpacity={0.02} />
            </linearGradient>
            {/* Inner bands: p25–p50, p50–p75 */}
            <linearGradient id="sc-grad-inner" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#C8A254" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#C8A254" stopOpacity={0.06} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="1 10"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />

          <XAxis
            dataKey="year"
            tick={{ fill: "#4A4742", fontSize: 10, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={{ stroke: "#26262D", strokeWidth: 1 }}
            interval="preserveStartEnd"
            dy={6}
          />

          <YAxis
            tickFormatter={(v: number) => formatCurrency(v, true)}
            tick={{ fill: "#4A4742", fontSize: 10, fontFamily: "monospace" }}
            tickLine={false}
            axisLine={false}
            width={62}
            domain={[0, yMax]}
          />

          <Tooltip
            content={<FanTooltip />}
            cursor={{
              stroke: "rgba(200,162,84,0.18)",
              strokeWidth: 1,
              strokeDasharray: "3 6",
            }}
          />

          {/* Retirement year vertical marker */}
          <ReferenceLine
            x={retirementYear}
            stroke="rgba(200,162,84,0.20)"
            strokeDasharray="3 6"
            strokeWidth={1}
            label={{
              value: "RETIRE",
              position: "insideTopRight",
              fill: "#6B5628",
              fontSize: 8,
              fontFamily: "monospace",
              letterSpacing: 2,
              dy: -4,
            }}
          />

          {/* ── Stacked fan bands (each is a DIFFERENCE between consecutive percentiles) ── */}

          {/* Base: invisible riser from 0 to p10 — pushes all bands up to correct position */}
          <Area
            stackId="fan"
            type="monotone"
            dataKey="bandBase"
            fill="transparent"
            stroke="rgba(200,162,84,0.20)"
            strokeWidth={0.75}
            dot={false}
            animationDuration={1200}
            animationEasing="ease-out"
          />

          {/* p10 → p25: outer lower band */}
          <Area
            stackId="fan"
            type="monotone"
            dataKey="bandInnerBot"
            fill="url(#sc-grad-outer)"
            stroke="none"
            dot={false}
            animationDuration={1200}
            animationEasing="ease-out"
          />

          {/* p25 → p50: inner lower band */}
          <Area
            stackId="fan"
            type="monotone"
            dataKey="bandCenterBot"
            fill="url(#sc-grad-inner)"
            stroke="none"
            dot={false}
            animationDuration={1200}
            animationEasing="ease-out"
          />

          {/* p50 → p75: inner upper band */}
          <Area
            stackId="fan"
            type="monotone"
            dataKey="bandCenterTop"
            fill="url(#sc-grad-inner)"
            stroke="none"
            dot={false}
            animationDuration={1200}
            animationEasing="ease-out"
          />

          {/* p75 → p90: outer upper band */}
          <Area
            stackId="fan"
            type="monotone"
            dataKey="bandOuterTop"
            fill="url(#sc-grad-outer)"
            stroke="rgba(200,162,84,0.20)"
            strokeWidth={0.75}
            dot={false}
            animationDuration={1200}
            animationEasing="ease-out"
          />

          {/* ── Median glow: wide transparent line creates soft halo ── */}
          <Line
            type="monotone"
            dataKey="_p50"
            stroke="#C8A254"
            strokeWidth={9}
            strokeOpacity={0.08}
            dot={false}
            isAnimationActive={false}
            legendType="none"
          />

          {/* ── Median spine: the sharp gold centerline ── */}
          <Line
            type="monotone"
            dataKey="_p50"
            stroke="#C8A254"
            strokeWidth={1.75}
            dot={false}
            animationDuration={1500}
            animationEasing="ease-out"
            legendType="none"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* ─── Legend ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-8 mt-5 pb-1">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center"
            style={{ width: 28, height: 12, position: "relative" }}
          >
            {/* Glow swatch */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(200,162,84,0.18)",
                borderRadius: 1,
                filter: "blur(2px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: 1.5,
                background: "#C8A254",
                transform: "translateY(-50%)",
              }}
            />
          </div>
          <span
            style={{ color: "#7A7670", fontSize: "0.6rem", letterSpacing: "0.1em", fontFamily: "monospace" }}
          >
            MEDIAN
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            style={{
              width: 14,
              height: 10,
              borderRadius: 1,
              background: "rgba(200,162,84,0.16)",
              border: "1px solid rgba(200,162,84,0.22)",
            }}
          />
          <span
            style={{ color: "#7A7670", fontSize: "0.6rem", letterSpacing: "0.1em", fontFamily: "monospace" }}
          >
            25TH–75TH
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            style={{
              width: 14,
              height: 10,
              borderRadius: 1,
              background: "rgba(200,162,84,0.07)",
              border: "1px solid rgba(200,162,84,0.18)",
            }}
          />
          <span
            style={{ color: "#7A7670", fontSize: "0.6rem", letterSpacing: "0.1em", fontFamily: "monospace" }}
          >
            10TH–90TH
          </span>
        </div>
      </div>
    </div>
  );
}
