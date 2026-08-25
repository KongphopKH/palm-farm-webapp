-- Smart Palm Farm App — Supabase schema
-- Run this whole file in the Supabase SQL editor (Project -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

-- 1) แปลงปาล์ม -------------------------------------------------------------
create table if not exists plots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  crop_type text not null default 'oil_palm',
  amount integer not null default 0,        -- จำนวนต้น
  area_size numeric(10, 2) not null default 0, -- ขนาดพื้นที่ (ไร่)
  created_at timestamptz not null default now()
);

-- 2) บันทึกกิจกรรมดูแลสวน ----------------------------------------------------
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  plot_id uuid not null references plots (id) on delete cascade,
  activity_type text not null,              -- เช่น 'ใส่ปุ๋ย', 'กำจัดวัชพืช'
  description text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- 3) บันทึกการขายปาล์ม / ลานปาล์ม -------------------------------------------
create table if not exists harvests (
  id uuid primary key default gen_random_uuid(),
  plot_id uuid not null references plots (id) on delete cascade,
  weight_kg numeric(10, 2) not null check (weight_kg >= 0),
  price_per_kg numeric(10, 2) not null check (price_per_kg >= 0),
  -- total_price คำนวณอัตโนมัติจาก weight_kg * price_per_kg โดยฐานข้อมูล
  total_price numeric(12, 2) generated always as (weight_kg * price_per_kg) stored,
  receipt_number text,
  sale_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- 4) บันทึกรายจ่าย -----------------------------------------------------------
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,                   -- เช่น 'ค่าปุ๋ย', 'ค่าจ้างคนงาน'
  amount numeric(12, 2) not null check (amount >= 0),
  description text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- Indexes for common queries (dashboard summaries, per-plot history) -------
create index if not exists activities_plot_id_idx on activities (plot_id);
create index if not exists harvests_plot_id_idx on harvests (plot_id);
create index if not exists harvests_sale_date_idx on harvests (sale_date);
create index if not exists expenses_date_idx on expenses (date);

-- Row Level Security ---------------------------------------------------------
-- This is a single-user portfolio app that talks to Supabase with the
-- public anon key, so the simplest working setup is to enable RLS and
-- allow all operations. If you add authentication later, replace these
-- policies with ones scoped to an owner/user_id column.
alter table plots enable row level security;
alter table activities enable row level security;
alter table harvests enable row level security;
alter table expenses enable row level security;

create policy "Allow all for anon" on plots for all using (true) with check (true);
create policy "Allow all for anon" on activities for all using (true) with check (true);
create policy "Allow all for anon" on harvests for all using (true) with check (true);
create policy "Allow all for anon" on expenses for all using (true) with check (true);
