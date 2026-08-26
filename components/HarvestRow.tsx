"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { formatCurrency, formatDateThai } from "@/lib/format";
import { deleteHarvest, updateHarvest } from "@/lib/queries";
import { SelectField, TextField } from "@/components/FormControls";
import type { Harvest, Plot } from "@/types";

interface HarvestRowProps {
  harvest: Harvest;
  plots: Plot[];
  onChanged: () => void;
}

export default function HarvestRow({ harvest, plots, onChanged }: HarvestRowProps) {
  const [editing, setEditing] = useState(false);
  const [plotId, setPlotId] = useState(harvest.plot_id);
  const [weightKg, setWeightKg] = useState(String(harvest.weight_kg));
  const [pricePerKg, setPricePerKg] = useState(String(harvest.price_per_kg));
  const [receiptNumber, setReceiptNumber] = useState(harvest.receipt_number ?? "");
  const [saleDate, setSaleDate] = useState(harvest.sale_date);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plotName = plots.find((p) => p.id === harvest.plot_id)?.name ?? "-";

  function startEdit() {
    setPlotId(harvest.plot_id);
    setWeightKg(String(harvest.weight_kg));
    setPricePerKg(String(harvest.price_per_kg));
    setReceiptNumber(harvest.receipt_number ?? "");
    setSaleDate(harvest.sale_date);
    setError(null);
    setEditing(true);
  }

  async function handleSave() {
    const weight = parseFloat(weightKg);
    const price = parseFloat(pricePerKg);
    if (!plotId) {
      setError("กรุณาเลือกแปลงปาล์ม");
      return;
    }
    if (!weight || weight <= 0) {
      setError("กรุณากรอกน้ำหนักสุทธิให้ถูกต้อง");
      return;
    }
    if (!price || price <= 0) {
      setError("กรุณากรอกราคาขายต่อกิโลกรัมให้ถูกต้อง");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateHarvest(harvest.id, {
        plot_id: plotId,
        weight_kg: weight,
        price_per_kg: price,
        receipt_number: receiptNumber || null,
        sale_date: saleDate,
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
    if (!window.confirm("ลบรายการขายนี้?")) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteHarvest(harvest.id);
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
        <SelectField label="แปลงปาล์ม" value={plotId} onChange={(e) => setPlotId(e.target.value)}>
          {plots.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </SelectField>
        <TextField
          label="น้ำหนักสุทธิ"
          suffix="กก."
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
        />
        <TextField
          label="ราคาขายต่อกิโลกรัม"
          suffix="บาท/กก."
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={pricePerKg}
          onChange={(e) => setPricePerKg(e.target.value)}
        />
        <TextField
          label="เลขที่ใบเสร็จ"
          type="text"
          value={receiptNumber}
          onChange={(e) => setReceiptNumber(e.target.value)}
        />
        <TextField
          label="วันที่ขาย"
          type="date"
          value={saleDate}
          onChange={(e) => setSaleDate(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white active:bg-green-700 disabled:opacity-60"
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
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-stone-500">
          {formatDateThai(harvest.sale_date)} · {plotName}
        </p>
        <p className="text-base font-bold text-stone-800">{harvest.weight_kg} กก.</p>
        {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : null}
      </div>
      <p className="shrink-0 text-lg font-extrabold text-green-700">
        {formatCurrency(harvest.total_price)}
      </p>
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
  );
}
