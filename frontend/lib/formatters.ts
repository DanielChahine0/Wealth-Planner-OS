export function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    if (Math.abs(amount) >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `$${(amount / 1_000).toFixed(0)}K`;
    }
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

export function formatDate(year: number): string {
  return year.toString();
}

export function getFragilityColor(score: number): string {
  if (score < 25) return "#22c55e";  // green
  if (score < 50) return "#eab308";  // yellow
  if (score < 75) return "#f97316";  // orange
  return "#ef4444";                   // red
}

export function getSuccessRateColor(rate: number): string {
  if (rate >= 0.85) return "#22c55e";
  if (rate >= 0.65) return "#eab308";
  if (rate >= 0.45) return "#f97316";
  return "#ef4444";
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "ok": return "bg-green-100 text-green-800 border-green-200";
    case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "critical": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
