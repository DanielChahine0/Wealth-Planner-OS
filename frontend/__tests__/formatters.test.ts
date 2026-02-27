import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  formatDate,
  getFragilityColor,
  getSuccessRateColor,
  getSeverityColor,
} from "../lib/formatters";

// ---------------------------------------------------------------------------
// formatCurrency
// ---------------------------------------------------------------------------

describe("formatCurrency", () => {
  it("formats millions compactly", () => {
    expect(formatCurrency(1_500_000, true)).toBe("$1.5M");
  });
  it("formats thousands compactly", () => {
    expect(formatCurrency(250_000, true)).toBe("$250K");
  });
  it("formats full currency (non-compact)", () => {
    expect(formatCurrency(1_234)).toContain("1,234");
  });
  it("compact: exactly $1M → $1.0M", () => {
    expect(formatCurrency(1_000_000, true)).toBe("$1.0M");
  });
  it("compact: exactly $1K → $1K", () => {
    expect(formatCurrency(1_000, true)).toBe("$1K");
  });
  it("compact: sub-thousand falls through to full format", () => {
    // Less than $1K in compact mode uses Intl.NumberFormat
    const result = formatCurrency(500, true);
    expect(result).toContain("500");
  });
  it("non-compact: large number includes currency symbol", () => {
    const result = formatCurrency(1_000_000);
    expect(result).toContain("$");
  });
  it("non-compact: zero formats correctly", () => {
    const result = formatCurrency(0);
    expect(result).toContain("$");
  });
});

// ---------------------------------------------------------------------------
// formatPercent
// ---------------------------------------------------------------------------

describe("formatPercent", () => {
  it("formats percent with 1 decimal by default", () => {
    expect(formatPercent(0.856)).toBe("85.6%");
  });
  it("formats 0 as 0.0%", () => {
    expect(formatPercent(0)).toBe("0.0%");
  });
  it("formats 1.0 as 100.0%", () => {
    expect(formatPercent(1.0)).toBe("100.0%");
  });
  it("respects decimals parameter", () => {
    expect(formatPercent(0.1234, 2)).toBe("12.34%");
  });
  it("formats 0 decimals rounds to integer", () => {
    expect(formatPercent(0.5, 0)).toBe("50%");
  });
});

// ---------------------------------------------------------------------------
// formatNumber
// ---------------------------------------------------------------------------

describe("formatNumber", () => {
  it("formats integer with commas", () => {
    expect(formatNumber(1_234_567)).toBe("1,234,567");
  });
  it("rounds decimals to nearest integer", () => {
    expect(formatNumber(1_234.6)).toBe("1,235");
  });
  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });
  it("formats small number without commas", () => {
    expect(formatNumber(999)).toBe("999");
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------

describe("formatDate", () => {
  it("formats year as string", () => {
    expect(formatDate(2040)).toBe("2040");
  });
  it("formats current-ish year", () => {
    expect(formatDate(2026)).toBe("2026");
  });
});

// ---------------------------------------------------------------------------
// getFragilityColor
// ---------------------------------------------------------------------------

describe("getFragilityColor", () => {
  it("returns green for score < 25 (Low)", () => {
    expect(getFragilityColor(20).color).toBe("#22c55e");
    expect(getFragilityColor(20).label).toBe("Low");
  });
  it("returns yellow for score 25–49 (Moderate)", () => {
    expect(getFragilityColor(35).color).toBe("#eab308");
    expect(getFragilityColor(35).label).toBe("Moderate");
  });
  it("returns orange for score 50–74 (Elevated)", () => {
    expect(getFragilityColor(60).color).toBe("#f97316");
    expect(getFragilityColor(60).label).toBe("Elevated");
  });
  it("returns red for score >= 75 (High)", () => {
    expect(getFragilityColor(80).color).toBe("#ef4444");
    expect(getFragilityColor(80).label).toBe("High");
  });
  it("boundary: score = 0 is Low", () => {
    expect(getFragilityColor(0).label).toBe("Low");
  });
  it("boundary: score = 25 is Moderate", () => {
    expect(getFragilityColor(25).label).toBe("Moderate");
  });
  it("boundary: score = 50 is Elevated", () => {
    expect(getFragilityColor(50).label).toBe("Elevated");
  });
  it("boundary: score = 75 is High", () => {
    expect(getFragilityColor(75).label).toBe("High");
  });
  it("boundary: score = 100 is High", () => {
    expect(getFragilityColor(100).label).toBe("High");
  });
});

// ---------------------------------------------------------------------------
// getSuccessRateColor
// ---------------------------------------------------------------------------

describe("getSuccessRateColor", () => {
  it("returns green for rate >= 0.85 (On track)", () => {
    expect(getSuccessRateColor(0.9).color).toBe("#22c55e");
    expect(getSuccessRateColor(0.9).label).toBe("On track");
  });
  it("returns yellow for rate 0.65–0.84 (Some risk)", () => {
    expect(getSuccessRateColor(0.75).color).toBe("#eab308");
    expect(getSuccessRateColor(0.75).label).toBe("Some risk");
  });
  it("returns orange for rate 0.45–0.64 (High risk)", () => {
    expect(getSuccessRateColor(0.55).color).toBe("#f97316");
    expect(getSuccessRateColor(0.55).label).toBe("High risk");
  });
  it("returns red for rate < 0.45 (Critical)", () => {
    expect(getSuccessRateColor(0.3).color).toBe("#ef4444");
    expect(getSuccessRateColor(0.3).label).toBe("Critical");
  });
  it("boundary: exactly 0.85 is On track", () => {
    expect(getSuccessRateColor(0.85).label).toBe("On track");
  });
  it("boundary: exactly 0.65 is Some risk", () => {
    expect(getSuccessRateColor(0.65).label).toBe("Some risk");
  });
  it("boundary: exactly 0.45 is High risk", () => {
    expect(getSuccessRateColor(0.45).label).toBe("High risk");
  });
  it("boundary: 0.0 is Critical", () => {
    expect(getSuccessRateColor(0.0).label).toBe("Critical");
  });
  it("boundary: 1.0 is On track", () => {
    expect(getSuccessRateColor(1.0).label).toBe("On track");
  });
});

// ---------------------------------------------------------------------------
// getSeverityColor
// ---------------------------------------------------------------------------

describe("getSeverityColor", () => {
  it('returns green classes for "ok"', () => {
    const result = getSeverityColor("ok");
    expect(result).toContain("green");
  });
  it('returns yellow classes for "warning"', () => {
    const result = getSeverityColor("warning");
    expect(result).toContain("yellow");
  });
  it('returns red classes for "critical"', () => {
    const result = getSeverityColor("critical");
    expect(result).toContain("red");
  });
  it("returns gray classes for unknown severity", () => {
    const result = getSeverityColor("unknown");
    expect(result).toContain("gray");
  });
  it("returns a non-empty string for all known values", () => {
    for (const s of ["ok", "warning", "critical"]) {
      expect(getSeverityColor(s).length).toBeGreaterThan(0);
    }
  });
});
