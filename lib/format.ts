export function formatCurrency(value: number | null | undefined): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export function formatNumber(value: number | null | undefined, fractionDigits = 0): string {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: fractionDigits,
  }).format(value ?? 0);
}

export function formatDateThai(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Today's date as an ISO date string (YYYY-MM-DD), for <input type="date">. */
export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** e.g. "จ. 1 ก.ย." — for the 5-day weather outlook's day cards. */
export function formatDayLabelThai(dateString: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(dateString));
}

export function startOfMonthISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

export function endOfMonthISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
}

/** Number of days from today until `dateString` (negative if in the past). */
export function daysFromToday(dateString: string): number {
  const target = new Date(dateString);
  const today = new Date();
  const t = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const n = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((t - n) / 86_400_000);
}

/** Formats a Date using its LOCAL Y/M/D as YYYY-MM-DD (avoids the UTC-shift
 *  off-by-one that `.toISOString()` introduces east of UTC). */
function toLocalISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** First/last ISO date of an arbitrary month (0-indexed, like Date#getMonth). */
export function monthRangeISO(year: number, month: number): { from: string; to: string } {
  return {
    from: toLocalISODate(new Date(year, month, 1)),
    to: toLocalISODate(new Date(year, month + 1, 0)),
  };
}

/** e.g. "สิงหาคม 2569" */
export function formatMonthYearThai(year: number, month: number): string {
  return new Intl.DateTimeFormat("th-TH", { month: "long", year: "numeric" }).format(
    new Date(year, month, 1)
  );
}

/** e.g. "ส.ค. 69" — compact month+year label for the finance trend chart's axis. */
export function formatMonthShortThai(year: number, month: number): string {
  return new Intl.DateTimeFormat("th-TH", { month: "short", year: "2-digit" }).format(
    new Date(year, month, 1)
  );
}

/**
 * 7-column week grid (Sunday-first) for `month` (0-indexed) of `year`, padded
 * with `null` outside the month. Ready to `.map()` into a calendar table.
 */
export function getMonthMatrix(year: number, month: number): (string | null)[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday

  const cells: (string | null)[] = Array.from({ length: startWeekday }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(toLocalISODate(new Date(year, month, d)));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
