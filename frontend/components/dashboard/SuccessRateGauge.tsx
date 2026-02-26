"use client";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { formatPercent, getSuccessRateColor } from "@/lib/formatters";

interface SuccessRateGaugeProps {
  successRate: number;
}

export function SuccessRateGauge({ successRate }: SuccessRateGaugeProps) {
  const color = getSuccessRateColor(successRate);
  const data = [{ value: successRate * 100, fill: color }];

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Success Rate</h3>
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={10}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar background dataKey="value" cornerRadius={5} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {formatPercent(successRate, 0)}
          </span>
          <span className="text-xs text-gray-400">success</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center mt-2 max-w-[140px]">
        {successRate >= 0.85
          ? "On track for a comfortable retirement"
          : successRate >= 0.65
          ? "Moderate risk of shortfall"
          : "High risk — action recommended"}
      </p>
    </div>
  );
}
