"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { formatNumber, formatPlantAge, getPlantAgeYears, getPlantGrowthStage } from "@/lib/format";
import { deletePlot, updatePlot } from "@/lib/queries";
import { TextField } from "@/components/FormControls";
import type { Plot } from "@/types";

interface PlotCardProps {
  plot: Plot;
  onChanged: () => void;
}

export default function PlotCard({ plot, onChanged }: PlotCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(plot.name);
  const [amount, setAmount] = useState(String(plot.amount));
  const [areaSize, setAreaSize] = useState(String(plot.area_size));
  const [plantedDate, setPlantedDate] = useState(plot.planted_date ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setName(plot.name);
    setAmount(String(plot.amount));
    setAreaSize(String(plot.area_size));
    setPlantedDate(plot.planted_date ?? "");
    setError(null);
    setEditing(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("กรุณากรอกชื่อแปลง");
      return;
    }
    const amt = parseInt(amount, 10);
    const area = parseFloat(areaSize);
    setSaving(true);
    setError(null);
    try {
      await updatePlot(plot.id, {
        name: name.trim(),
        amount: Number.isNaN(amt) ? 0 : amt,
        area_size: Number.isNaN(area) ? 0 : area,
        planted_date: plantedDate || null,
      });
      setEditing(false);
      onChanged();
    } catch (err) {
      console.error(err);
      setError("บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `ลบแปลง "${plot.name}"? ข้อมูลกิจกรรมและการขายที่ผูกกับแปลงนี้จะถูกลบไปด้วยทั้งหมด`
      )
    ) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await deletePlot(plot.id);
      onChanged();
    } catch (err) {
      console.error(err);
      setError("ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        <TextField label="ชื่อแปลง / โซน" value={name} onChange={(e) => setName(e.target.value)} />
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
        <TextField
          label="วันที่ปลูก"
          type="date"
          value={plantedDate}
          onChange={(e) => setPlantedDate(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold text-white active:bg-primary-dark disabled:opacity-60"
          >
            <Check className="h-4 w-4" /> {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={saving}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-stone-100 px-4 py-2.5 text-sm font-bold text-stone-600 active:bg-stone-200"
          >
            <X className="h-4 w-4" /> ยกเลิก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold text-stone-800">{plot.name}</h3>
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            ปาล์มน้ำมัน
          </span>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={startEdit}
            aria-label="แก้ไข"
            className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 active:bg-stone-100"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            aria-label="ลบ"
            className="flex h-9 w-9 items-center justify-center rounded-full text-red-500 active:bg-red-50 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {error ? <p className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-stone-50 px-2 py-2.5 text-center">
          <p className="text-sm font-bold text-stone-800">{formatNumber(plot.amount)}</p>
          <p className="mt-0.5 text-[11px] text-stone-500">ต้น</p>
        </div>
        <div className="rounded-xl bg-stone-50 px-2 py-2.5 text-center">
          <p className="text-sm font-bold text-stone-800">{formatNumber(plot.area_size, 2)}</p>
          <p className="mt-0.5 text-[11px] text-stone-500">ไร่</p>
        </div>
        <div className="rounded-xl bg-stone-50 px-2 py-2.5 text-center">
          <p className="text-sm font-bold text-stone-800">
            {plot.planted_date ? formatPlantAge(plot.planted_date) : "-"}
          </p>
          <p className="mt-0.5 text-[11px] text-stone-500">อายุต้น</p>
        </div>
      </div>

      {plot.planted_date ? (
        (() => {
          const stage = getPlantGrowthStage(getPlantAgeYears(plot.planted_date));
          return (
            <div className={`mt-3 rounded-lg border-l-4 px-3 py-2 ${stage.bg} ${stage.border}`}>
              <p className={`text-xs font-bold ${stage.text}`}>{stage.label}</p>
            </div>
          );
        })()
      ) : (
        <p className="mt-3 text-xs text-stone-400">ยังไม่ระบุวันที่ปลูก — ใช้คำนวณอายุต้นปาล์ม</p>
      )}
    </div>
  );
}
