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
