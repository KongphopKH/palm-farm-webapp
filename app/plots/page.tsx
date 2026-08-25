"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PlotCard from "@/components/PlotCard";
import Banner from "@/components/Banner";
import { TextField } from "@/components/FormControls";
import SubmitButton from "@/components/SubmitButton";
import { addPlot, getPlots } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Plot } from "@/types";

export default function PlotsPage() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [areaSize, setAreaSize] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Used to refresh the list after adding a plot (not tied to the initial
  // loading spinner, so it doesn't touch `loading`).
  async function refreshPlots() {
    try {
      const data = await getPlots();
      setPlots(data);
    } catch (err) {
      console.error(err);
      setError("โหลดข้อมูลแปลงไม่สำเร็จ");
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    getPlots()
      .then((data) => {
        if (!cancelled) setPlots(data);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          setError("โหลดข้อมูลแปลงไม่สำเร็จ");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAddPlot(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("กรุณากรอกชื่อแปลง");
      return;
    }

    const amt = parseInt(amount, 10);
    const area = parseFloat(areaSize);

    setSubmitting(true);
    try {
      await addPlot({
        name: name.trim(),
        crop_type: "oil_palm",
        amount: Number.isNaN(amt) ? 0 : amt,
        area_size: Number.isNaN(area) ? 0 : area,
      });
      setName("");
      setAmount("");
      setAreaSize("");
      setShowForm(false);
      await refreshPlots();
    } catch (err) {
      console.error(err);
      setError("เพิ่มแปลงไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="จัดการแปลงเกษตร" />
      <div className="flex flex-1 flex-col gap-4 px-4 py-5">
        {!isSupabaseConfigured ? <Banner variant="warning">ยังไม่ได้เชื่อมต่อ Supabase</Banner> : null}
        {error ? <Banner variant="error">{error}</Banner> : null}

        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-green-300 py-3.5 text-base font-bold text-green-700 active:bg-green-50"
        >
          <Plus className="h-5 w-5" />
          {showForm ? "ยกเลิก" : "เพิ่มแปลงใหม่"}
        </button>

        {showForm ? (
          <form
            onSubmit={handleAddPlot}
            className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200"
          >
            <TextField
              label="ชื่อแปลง / โซน"
              placeholder="เช่น แปลงหลังบ้าน"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="จำนวนต้น"
              suffix="ต้น"
              type="number"
              inputMode="numeric"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <TextField
              label="ขนาดพื้นที่"
              suffix="ไร่"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={areaSize}
              onChange={(e) => setAreaSize(e.target.value)}
            />
            <SubmitButton loading={submitting}>บันทึกแปลง</SubmitButton>
          </form>
        ) : null}

        {loading ? (
          <p className="py-8 text-center text-stone-400">กำลังโหลด...</p>
        ) : plots.length === 0 ? (
          <p className="py-8 text-center text-stone-400">ยังไม่มีข้อมูลแปลงปาล์ม</p>
        ) : (
          <div className="flex flex-col gap-3">
            {plots.map((plot) => (
              <PlotCard key={plot.id} plot={plot} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
