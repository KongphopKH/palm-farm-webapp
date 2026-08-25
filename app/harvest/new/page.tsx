"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { SelectField, TextField } from "@/components/FormControls";
import SubmitButton from "@/components/SubmitButton";
import Banner from "@/components/Banner";
import { addHarvest, getPlots } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatCurrency, todayISODate } from "@/lib/format";
import type { Plot } from "@/types";

export default function NewHarvestPage() {
  const router = useRouter();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [plotId, setPlotId] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [saleDate, setSaleDate] = useState(todayISODate());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getPlots()
      .then((data) => {
        setPlots(data);
        if (data.length > 0) setPlotId(data[0].id);
      })
      .catch(() => setError("โหลดรายชื่อแปลงไม่สำเร็จ"));
  }, []);

  const totalPrice = useMemo(() => {
    const w = parseFloat(weightKg);
    const p = parseFloat(pricePerKg);
    if (Number.isNaN(w) || Number.isNaN(p)) return 0;
    return w * p;
  }, [weightKg, pricePerKg]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

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

    setSubmitting(true);
    try {
      await addHarvest({
        plot_id: plotId,
        weight_kg: weight,
        price_per_kg: price,
        receipt_number: receiptNumber || null,
        sale_date: saleDate,
      });
      setSuccess(true);
      setWeightKg("");
      setPricePerKg("");
      setReceiptNumber("");
      setTimeout(() => router.push("/"), 900);
    } catch (err) {
      console.error(err);
      setError("บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="บันทึกการขายปาล์ม" backHref="/" />
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-4 py-5">
        {!isSupabaseConfigured ? <Banner variant="warning">ยังไม่ได้เชื่อมต่อ Supabase</Banner> : null}
        {error ? <Banner variant="error">{error}</Banner> : null}
        {success ? <Banner variant="success">บันทึกสำเร็จ! 🎉</Banner> : null}

        <SelectField
          label="แปลงปาล์ม"
          value={plotId}
          onChange={(e) => setPlotId(e.target.value)}
          required
        >
          <option value="" disabled>
            เลือกแปลง
          </option>
          {plots.map((plot) => (
            <option key={plot.id} value={plot.id}>
              {plot.name}
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
          placeholder="0.00"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          required
        />

        <TextField
          label="ราคาขายต่อกิโลกรัม"
          suffix="บาท/กก."
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={pricePerKg}
          onChange={(e) => setPricePerKg(e.target.value)}
          required
        />

        <div className="rounded-2xl bg-green-50 p-4 text-center ring-1 ring-green-200">
          <p className="text-sm font-medium text-green-700">ยอดเงินรวม</p>
          <p className="mt-1 text-3xl font-extrabold text-green-700">{formatCurrency(totalPrice)}</p>
        </div>

        <TextField
          label="เลขที่ใบเสร็จ"
          type="text"
          placeholder="เช่น 00123"
          value={receiptNumber}
          onChange={(e) => setReceiptNumber(e.target.value)}
        />

        <TextField
          label="วันที่ขาย"
          type="date"
          value={saleDate}
          onChange={(e) => setSaleDate(e.target.value)}
          required
        />

        <div className="mt-2">
          <SubmitButton loading={submitting} colorClass="bg-green-600 active:bg-green-700">
            บันทึกการขาย
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
