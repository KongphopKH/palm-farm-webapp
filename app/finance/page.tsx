"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Banner from "@/components/Banner";
import StatCard from "@/components/StatCard";
import HarvestRow from "@/components/HarvestRow";
import ExpenseRow from "@/components/ExpenseRow";
import { getExpenses, getHarvests, getPlots } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatCurrency } from "@/lib/format";
import type { Expense, Harvest, Plot } from "@/types";

type Tab = "income" | "expense";

export default function FinancePage() {
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("income");

  async function refreshLists() {
    try {
      const [h, e] = await Promise.all([getHarvests(100), getExpenses(100)]);
      setHarvests(h);
      setExpenses(e);
    } catch (err) {
      console.error(err);
      setError("โหลดข้อมูลบัญชีไม่สำเร็จ");
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    Promise.all([getHarvests(100), getExpenses(100), getPlots()])
      .then(([h, e, p]) => {
        if (cancelled) return;
        setHarvests(h);
        setExpenses(e);
        setPlots(p);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          setError("โหลดข้อมูลบัญชีไม่สำเร็จ");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalIncome = harvests.reduce((sum, h) => sum + Number(h.total_price ?? 0), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="บัญชีฟาร์ม" />
      <div className="flex flex-1 flex-col gap-4 px-4 py-5">
        {!isSupabaseConfigured ? <Banner variant="warning">ยังไม่ได้เชื่อมต่อ Supabase</Banner> : null}
        {error ? <Banner variant="error">{error}</Banner> : null}

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="รายรับรวม" value={formatCurrency(totalIncome)} tone="positive" />
          <StatCard label="รายจ่ายรวม" value={formatCurrency(totalExpense)} tone="negative" />
        </div>

        <div className="flex rounded-xl bg-stone-100 p-1">
          <button
            type="button"
            onClick={() => setTab("income")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition ${
              tab === "income" ? "bg-white text-green-700 shadow-sm" : "text-stone-500"
            }`}
          >
            รายรับ (ขายปาล์ม)
          </button>
          <button
            type="button"
            onClick={() => setTab("expense")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition ${
              tab === "expense" ? "bg-white text-red-600 shadow-sm" : "text-stone-500"
            }`}
          >
            รายจ่าย
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-stone-400">กำลังโหลด...</p>
        ) : tab === "income" ? (
          harvests.length === 0 ? (
            <p className="py-8 text-center text-stone-400">ยังไม่มีประวัติการขาย</p>
          ) : (
            <div className="flex flex-col gap-3">
              {harvests.map((h) => (
                <HarvestRow key={h.id} harvest={h} plots={plots} onChanged={refreshLists} />
              ))}
            </div>
          )
        ) : expenses.length === 0 ? (
          <p className="py-8 text-center text-stone-400">ยังไม่มีประวัติรายจ่าย</p>
        ) : (
          <div className="flex flex-col gap-3">
            {expenses.map((e) => (
              <ExpenseRow key={e.id} expense={e} onChanged={refreshLists} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
