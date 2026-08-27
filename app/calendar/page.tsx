"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Banner from "@/components/Banner";
import ActivityRow from "@/components/ActivityRow";
import HarvestRow from "@/components/HarvestRow";
import ExpenseRow from "@/components/ExpenseRow";
import {
  getActivitiesInRange,
  getExpensesInRange,
  getHarvestsInRange,
  getPlots,
} from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  formatCurrency,
  formatDateThai,
  formatMonthYearThai,
  getMonthMatrix,
  monthRangeISO,
  todayISODate,
} from "@/lib/format";
import { ACTIVITY_ICONS, DEFAULT_ACTIVITY_ICON, EXPENSE_ICON, HARVEST_ICON } from "@/lib/constants";
import type { Activity, Expense, Harvest, Plot } from "@/types";

const WEEKDAY_LABELS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

function monthIndex(now: Date): number {
  return now.getFullYear() * 12 + now.getMonth();
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => monthIndex(new Date()));
  const [plots, setPlots] = useState<Plot[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(todayISODate());

  const year = Math.floor(cursor / 12);
  const month = cursor % 12;
  const today = todayISODate();

  async function refreshMonth() {
    try {
      const { from, to } = monthRangeISO(year, month);
      const [a, h, e] = await Promise.all([
        getActivitiesInRange(from, to),
        getHarvestsInRange(from, to),
        getExpensesInRange(from, to),
      ]);
      setActivities(a);
      setHarvests(h);
      setExpenses(e);
    } catch (err) {
      console.error(err);
      setError("โหลดข้อมูลปฏิทินไม่สำเร็จ");
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    getPlots()
      .then((p) => {
        if (!cancelled) setPlots(p);
      })
      .catch((err) => {
        if (!cancelled) console.error(err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    const { from, to } = monthRangeISO(year, month);

    Promise.all([getActivitiesInRange(from, to), getHarvestsInRange(from, to), getExpensesInRange(from, to)])
      .then(([a, h, e]) => {
        if (cancelled) return;
        setActivities(a);
        setHarvests(h);
        setExpenses(e);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          setError("โหลดข้อมูลปฏิทินไม่สำเร็จ");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [year, month]);

  function changeMonth(delta: number) {
    setSelectedDate(null);
    setCursor((c) => c + delta);
  }

  function goToday() {
    setCursor(monthIndex(new Date()));
    setSelectedDate(todayISODate());
  }

  function badgesForDate(date: string): string[] {
    const icons = new Set<string>();
    for (const a of activities) {
      if (a.date === date) icons.add(ACTIVITY_ICONS[a.activity_type] ?? DEFAULT_ACTIVITY_ICON);
    }
    if (harvests.some((h) => h.sale_date === date)) icons.add(HARVEST_ICON);
    if (expenses.some((e) => e.date === date)) icons.add(EXPENSE_ICON);
    return Array.from(icons);
  }

  const weeks = getMonthMatrix(year, month);

  const dayActivities = selectedDate ? activities.filter((a) => a.date === selectedDate) : [];
  const dayHarvests = selectedDate ? harvests.filter((h) => h.sale_date === selectedDate) : [];
  const dayExpenses = selectedDate ? expenses.filter((e) => e.date === selectedDate) : [];
  const dayExpenseTotal = dayExpenses.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
  const dayHasData = dayActivities.length > 0 || dayHarvests.length > 0 || dayExpenses.length > 0;

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="ปฏิทินกิจกรรมฟาร์ม" />
      <div className="flex flex-1 flex-col gap-4 px-4 py-5">
        {!isSupabaseConfigured ? <Banner variant="warning">ยังไม่ได้เชื่อมต่อ Supabase</Banner> : null}
        {error ? <Banner variant="error">{error}</Banner> : null}

        <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-200">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="เดือนก่อนหน้า"
            className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 active:bg-stone-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="text-base font-bold text-stone-800 active:opacity-70"
          >
            {formatMonthYearThai(year, month)}
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="เดือนถัดไป"
            className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 active:bg-stone-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-200">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-stone-400">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="py-1">
                {label}
              </div>
            ))}
          </div>
          <div className="mt-1 flex flex-col gap-1">
            {weeks.map((week, i) => (
              <div key={i} className="grid grid-cols-7 gap-1">
                {week.map((date, j) => {
                  if (!date) return <div key={j} className="aspect-square" />;
                  const dayNum = Number(date.slice(-2));
                  const isToday = date === today;
                  const isSelected = date === selectedDate;
                  const badges = badgesForDate(date);
                  return (
                    <button
                      key={j}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`flex aspect-square flex-col items-center justify-start gap-0.5 rounded-xl pt-1 text-sm transition ${
                        isSelected
                          ? "bg-green-600 text-white font-bold"
                          : isToday
                            ? "bg-green-50 text-green-700 font-bold ring-1 ring-green-300"
                            : "text-stone-700 active:bg-stone-100"
                      }`}
                    >
                      <span>{dayNum}</span>
                      <span className="flex flex-wrap items-center justify-center gap-x-0.5 text-[10px] leading-none">
                        {badges.slice(0, 3).map((icon, k) => (
                          <span key={k}>{icon}</span>
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-center text-stone-400">กำลังโหลด...</p>
        ) : selectedDate ? (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-stone-400">
                {formatDateThai(selectedDate)}
              </h2>
              {dayExpenseTotal > 0 ? (
                <span className="text-sm font-bold text-red-600">
                  ใช้จ่ายวันนี้ {formatCurrency(dayExpenseTotal)}
                </span>
              ) : null}
            </div>

            {!dayHasData ? (
              <p className="py-6 text-center text-stone-400">ไม่มีบันทึกในวันนี้</p>
            ) : (
              <div className="flex flex-col gap-3">
                {dayHarvests.map((h) => (
                  <HarvestRow key={`h-${h.id}`} harvest={h} plots={plots} onChanged={refreshMonth} />
                ))}
                {dayActivities.map((a) => (
                  <ActivityRow key={`a-${a.id}`} activity={a} plots={plots} onChanged={refreshMonth} />
                ))}
                {dayExpenses.map((e) => (
                  <ExpenseRow key={`e-${e.id}`} expense={e} onChanged={refreshMonth} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <p className="py-8 text-center text-stone-400">แตะวันที่เพื่อดูรายละเอียด</p>
        )}
      </div>
    </div>
  );
}
