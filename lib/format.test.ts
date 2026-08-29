import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  daysFromToday,
  formatCurrency,
  formatDateThai,
  formatDayLabelThai,
  formatMonthYearThai,
  formatNumber,
  getMonthMatrix,
  monthRangeISO,
} from "./format";

describe("formatCurrency", () => {
  it("formats a positive amount as Thai baht", () => {
    expect(formatCurrency(1234.5)).toBe("฿1,234.50");
  });

  it("treats null/undefined as zero", () => {
    expect(formatCurrency(null)).toBe("฿0.00");
    expect(formatCurrency(undefined)).toBe("฿0.00");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-500)).toBe("-฿500.00");
  });
});

describe("formatNumber", () => {
  it("formats with thousands separators", () => {
    expect(formatNumber(12345)).toBe("12,345");
  });

  it("respects fractionDigits", () => {
    expect(formatNumber(12.345, 2)).toBe("12.35");
  });

  it("treats null/undefined as zero", () => {
    expect(formatNumber(null)).toBe("0");
    expect(formatNumber(undefined)).toBe("0");
  });
});

describe("formatDateThai", () => {
  it("formats an ISO date in Thai with the Buddhist year", () => {
    expect(formatDateThai("2026-08-29")).toBe("29 ส.ค. 2569");
  });
});

describe("formatMonthYearThai", () => {
  it("formats a (year, 0-indexed month) pair", () => {
    expect(formatMonthYearThai(2026, 7)).toBe("สิงหาคม 2569"); // month 7 = August
  });
});

describe("formatDayLabelThai", () => {
  it("formats weekday + day + month", () => {
    expect(formatDayLabelThai("2026-08-30")).toBe("อาทิตย์ 30 ส.ค.");
  });
});

describe("daysFromToday", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 25)); // "today" = August 25, 2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 for today", () => {
    expect(daysFromToday("2026-08-25")).toBe(0);
  });

  it("returns a positive count for a future date", () => {
    expect(daysFromToday("2026-08-30")).toBe(5);
  });

  it("returns a negative count for a past date", () => {
    expect(daysFromToday("2026-08-20")).toBe(-5);
  });
});

describe("monthRangeISO", () => {
  it("handles a leap-year February", () => {
    expect(monthRangeISO(2024, 1)).toEqual({ from: "2024-02-01", to: "2024-02-29" });
  });

  it("handles a non-leap-year February", () => {
    expect(monthRangeISO(2026, 1)).toEqual({ from: "2026-02-01", to: "2026-02-28" });
  });

  it("handles December without rolling into next year", () => {
    expect(monthRangeISO(2026, 11)).toEqual({ from: "2026-12-01", to: "2026-12-31" });
  });
});

describe("getMonthMatrix", () => {
  it("pads the first week with nulls up to the starting weekday", () => {
    // August 1, 2026 is a Saturday (weekday 6).
    const weeks = getMonthMatrix(2026, 7);
    expect(weeks[0]).toEqual([null, null, null, null, null, null, "2026-08-01"]);
  });

  it("contains exactly one cell per day of the month, in order", () => {
    const weeks = getMonthMatrix(2026, 7);
    const days = weeks.flat().filter((d): d is string => d !== null);
    expect(days).toHaveLength(31);
    expect(days[0]).toBe("2026-08-01");
    expect(days[days.length - 1]).toBe("2026-08-31");
  });

  it("needs no padding when the month starts on Sunday with exactly 4 weeks", () => {
    // February 1, 2026 is a Sunday (weekday 0); 28 days = exactly 4 full weeks.
    const weeks = getMonthMatrix(2026, 1);
    expect(weeks).toHaveLength(4);
    expect(weeks.flat().every((d) => d !== null)).toBe(true);
  });

  it("every week row has exactly 7 cells", () => {
    const weeks = getMonthMatrix(2026, 11); // December 2026 starts on a Tuesday
    for (const week of weeks) {
      expect(week).toHaveLength(7);
    }
  });
});
