import { describe, it, expect } from "vitest";
import { formatCurrency, formatPercent, getFragilityColor } from "../lib/formatters";

describe("formatCurrency", () => {
  it("formats millions compactly", () => {
    expect(formatCurrency(1500000, true)).toBe("$1.5M");
  });
  it("formats thousands compactly", () => {
    expect(formatCurrency(250000, true)).toBe("$250K");
  });
  it("formats full currency", () => {
    expect(formatCurrency(1234)).toContain("1,234");
  });
});

describe("formatPercent", () => {
  it("formats percent correctly", () => {
    expect(formatPercent(0.856, 0)).toBe("85.6%");
  });
});

describe("getFragilityColor", () => {
  it("returns green for low score", () => {
    expect(getFragilityColor(20)).toBe("#22c55e");
  });
  it("returns yellow for moderate score", () => {
    expect(getFragilityColor(35)).toBe("#eab308");
  });
  it("returns orange for elevated score", () => {
    expect(getFragilityColor(60)).toBe("#f97316");
  });
  it("returns red for high score", () => {
    expect(getFragilityColor(80)).toBe("#ef4444");
  });
});
