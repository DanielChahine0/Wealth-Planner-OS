"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import type { SimulationResult } from "@/lib/types";

interface SimulationChartProps {
  result: SimulationResult;
}

export function SimulationChart({ result }: SimulationChartProps) {
  const data = result.years.map((year, i) => ({
    year,
    p10: Math.round(result.percentiles.p10[i]),
    p25: Math.round(result.percentiles.p25[i]),
    p50: Math.round(result.percentiles.p50[i]),
    p75: Math.round(result.percentiles.p75[i]),
    p90: Math.round(result.percentiles.p90[i]),
  }));

  const formatYAxis = (value: number) => formatCurrency(value, true);
  const formatTooltipValue = (value: number) => formatCurrency(value);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Portfolio Projection</h2>
          <p className="text-sm text-gray-500">
            {formatNumber(result.simulation_metadata.n_simulations)} simulations •{" "}
            {result.simulation_metadata.n_years} years
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Median at retirement</div>
          <div className="text-xl font-bold text-blue-600">
            {formatCurrency(result.median_final_value, true)}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="colorP90" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11 }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip
            formatter={(value: number | string | undefined, name: string | undefined) => {
              const labels: Record<string, string> = {
                p90: "90th Pct",
                p75: "75th Pct",
                p50: "Median",
                p25: "25th Pct",
                p10: "10th Pct",
              };
              const num = typeof value === "number" ? value : 0;
              const key = name ?? "";
              return [formatTooltipValue(num), labels[key] ?? key];
            }}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          {/* Fan chart: outer band p10-p90 */}
          <Area type="monotone" dataKey="p90" stroke="#93c5fd" strokeWidth={1.5}
            fill="url(#colorP90)" fillOpacity={1} dot={false} name="p90" />
          <Area type="monotone" dataKey="p75" stroke="#60a5fa" strokeWidth={1}
            fill="#dbeafe" fillOpacity={0.4} dot={false} name="p75" />
          {/* Median line */}
          <Area type="monotone" dataKey="p50" stroke="#2563eb" strokeWidth={2.5}
            fill="#bfdbfe" fillOpacity={0.3} dot={false} name="p50" />
          <Area type="monotone" dataKey="p25" stroke="#60a5fa" strokeWidth={1}
            fill="#fff" fillOpacity={1} dot={false} name="p25" />
          <Area type="monotone" dataKey="p10" stroke="#93c5fd" strokeWidth={1.5}
            fill="#fff" fillOpacity={1} dot={false} name="p10" />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-blue-600 inline-block rounded" />
          Median
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-blue-200 inline-block rounded opacity-60" />
          25th–75th Pct
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-blue-100 inline-block rounded opacity-60" />
          10th–90th Pct
        </span>
      </div>
    </div>
  );
}
