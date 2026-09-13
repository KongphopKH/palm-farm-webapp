export const ACTIVITY_TYPES = [
  "ใส่ปุ๋ย",
  "กำจัดวัชพืช",
  "ฉีดยาปราบศัตรูพืช",
  "ตัดแต่งทางใบ",
  "รดน้ำ",
  "ตรวจแปลง",
  "อื่นๆ",
] as const;

export const EXPENSE_CATEGORIES = [
  "ค่าปุ๋ย",
  "ค่าจ้างคนงาน",
  "ค่าน้ำมัน/ค่าขนส่ง",
  "ค่ายาปราบศัตรูพืช",
  "ค่าซ่อมบำรุงอุปกรณ์",
  "อื่นๆ",
] as const;

/** เฉลี่ยรอบตัดปาล์มน้ำมัน (10-15 วัน) ใช้เป็นค่ากลางสำหรับ Smart Reminder */
export const HARVEST_CYCLE_DAYS = 12;

/**
 * Smart Badge icons สำหรับปฏิทินกิจกรรมฟาร์ม — ให้หน้าตาตรงกับที่ผู้ใช้เลือกตอนบันทึกกิจกรรม
 * (เช่น 💧 รดน้ำ, 🟢 ใส่ปุ๋ย) บวกไอคอนแยกสำหรับ "เก็บเกี่ยว/ขายปาล์ม" (🟠) และ "รายจ่าย" (💸)
 * เนื่องจากทั้งสองอย่างนี้เป็นข้อมูลจากคนละตาราง (harvests / expenses) ไม่ใช่ activity_type
 */
export const ACTIVITY_ICONS: Record<string, string> = {
  ใส่ปุ๋ย: "🟢",
  กำจัดวัชพืช: "🌿",
  ฉีดยาปราบศัตรูพืช: "🧪",
  ตัดแต่งทางใบ: "✂️",
  รดน้ำ: "💧",
  ตรวจแปลง: "🔍",
  อื่นๆ: "📌",
};

export const DEFAULT_ACTIVITY_ICON = "📌";
export const HARVEST_ICON = "🟠";
export const EXPENSE_ICON = "💸";

/**
 * ค่าเฉลี่ยวงจรชีวิตปาล์มน้ำมัน ใช้เป็นเกณฑ์แจ้งเตือนใน Smart Reminders — ต้นปาล์ม
 * ทั่วไปเริ่มให้ผลผลิตราวปีที่ 3 และควรเริ่มวางแผนปลูกทดแทนเมื่ออายุราว 20-25 ปี
 * (ผลผลิตเริ่มลดลง) ใช้ 20 เป็นจุดเริ่มแจ้งเตือนเพราะเป็นขอบล่างของช่วงนั้น
 */
export const PALM_FRUITING_AGE_YEARS = 3;
export const PALM_FRUITING_WARNING_MONTHS = 6; // แจ้งเตือนล่วงหน้าก่อนถึงปีที่ 3 กี่เดือน
export const PALM_REPLANT_WARNING_AGE_YEARS = 20; // เริ่ม "ควรวางแผน" ไว้ก่อนช่วงผลผลิตลดจริง (25 ปี)

/**
 * ช่วงการเจริญเติบโตของต้นปาล์มน้ำมันตามอายุ ใช้แสดงเป็น insight บนการ์ดแปลง —
 * เรียงจากอายุน้อยไปมาก แต่ละช่วงมีผลตั้งแต่ minYears จนถึงก่อนช่วงถัดไป
 * ตัวเลข 0/4/8/18/25 มาจากผู้ใช้ ส่วน 3 (เริ่มให้ผลผลิต) และ 18 (เริ่มทรงตัว/ลดลง)
 * เป็นช่วงคั่นกลางที่เติมให้ครอบคลุมทุกอายุแบบไม่มีช่องว่าง — ปรับได้ถ้าไม่ตรงกับพันธุ์จริง
 */
// text/bg/border — Tailwind classes for the colored growth-stage strip on
// each plot card (PlotCard.tsx), going from neutral (not yet productive)
// through green (productive) to amber/red (declining, needs replanting).
export const PALM_GROWTH_STAGES = [
  {
    minYears: 0,
    key: "immature",
    label: "ยังไม่ให้ผลผลิต",
    text: "text-stone-500",
    bg: "bg-stone-100",
    border: "border-stone-300",
  },
  {
    minYears: 3,
    key: "just-bearing",
    label: "เริ่มให้ผลผลิต",
    text: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent",
  },
  {
    minYears: 4,
    key: "increasing-yield",
    label: "กำลังเข้าสู่ช่วงให้ผลผลิตดี",
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/50",
  },
  {
    minYears: 8,
    key: "peak-yield",
    label: "ช่วงผลผลิตสูงสุด",
    text: "text-primary",
    bg: "bg-primary/15",
    border: "border-primary",
  },
  {
    minYears: 18,
    key: "leveling-off",
    label: "ผลผลิตเริ่มทรงตัว",
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-400",
  },
  {
    minYears: 25,
    key: "declining",
    label: "ผลผลิตเริ่มลด ควรพิจารณาปลูกทดแทน",
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-400",
  },
] as const;
