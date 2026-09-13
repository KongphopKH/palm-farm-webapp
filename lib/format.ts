import {
  PALM_FRUITING_AGE_YEARS,
  PALM_FRUITING_WARNING_MONTHS,
  PALM_GROWTH_STAGES,
  PALM_REPLANT_WARNING_AGE_YEARS,
} from "./constants";

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

/** Whole years + remainder months between `plantedDate` and today (local dates,
 *  same approach as `daysFromToday` — avoids the UTC-shift off-by-one). */
function plantAgeParts(plantedDate: string): { years: number; months: number } {
  const planted = new Date(plantedDate);
  const today = new Date();
  let years = today.getFullYear() - planted.getFullYear();
  let months = today.getMonth() - planted.getMonth();
  if (today.getDate() < planted.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  // A future planting date has no meaningful "age" yet — clamp to 0 rather
  // than showing a negative age.
  if (years < 0 || (years === 0 && months < 0)) return { years: 0, months: 0 };
  return { years, months };
}

/** Age of the palm trees in a plot, in years (fractional — e.g. 2.5 = 2 ปี 6 เดือน). */
export function getPlantAgeYears(plantedDate: string): number {
  const { years, months } = plantAgeParts(plantedDate);
  return years + months / 12;
}

/** e.g. "4 ปี 3 เดือน" or "8 เดือน" (อายุยังไม่ถึง 1 ปี) — สำหรับแสดงในการ์ดแปลง */
export function formatPlantAge(plantedDate: string): string {
  const { years, months } = plantAgeParts(plantedDate);
  if (years <= 0) return `${months} เดือน`;
  return months > 0 ? `${years} ปี ${months} เดือน` : `${years} ปี`;
}

/** ช่วงการเจริญเติบโตของต้นปาล์ม ณ อายุที่กำหนด — เลือกช่วงล่าสุดใน
 *  PALM_GROWTH_STAGES ที่ minYears <= อายุ (ปี) */
export function getPlantGrowthStage(ageYears: number): {
  key: string;
  label: string;
  text: string;
  bg: string;
  border: string;
} {
  let current: (typeof PALM_GROWTH_STAGES)[number] = PALM_GROWTH_STAGES[0];
  for (const stage of PALM_GROWTH_STAGES) {
    if (ageYears >= stage.minYears) current = stage;
  }
  return current;
}

export interface PlantAgeReminder {
  type: "fruiting-soon" | "replant";
  message: string;
}

/**
 * Smart Reminder ตามอายุต้นปาล์มของแปลง — คืนค่าว่างเปล่าถ้าไม่ได้ระบุวันที่ปลูก
 * หรือยังไม่เข้าเงื่อนไขไหนเลย ดึงเกณฑ์จาก lib/constants.ts:
 * - ใกล้เริ่มให้ผลผลิต: เตือนล่วงหน้า PALM_FRUITING_WARNING_MONTHS เดือน ก่อนถึง
 *   PALM_FRUITING_AGE_YEARS ปี แล้วหยุดเตือน (ถือว่าเข้าสู่รอบเก็บเกี่ยวปกติแล้ว)
 * - ควรวางแผนปลูกทดแทน: เตือนต่อเนื่องตั้งแต่อายุ PALM_REPLANT_WARNING_AGE_YEARS ปีขึ้นไป
 */
export function getPlantAgeReminders(
  plotName: string,
  plantedDate: string | null
): PlantAgeReminder[] {
  if (!plantedDate) return [];

  const ageYears = getPlantAgeYears(plantedDate);
  const reminders: PlantAgeReminder[] = [];

  const monthsUntilFruiting = Math.round((PALM_FRUITING_AGE_YEARS - ageYears) * 12);
  if (monthsUntilFruiting > 0 && monthsUntilFruiting <= PALM_FRUITING_WARNING_MONTHS) {
    reminders.push({
      type: "fruiting-soon",
      message: `ต้นปาล์มแปลง "${plotName}" จะเริ่มให้ผลผลิตในอีกประมาณ ${monthsUntilFruiting} เดือน`,
    });
  }

  if (ageYears >= PALM_REPLANT_WARNING_AGE_YEARS) {
    reminders.push({
      type: "replant",
      message: `ต้นปาล์มแปลง "${plotName}" อายุ ${Math.floor(ageYears)} ปีแล้ว ควรเริ่มวางแผนปลูกทดแทน`,
    });
  }

  return reminders;
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
