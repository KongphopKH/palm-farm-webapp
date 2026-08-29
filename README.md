# 🌴 Smart Palm Farm App

เว็บแอปบริหารจัดการสวนปาล์มน้ำมัน ออกแบบ **mobile-first** สำหรับใช้งานจริงหน้าสวน
ตัวหนังสือใหญ่ ปุ่มใหญ่ กดง่าย เหมาะกับผู้ใหญ่ที่ไม่คุ้นเทคโนโลยี

ทำตั้งแต่ frontend, backend(Supabase),
CI/CD (GitHub Actions), ไปจนถึง automated testing (Vitest)

**🔗 Live demo:** [https://kongphopkh.github.io/palm-farm-webapp/]
<!-- TODO: แก้ลิงก์ด้านบนเป็น URL จริงหลัง deploy (รูปแบบ https://<username>.github.io/palm-farm-webapp/) -->

## สกรีนช็อต

<!--
  TODO: ถ่ายภาพหน้าจอจากเว็บที่ deploy จริง (มีข้อมูลตัวอย่างในนั้นแล้วจะดูดีที่สุด)
  แล้วนำไฟล์ไปวางในโฟลเดอร์ docs/screenshots/ ตามชื่อด้านล่างนี้ — พอวางไฟล์ครบ
  รูปจะขึ้นในหน้า README บน GitHub เองอัตโนมัติ ไม่ต้องแก้อะไรเพิ่ม
-->
<img width="430" height="906" alt="image" src="https://github.com/user-attachments/assets/60cb3f15-31c9-4049-9d1f-5bac342e0c50" />

## ฟีเจอร์หลัก

- **หน้าแรก (Dashboard)** — บันทึกด่วน 3 ปุ่มอยู่บนสุด, สรุปยอดการเงินเดือนนี้
  (รายรับ/รายจ่าย/กำไรสุทธิ), Smart Reminders (นับถอยหลังรอบตัดปาล์มถัดไป +
  สภาพอากาศปัจจุบัน + แจ้งเตือนช่วงเวลาฝนตกวันนี้แบบเด่นชัดตลอดเวลา) ส่วนพยากรณ์
  ล่วงหน้า 5 วันและการตั้งค่าตำแหน่งสวนพับซ่อนไว้หลังปุ่ม toggle เพื่อไม่ให้หน้าจอรก
- **ปฏิทินกิจกรรมฟาร์ม** (`/calendar`) — ปฏิทินรายเดือนพร้อม Smart Badge ไอคอนต่อวัน
  แยกตามประเภท (รดน้ำ 💧, ใส่ปุ๋ย 🟢, เก็บเกี่ยว 🟠, รายจ่าย 💸 ฯลฯ) แตะวันที่เพื่อดู
  รายละเอียดและแก้ไข/ลบได้ทันที
- **บันทึกการขายปาล์ม** (`/harvest/new`) — เลือกแปลง กรอกน้ำหนัก/ราคาต่อกิโล
  ระบบคำนวณยอดรวมให้ทันทีจากฐานข้อมูล (generated column) พร้อมบันทึกเลขที่ใบเสร็จ
- **บันทึกกิจกรรมในแปลง** (`/activities/new`) และ **บันทึกรายจ่าย** (`/expenses/new`)
  — ฟอร์มบันทึกพร้อมประวัติล่าสุดในหน้าเดียวกัน แก้ไข/ลบรายการได้ทุกรายการ
- **จัดการแปลงเกษตร** (`/plots`) — เพิ่ม/แก้ไข/ลบแปลง พร้อมจำนวนต้นและขนาดพื้นที่
- **บัญชีฟาร์ม** (`/finance`) — แยกแท็บรายรับ/รายจ่าย, **กราฟแนวโน้มรายรับ-รายจ่าย
  ย้อนหลัง 6 เดือน** (วาดเองด้วย SVG ไม่พึ่ง library, แตะแท่ง/เดือนดูตัวเลข, มีตาราง
  fallback), และ **ปุ่มส่งออกข้อมูลเป็น CSV** แยกไฟล์ตามแท็บที่เปิดอยู่
- **พยากรณ์อากาศ** — ดึงจาก [Open-Meteo](https://open-meteo.com/) (ฟรี ไม่ต้องใช้
  API key): สภาพอากาศปัจจุบัน, ช่วงเวลาที่คาดว่าฝนจะตกวันนี้ (จับกลุ่มชั่วโมงที่โอกาสฝน
  ≥ 50%), และพยากรณ์ล่วงหน้า 5 วัน
- **ตั้งค่าตำแหน่งสวนสำหรับพยากรณ์อากาศ** — ตั้งได้ 2 ทาง: ปุ่ม "ใช้ตำแหน่งปัจจุบัน"
  (GPS, ใช้ตอนอยู่ที่สวนจริง) หรือแตะเลือกตำแหน่งจากแผนที่แบบโต้ตอบได้
  ([Leaflet](https://leafletjs.com/) + OpenStreetMap tiles, ใช้ได้จากที่ไหนก็ได้
  เผื่ออยากดูพยากรณ์ตอนอยู่นอกสวน) บันทึกลง Supabase ซิงก์ทุกอุปกรณ์

## เทคโนโลยีที่ใช้

| ส่วน | เทคโนโลยี |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, static export) |
| ภาษา | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend / Database | [Supabase](https://supabase.com/) (Postgres + client-side SDK) |
| แผนที่ | Leaflet + OpenStreetMap |
| พยากรณ์อากาศ | Open-Meteo API |
| ไอคอน | lucide-react |
| Testing | Vitest |
| Deploy / CI | GitHub Actions → GitHub Pages |

## จุดที่น่าสนใจทางเทคนิค

โปรเจกต์นี้เจอปัญหาจริงระหว่างพัฒนาหลายอย่างที่ต้องแก้ด้วยความเข้าใจ ไม่ใช่แค่ลองผิด
ลองถูก:

- **บั๊ก env var ว่างจาก GitHub Actions** — ตอน deploy จริง พยากรณ์อากาศใช้งานไม่ได้
  ทั้งที่ตั้งค่าถูกทุกอย่าง ต้นเหตุคือ GitHub Actions แทนค่า secret/variable ที่ไม่ได้
  ตั้งด้วย **string ว่าง** ไม่ใช่ `undefined` ซึ่ง `??` (nullish coalescing) จับไม่ได้
  ต้องใช้ `||` แทน เจอบั๊กแบบนี้ซ้ำ 2 จุด จึงเขียน [regression test](lib/weather.test.ts)
  คุ้มครองไว้โดยเฉพาะ ไม่ให้เกิดซ้ำอีก
- **การเลือกสีกราฟให้คนตาบอดสีอ่านออก** — กราฟแนวโน้มการเงินตั้งใจไม่ใช้คู่สีเขียว/แดง
  แบบที่แอปใช้ที่อื่น เพราะตรวจสอบด้วยโมเดล OKLab แล้วพบว่าคู่สีนี้แยกไม่ออกสำหรับคนตาบอดสี
  บางประเภท จึงเปลี่ยนเป็นคู่ฟ้า/ส้มที่ผ่านเกณฑ์ accessibility แทน และคุมไม่ให้ต้องพึ่งสี
  อย่างเดียวด้วย legend, ป้ายกำกับ, และตาราง fallback เสมอ
- **Static export ล้วน ไม่มี server runtime** — ทุกหน้าเป็น client component ที่คุย
  กับ Supabase ตรงจากเบราว์เซอร์ ทำให้ deploy ฟรีบน GitHub Pages ได้ (ดูเหตุผลเต็มใน
  [`next.config.ts`](next.config.ts))
- **Leaflet กับ static export** — โหลด Leaflet แบบ dynamic import ภายใน `useEffect`
  เท่านั้น (ไม่ import ตรงบนสุดของไฟล์) เพื่อไม่ให้ชนกับขั้นตอน prerender ตอน build ที่
  ไม่มี `window`/DOM จริง และใช้ `L.circleMarker` แทน `L.marker` เพื่อเลี่ยงบั๊กไอคอนหมุด
  default ที่มักพังใต้ bundler สมัยใหม่
- **CI รัน automated tests ก่อน build ทุกครั้ง** — [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
  รัน `npm test` ก่อนขั้นตอน build เสมอ ถ้าเทสต์พังจะไม่ deploy โค้ดที่มีบั๊กขึ้นเว็บจริง

## โครงสร้างโปรเจกต์

```
app/
  page.tsx                     # หน้าแรก (Dashboard)
  calendar/page.tsx            # ปฏิทินกิจกรรมฟาร์ม
  harvest/new/page.tsx         # ฟอร์มบันทึกการขายปาล์ม
  activities/new/page.tsx      # ฟอร์มบันทึกกิจกรรมในแปลง
  expenses/new/page.tsx        # ฟอร์มบันทึกรายจ่าย
  plots/page.tsx               # จัดการแปลงเกษตร
  finance/page.tsx             # บัญชีฟาร์ม + กราฟแนวโน้ม + export CSV
  layout.tsx, globals.css
components/
  QuickActionButton.tsx        # ปุ่มลัดขนาดกะทัดรัดบนหน้าแรก
  FinanceTrendChart.tsx        # กราฟแท่งคู่ SVG รายรับ-รายจ่าย (วาดเอง)
  WeatherOutlook.tsx           # การ์ดพยากรณ์ล่วงหน้า 5 วัน
  RainWindowNotice.tsx         # แจ้งเตือนช่วงเวลาฝนตกวันนี้
  FarmLocationPrompt.tsx       # ตั้งค่าตำแหน่งสวน (GPS)
  FarmLocationMapPicker.tsx    # ตั้งค่าตำแหน่งสวนจากแผนที่ (Leaflet)
  StatCard.tsx, PlotCard.tsx, BottomNav.tsx, PageHeader.tsx
  FormControls.tsx, SubmitButton.tsx, Banner.tsx
  HarvestRow.tsx, ExpenseRow.tsx, ActivityRow.tsx
lib/
  supabase.ts                  # Supabase client (อ่านค่าจาก env vars)
  queries.ts                   # ฟังก์ชันดึง/บันทึกข้อมูลทุกตาราง
  weather.ts                   # ดึง + แปลงข้อมูลพยากรณ์จาก Open-Meteo
  format.ts                    # ฟอร์แมตเงิน/วันที่/ปฏิทิน (locale th-TH)
  csv.ts                       # แปลงข้อมูลเป็น CSV + ดาวน์โหลด
  constants.ts                 # ประเภทกิจกรรม / หมวดหมู่รายจ่าย / ไอคอน
  *.test.ts                    # Vitest test suites
types/
  index.ts                     # Plot, Activity, Harvest, Expense, FarmSettings
supabase/
  schema.sql                   # SQL สร้างตาราง + RLS policy ทั้งหมด
```

## เริ่มต้นใช้งาน

### 1) ติดตั้ง dependencies

```bash
npm install
```

### 2) ตั้งค่า Supabase

1. สร้างโปรเจกต์ใหม่ที่ [supabase.com](https://supabase.com)
2. เปิด **SQL Editor** แล้วรันไฟล์ [`supabase/schema.sql`](./supabase/schema.sql)
   ทั้งไฟล์ เพื่อสร้าง 5 ตาราง (`plots`, `activities`, `harvests`, `expenses`,
   `farm_settings`) พร้อม Row Level Security
3. คัดลอกไฟล์ `.env.local.example` เป็น `.env.local` แล้วกรอกค่าจากหน้า
   Project Settings → API

```bash
cp .env.local.example .env.local
```

> หากยังไม่ได้ตั้งค่า Supabase แอปจะยังรันได้ปกติและแสดงข้อความแจ้งเตือนสีเหลือง
> ในแต่ละหน้าแทนการดึงข้อมูลจริง

### 3) รันเซิร์ฟเวอร์สำหรับพัฒนา

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) — แนะนำให้เปิดผ่านมือถือหรือ
ย่อขนาดหน้าต่างเบราว์เซอร์ให้แคบเพื่อดูผลลัพธ์แบบ mobile-first

### 4) รันเทสต์

```bash
npm test        # รันครั้งเดียว
npm run test:watch   # โหมด watch ระหว่างพัฒนา
```

### 5) Build สำหรับ production

```bash
npm run build
npm run start
```

## Deploy บน GitHub Pages

โปรเจกต์นี้ตั้งค่า deploy อัตโนมัติผ่าน GitHub Actions ไว้แล้ว
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) — ทุกครั้งที่ push
เข้า branch `main` เวิร์กโฟลว์จะ **รันเทสต์ → build เป็น static site → deploy ขึ้น
GitHub Pages** ให้อัตโนมัติ

การตั้งค่าที่ต้องทำครั้งเดียวในฝั่ง GitHub:

1. Settings → Pages → Source เลือก **GitHub Actions**
2. Settings → Secrets and variables → Actions → เพิ่ม repository secrets:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. (ไม่บังคับ) เพิ่ม repository variables: `NEXT_PUBLIC_FARM_LAT`,
   `NEXT_PUBLIC_FARM_LON` — ถ้าไม่ตั้ง ผู้ใช้ยังตั้งตำแหน่งสวนเองในแอปได้ผ่าน GPS
   หรือแผนที่อยู่ดี ค่านี้ใช้แค่เป็นตำแหน่งเริ่มต้นก่อนตั้งค่า

## หมายเหตุด้านเทคนิคอื่นๆ

- `total_price` ในตาราง `harvests` เป็น **generated column** ในฐานข้อมูล
  (คำนวณจาก `weight_kg * price_per_kg` โดยอัตโนมัติ) เพื่อการันตีความถูกต้องของข้อมูล
  ไม่ว่าจะบันทึกจากที่ใด
- RLS policy ปัจจุบันเปิดให้ anon key อ่าน/เขียนได้ทุกแถว เหมาะสำหรับผู้ใช้คนเดียว
  (เจ้าของสวน) — โปรเจกต์นี้ตั้งใจไม่มีระบบล็อกอิน หากต้องการรองรับหลายผู้ใช้ในอนาคต
  ควรเพิ่มคอลัมน์ `user_id` และปรับ policy ให้ scoped ตามผู้ใช้ที่ล็อกอิน (Supabase Auth)
- ธีมสีใช้โทนสว่าง (light theme) ตัวหนังสือ/ปุ่มขนาดใหญ่ตลอดทั้งแอป โดยตั้งใจไม่ตาม
  dark mode ของระบบ เพื่อความคงที่และอ่านง่ายสำหรับผู้ใหญ่

## แนวทางต่อยอด (ยังไม่ได้ทำ)

- Yield analytics — วิเคราะห์ผลผลิตต่อไร่/ต่อต้น
- PWA offline caching (มี `manifest.json` แล้ว ยังไม่มี service worker จริง)
