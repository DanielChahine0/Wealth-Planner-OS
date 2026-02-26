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

export function getFragilityColor(score: number): { color: string; label: string } {
  if (score < 25) return { color: "#22c55e", label: "Low" };
  if (score < 50) return { color: "#eab308", label: "Moderate" };
  if (score < 75) return { color: "#f97316", label: "Elevated" };
  return { color: "#ef4444", label: "High" };
}

export function getSuccessRateColor(rate: number): { color: string; label: string } {
  if (rate >= 0.85) return { color: "#22c55e", label: "On track" };
  if (rate >= 0.65) return { color: "#eab308", label: "Some risk" };
  if (rate >= 0.45) return { color: "#f97316", label: "High risk" };
  return { color: "#ef4444", label: "Critical" };
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "ok": return "bg-green-100 text-green-800 border-green-200";
    case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "critical": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
