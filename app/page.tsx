"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Clock3, ReceiptText, ShoppingBasket } from "lucide-react";
import BigActionButton from "@/components/BigActionButton";
import StatCard from "@/components/StatCard";
import Banner from "@/components/Banner";
import FarmLocationPrompt from "@/components/FarmLocationPrompt";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getFarmSettings, getLastHarvestDate, getMonthlySummary, type MonthlySummary } from "@/lib/queries";
import { fetchWeatherTip, type WeatherTip } from "@/lib/weather";
import { daysFromToday, formatCurrency } from "@/lib/format";
import { HARVEST_CYCLE_DAYS } from "@/lib/constants";
import type { FarmSettings } from "@/types";

export default function DashboardPage() {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [lastHarvestDate, setLastHarvestDate] = useState<string | null>(null);
  const [farmSettings, setFarmSettings] = useState<FarmSettings | null>(null);
  const [weather, setWeather] = useState<WeatherTip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const [summaryData, lastHarvest] = await Promise.all([
          getMonthlySummary(),
          getLastHarvestDate(),
        ]);
        if (cancelled) return;
        setSummary(summaryData);
        setLastHarvestDate(lastHarvest);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("โหลดข้อมูลสรุปการเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Weather doesn't need Supabase, but if it's configured we first check
    // for a saved farm location so the forecast is pinned to the real farm
    // instead of the build-time default coordinates.
    async function loadWeather() {
      let settings: FarmSettings | null = null;
      if (isSupabaseConfigured) {
        try {
          settings = await getFarmSettings();
          if (!cancelled) setFarmSettings(settings);
        } catch (err) {
          console.error(err);
        }
      }
      const tip = await fetchWeatherTip(settings?.farm_lat, settings?.farm_lon);
      if (!cancelled) setWeather(tip);
    }

    load();
    loadWeather();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLocationSaved(settings: FarmSettings) {
    setFarmSettings(settings);
    const tip = await fetchWeatherTip(settings.farm_lat, settings.farm_lon);
    setWeather(tip);
  }

  const todayLabel = new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  let harvestCountdownLabel = "ยังไม่มีข้อมูลรอบตัดล่าสุด";
  if (lastHarvestDate) {
    const daysSinceLastHarvest = -daysFromToday(lastHarvestDate);
    const daysLeft = HARVEST_CYCLE_DAYS - daysSinceLastHarvest;
    harvestCountdownLabel =
      daysLeft > 0 ? `อีกประมาณ ${daysLeft} วัน` : "ถึงกำหนดรอบตัดแล้ว";
  }

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 pb-6 pt-5">
      <header>
        <p className="text-sm font-medium text-stone-500">{todayLabel}</p>
        <h1 className="mt-0.5 text-2xl font-extrabold text-stone-800">🌴 Smart Palm Farm</h1>
      </header>

      {!isSupabaseConfigured ? (
        <Banner variant="warning">
          ยังไม่ได้เชื่อมต่อ Supabase — ตั้งค่า NEXT_PUBLIC_SUPABASE_URL และ
          NEXT_PUBLIC_SUPABASE_ANON_KEY ในไฟล์ .env.local
        </Banner>
      ) : null}
      {error ? <Banner variant="error">{error}</Banner> : null}

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-400">
          สรุปการเงินเดือนนี้
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="รายรับรวม"
            value={loading ? "…" : formatCurrency(summary?.income ?? 0)}
            tone="positive"
          />
          <StatCard
            label="รายจ่ายรวม"
            value={loading ? "…" : formatCurrency(summary?.expense ?? 0)}
            tone="negative"
          />
          <div className="col-span-2">
            <StatCard
              label="กำไรสุทธิ"
              value={loading ? "…" : formatCurrency(summary?.profit ?? 0)}
              tone={summary && summary.profit < 0 ? "negative" : "positive"}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-400">
          Smart Reminders
        </h2>
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Clock3 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm text-stone-500">รอบตัดปาล์มถัดไป</p>
            <p className="text-lg font-bold text-stone-800">{harvestCountdownLabel}</p>
          </div>
        </div>
        {weather ? (
          <Banner variant={weather.isRaining ? "warning" : "success"}>{weather.message}</Banner>
        ) : null}
        {isSupabaseConfigured ? (
          <FarmLocationPrompt location={farmSettings} onSaved={handleLocationSaved} />
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-400">บันทึกด่วน</h2>
        <div className="flex flex-col gap-3">
          <BigActionButton
            href="/harvest/new"
            label="บันทึกการขายปาล์ม"
            icon={<ShoppingBasket className="h-6 w-6" />}
            colorClass="bg-green-600 active:bg-green-700"
          />
          <BigActionButton
            href="/activities/new"
            label="บันทึกกิจกรรมในแปลง"
            icon={<ClipboardList className="h-6 w-6" />}
            colorClass="bg-blue-600 active:bg-blue-700"
          />
          <BigActionButton
            href="/expenses/new"
            label="บันทึกรายจ่าย"
            icon={<ReceiptText className="h-6 w-6" />}
            colorClass="bg-red-600 active:bg-red-700"
          />
        </div>
      </section>
    </div>
  );
}
