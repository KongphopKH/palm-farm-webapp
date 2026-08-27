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
