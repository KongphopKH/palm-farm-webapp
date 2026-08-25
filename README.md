# 🌴 Smart Palm Farm App

เว็บแอปพลิเคชันบริหารจัดการสวนปาล์มน้ำมัน ออกแบบสำหรับใช้งานบนมือถือเป็นหลัก
(mobile-first) ตัวหนังสือใหญ่ ปุ่มใหญ่ กดง่าย เหมาะสำหรับผู้ใหญ่ที่บ้าน
สร้างด้วย Next.js (App Router) + TypeScript + Tailwind CSS + Supabase

โปรเจกต์นี้จัดทำเป็นพอร์ตโฟลิโอฝึกงานสาย IT

## ฟีเจอร์หลัก (MVP)

- **หน้าแรก (Dashboard)** — สรุปยอดการเงินเดือนนี้ (รายรับ / รายจ่าย / กำไรสุทธิ),
  Smart Reminders (นับถอยหลังรอบตัดปาล์มถัดไป + คำแนะนำจากสภาพอากาศแบบเรียลไทม์
  ผ่าน [Open-Meteo](https://open-meteo.com/) ซึ่งไม่ต้องใช้ API key), และปุ่มลัด 3 ปุ่มสำหรับบันทึกข้อมูลด่วน
- **บันทึกการขายปาล์ม** (`/harvest/new`) — เลือกแปลง กรอกน้ำหนัก/ราคาต่อกิโล
  ระบบคำนวณยอดรวมให้ทันที และบันทึกเลขที่ใบเสร็จ
- **บันทึกกิจกรรมในแปลง** (`/activities/new`) — เลือกแปลง ประเภทกิจกรรม
  (ใส่ปุ๋ย, กำจัดวัชพืช ฯลฯ) พร้อมรายละเอียด
- **บันทึกรายจ่าย** (`/expenses/new`) — หมวดหมู่ จำนวนเงิน รายละเอียด วันที่
- **จัดการแปลงเกษตร** (`/plots`) — การ์ดแสดงข้อมูลแต่ละแปลง (จำนวนต้น/พื้นที่)
  พร้อมฟอร์มเพิ่มแปลงใหม่
- **บัญชีฟาร์ม** (`/finance`) — ตารางประวัติรายรับจากการขายปาล์ม และรายจ่าย
  แยกตามหมวดหมู่

## โครงสร้างโปรเจกต์

```
app/
  page.tsx                  # หน้าแรก (Dashboard)
  harvest/new/page.tsx      # ฟอร์มบันทึกการขายปาล์ม
  activities/new/page.tsx   # ฟอร์มบันทึกกิจกรรมในแปลง
  expenses/new/page.tsx     # ฟอร์มบันทึกรายจ่าย
  plots/page.tsx            # จัดการแปลงเกษตร
  finance/page.tsx          # บัญชีฟาร์ม
  layout.tsx, globals.css
components/
  BigActionButton.tsx       # ปุ่มลัดขนาดใหญ่บนหน้าแรก
  StatCard.tsx               # การ์ดสรุปตัวเลข (รายรับ/รายจ่าย/กำไร)
  PlotCard.tsx                # การ์ดข้อมูลแปลงปาล์ม
  BottomNav.tsx               # แถบเมนูล่างสำหรับมือถือ
  PageHeader.tsx               # หัวข้อหน้า + ปุ่มย้อนกลับ
  FormControls.tsx             # Input / Select / Textarea ที่ใช้ร่วมกัน
  SubmitButton.tsx, Banner.tsx
lib/
  supabase.ts                # Supabase client (อ่านค่าจาก env vars)
  queries.ts                  # ฟังก์ชันดึง/บันทึกข้อมูลแต่ละตาราง
  format.ts                    # ฟอร์แมตเงิน/วันที่/ตัวเลข (locale th-TH)
  weather.ts                    # ดึงข้อมูลอากาศเบื้องต้นจาก Open-Meteo
  constants.ts                   # ประเภทกิจกรรม / หมวดหมู่รายจ่าย
types/
  index.ts                        # Plot, Activity, Harvest, Expense
supabase/
  schema.sql                       # SQL สร้างตาราง + RLS policy
```

## เริ่มต้นใช้งาน

### 1) ติดตั้ง dependencies

```bash
npm install
```

### 2) ตั้งค่า Supabase

1. สร้างโปรเจกต์ใหม่ที่ [supabase.com](https://supabase.com)
2. เปิด **SQL Editor** แล้วรันไฟล์ [`supabase/schema.sql`](./supabase/schema.sql)
   ทั้งไฟล์ เพื่อสร้าง 4 ตาราง (`plots`, `activities`, `harvests`, `expenses`)
   พร้อม Row Level Security
3. คัดลอกไฟล์ `.env.local.example` เป็น `.env.local` แล้วกรอกค่า
   `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   จากหน้า Project Settings → API

```bash
cp .env.local.example .env.local
```

> หากยังไม่ได้ตั้งค่า Supabase แอปจะยังรันได้ปกติและแสดงข้อความแจ้งเตือน
> สีเหลืองในแต่ละหน้าแทนการดึงข้อมูลจริง

### 3) รันเซิร์ฟเวอร์สำหรับพัฒนา

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) — แนะนำให้เปิดผ่านมือถือ
หรือย่อขนาดหน้าต่างเบราว์เซอร์ให้แคบเพื่อดูผลลัพธ์แบบ mobile-first

### 4) Build สำหรับ production

```bash
npm run build
npm run start
```

## หมายเหตุด้านเทคนิค

- `total_price` ในตาราง `harvests` เป็น **generated column** ในฐานข้อมูล
  (คำนวณจาก `weight_kg * price_per_kg` โดยอัตโนมัติ) เพื่อการันตีความถูกต้อง
  ของข้อมูลไม่ว่าจะบันทึกจากที่ใด
- RLS policy ปัจจุบันเปิดให้ anon key อ่าน/เขียนได้ทุกแถว เหมาะสำหรับผู้ใช้
  คนเดียว (เจ้าของสวน) หากต้องการรองรับหลายผู้ใช้ในอนาคต ควรเพิ่มคอลัมน์
  `user_id` และปรับ policy ให้ scoped ตามผู้ใช้ที่ล็อกอิน (Supabase Auth)
- คำแนะนำสภาพอากาศบนหน้าแรกดึงจาก Open-Meteo API (ฟรี ไม่ต้องใช้ API key)
  โดย default พิกัดตั้งไว้ที่จังหวัดสุราษฎร์ธานี ปรับได้ผ่าน
  `NEXT_PUBLIC_FARM_LAT` / `NEXT_PUBLIC_FARM_LON`
- ธีมสีใช้โทนสว่าง (light theme) ตัวหนังสือ/ปุ่มขนาดใหญ่ตลอดทั้งแอป
  โดยตั้งใจไม่ตาม dark mode ของระบบ เพื่อความคงที่และอ่านง่ายสำหรับผู้ใหญ่
# palm-farm-webapp
# palm-farm-webapp
# palm-farm-webapp
