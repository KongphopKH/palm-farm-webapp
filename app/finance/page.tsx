"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Banner from "@/components/Banner";
import StatCard from "@/components/StatCard";
import { getExpenses, getHarvests } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatCurrency, formatDateThai } from "@/lib/format";
import type { Expense, Harvest } from "@/types";

type Tab = "income" | "expense";

export default function FinancePage() {
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("income");

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    Promise.all([getHarvests(100), getExpenses(100)])
      .then(([h, e]) => {
        setHarvests(h);
        setExpenses(e);
      })
      .catch((err) => {
        console.error(err);
        setError("โหลดข้อมูลบัญชีไม่สำเร็จ");
      })
      .finally(() => setLoading(false));
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
            <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-stone-500">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-semibold">วันที่</th>
                    <th className="px-3 py-2.5 text-right font-semibold">น้ำหนัก (กก.)</th>
                    <th className="px-3 py-2.5 text-right font-semibold">ยอดเงิน</th>
                  </tr>
                </thead>
                <tbody>
                  {harvests.map((h) => (
                    <tr key={h.id} className="border-t border-stone-100">
                      <td className="whitespace-nowrap px-3 py-2.5 text-stone-600">
                        {formatDateThai(h.sale_date)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-stone-600">{h.weight_kg}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right font-bold text-green-700">
                        {formatCurrency(h.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : expenses.length === 0 ? (
          <p className="py-8 text-center text-stone-400">ยังไม่มีประวัติรายจ่าย</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-500">
                <tr>
                  <th className="px-3 py-2.5 text-left font-semibold">วันที่</th>
                  <th className="px-3 py-2.5 text-left font-semibold">หมวดหมู่</th>
                  <th className="px-3 py-2.5 text-right font-semibold">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-t border-stone-100">
                    <td className="whitespace-nowrap px-3 py-2.5 text-stone-600">
                      {formatDateThai(e.date)}
                    </td>
                    <td className="px-3 py-2.5 text-stone-600">{e.category}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-bold text-red-600">
                      {formatCurrency(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
