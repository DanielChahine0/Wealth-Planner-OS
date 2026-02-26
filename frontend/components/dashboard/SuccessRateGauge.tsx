"use client";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { formatPercent, getSuccessRateColor } from "@/lib/formatters";

interface SuccessRateGaugeProps {
  successRate: number;
}

export function SuccessRateGauge({ successRate }: SuccessRateGaugeProps) {
  const { color, label } = getSuccessRateColor(successRate);
  const data = [{ value: successRate * 100, fill: color }];

  return (
    <div
      className="flex flex-col items-center py-2"
      role="img"
      aria-label={`Success rate: ${formatPercent(successRate, 0)}`}
    >
      <h3 className="text-xs text-dust tracking-widest uppercase mb-4 font-mono flex items-center gap-2">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Success Rate
      </h3>
      <div className="relative w-36 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="72%"
            outerRadius="100%"
            barSize={10}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              background={{ fill: "#26262D" }}
              dataKey="value"
              cornerRadius={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl tabular-nums" style={{ color }}>
            {formatPercent(successRate, 0)}
          </span>
          <span className="text-xs text-dust mt-0.5 tracking-wide">success</span>
        </div>
      </div>
      <div className="text-center mt-3">
        <p className="text-xs font-mono tracking-widest uppercase" style={{ color }}>
          {label}
        </p>
        <p className="text-xs text-mist mt-1.5 max-w-[180px] leading-relaxed">
          {successRate >= 0.85
            ? "Your plan is well-positioned for a comfortable retirement"
            : successRate >= 0.65
            ? "Moderate risk of shortfall — consider adjustments"
            : "High risk of shortfall — action recommended"}
        </p>
      </div>
    </div>
  );
}
