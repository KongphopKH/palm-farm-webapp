export type CropType = "oil_palm";

export interface Plot {
  id: string;
  name: string;
  crop_type: CropType;
  amount: number; // จำนวนต้น
  area_size: number; // ขนาดพื้นที่ (ไร่)
  created_at?: string;
}

export type ActivityType =
  | "ใส่ปุ๋ย"
  | "กำจัดวัชพืช"
  | "ฉีดยาปราบศัตรูพืช"
  | "ตัดแต่งทางใบ"
  | "รดน้ำ"
  | "ตรวจแปลง"
  | "อื่นๆ";

export interface Activity {
  id: string;
  plot_id: string;
  activity_type: ActivityType | string;
  description: string | null;
  date: string; // ISO date (YYYY-MM-DD)
  created_at?: string;
}

export interface Harvest {
  id: string;
  plot_id: string;
  weight_kg: number;
  price_per_kg: number;
  total_price: number; // คำนวณอัตโนมัติใน DB (generated column)
  receipt_number: string | null;
  sale_date: string; // ISO date (YYYY-MM-DD)
  created_at?: string;
}

export type ExpenseCategory =
  | "ค่าปุ๋ย"
  | "ค่าจ้างคนงาน"
  | "ค่าน้ำมัน/ค่าขนส่ง"
  | "ค่ายาปราบศัตรูพืช"
  | "ค่าซ่อมบำรุงอุปกรณ์"
  | "อื่นๆ";

export interface Expense {
  id: string;
  category: ExpenseCategory | string;
  amount: number;
  description: string | null;
  date: string; // ISO date (YYYY-MM-DD)
  created_at?: string;
}
