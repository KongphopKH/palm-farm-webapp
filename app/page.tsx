"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock3,
  CloudRain,
  ReceiptText,
  ShoppingBasket,
  Sprout,
  Sun,
  TriangleAlert,
} from "lucide-react";
import QuickActionButton from "@/components/QuickActionButton";
import FinanceSummaryCard from "@/components/FinanceSummaryCard";
import ReminderAlert from "@/components/ReminderAlert";
import Banner from "@/components/Banner";
import FarmLocationPrompt from "@/components/FarmLocationPrompt";
import WeatherOutlook from "@/components/WeatherOutlook";
import RainWindowNotice from "@/components/RainWindowNotice";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getFarmSettings,
  getLastHarvestDate,
  getMonthlySummary,
  getPlots,
  type MonthlySummary,
} from "@/lib/queries";
import { fetchWeatherTip, type WeatherTip } from "@/lib/weather";
import { daysFromToday, getPlantAgeReminders } from "@/lib/format";
import { HARVEST_CYCLE_DAYS } from "@/lib/constants";
import type { FarmSettings, Plot } from "@/types";

export default function DashboardPage() {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [lastHarvestDate, setLastHarvestDate] = useState<string | null>(null);
  const [farmSettings, setFarmSettings] = useState<FarmSettings | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [weather, setWeather] = useState<WeatherTip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const [summaryData, lastHarvest, plotsData] = await Promise.all([
          getMonthlySummary(),
          getLastHarvestDate(),
          getPlots(),
        ]);
        if (cancelled) return;
        setSummary(summaryData);
        setLastHarvestDate(lastHarvest);
        setPlots(plotsData);
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

  const monthLabel = new Intl.DateTimeFormat("th-TH", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  let harvestCountdownLabel = "ยังไม่มีข้อมูลรอบตัดล่าสุด";
  if (lastHarvestDate) {
    const daysSinceLastHarvest = -daysFromToday(lastHarvestDate);
    const daysLeft = HARVEST_CYCLE_DAYS - daysSinceLastHarvest;
    harvestCountdownLabel =
      daysLeft > 0 ? `อีกประมาณ ${daysLeft} วัน` : "ถึงกำหนดรอบตัดแล้ว";
  }

  // Age-based reminders (ใกล้เริ่มให้ผลผลิต / ควรวางแผนปลูกทดแทน) — เงียบไปเองถ้า
  // แปลงไหนยังไม่ได้ระบุวันที่ปลูก หรือยังไม่เข้าเงื่อนไขไหนเลย
  const plantAgeReminders = plots.flatMap((plot) =>
    getPlantAgeReminders(plot.name, plot.planted_date)
  );

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 pb-6 pt-5">
      <header>
        <p className="text-sm font-medium text-stone-500">{todayLabel}</p>
        <h1 className="mt-0.5 text-2xl font-extrabold text-stone-800">PalmTrack</h1>
      </header>

      {!isSupabaseConfigured ? (
        <Banner variant="warning">
          ยังไม่ได้เชื่อมต่อ Supabase — ตั้งค่า NEXT_PUBLIC_SUPABASE_URL และ
          NEXT_PUBLIC_SUPABASE_ANON_KEY ในไฟล์ .env.local
        </Banner>
      ) : null}
      {error ? <Banner variant="error">{error}</Banner> : null}

      {/* Most-used actions first, in easy thumb reach — not buried at the
          bottom of the page after everything else. */}
      <section>
        <div className="grid grid-cols-3 gap-3">
          <QuickActionButton
            href="/harvest/new"
            label="ขายปาล์ม"
            icon={<ShoppingBasket className="h-6 w-6" />}
            tintClass="bg-primary/10 text-primary"
          />
          <QuickActionButton
            href="/activities/new"
            label="บันทึกกิจกรรม"
            icon={<ClipboardList className="h-6 w-6" />}
            tintClass="bg-blue-600/10 text-blue-600"
          />
          <QuickActionButton
            href="/expenses/new"
            label="บันทึกรายจ่าย"
            icon={<ReceiptText className="h-6 w-6" />}
            tintClass="bg-red-600/10 text-red-600"
          />
        </div>
      </section>

      <FinanceSummaryCard
        monthLabel={monthLabel}
        income={summary?.income ?? 0}
        expense={summary?.expense ?? 0}
        loading={loading}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-400">
          Smart Reminders
        </h2>

        <ReminderAlert
          variant="info"
          icon={<Clock3 className="h-5 w-5" />}
          title="รอบตัดปาล์มถัดไป"
          description={harvestCountdownLabel}
        />

        {plantAgeReminders.map((reminder) => (
          <ReminderAlert
            key={`${reminder.type}-${reminder.message}`}
            variant={reminder.type === "replant" ? "warning" : "success"}
            icon={
              reminder.type === "replant" ? (
                <TriangleAlert className="h-5 w-5" />
              ) : (
                <Sprout className="h-5 w-5" />
              )
            }
            title={reminder.type === "replant" ? "ควรวางแผนปลูกทดแทน" : "ใกล้ถึงช่วงให้ผลผลิต"}
            description={reminder.message}
          />
        ))}

        {weather ? (
          <ReminderAlert
            variant={weather.isRaining ? "warning" : "success"}
            icon={
              weather.isRaining ? (
                <CloudRain className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )
            }
            title={weather.isRaining ? "ฝนตกวันนี้" : "อากาศวันนี้"}
            description={weather.message}
          />
        ) : null}
        {weather ? <RainWindowNotice windows={weather.rainWindowsToday} /> : null}

        {/* Secondary/occasional info (5-day outlook, farm location setup)
            tucked behind one tap so the page doesn't get cluttered. */}
        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          className="flex items-center gap-1 text-xs font-semibold text-stone-500 active:text-stone-700"
        >
          {detailsOpen ? (
            <>
              ซ่อนรายละเอียด <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              ดูพยากรณ์ล่วงหน้า 5 วัน และตั้งค่าตำแหน่งสวน <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>

        {detailsOpen ? (
          <div className="flex flex-col gap-3">
            {weather ? <WeatherOutlook dailyForecast={weather.dailyForecast} /> : null}
            {isSupabaseConfigured ? (
              <FarmLocationPrompt location={farmSettings} onSaved={handleLocationSaved} />
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
