"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { SelectField, TextAreaField, TextField } from "@/components/FormControls";
import SubmitButton from "@/components/SubmitButton";
import Banner from "@/components/Banner";
import { addExpense } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";
import { todayISODate } from "@/lib/format";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

export default function NewExpensePage() {
  const router = useRouter();
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISODate());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("กรุณากรอกจำนวนเงินให้ถูกต้อง");
      return;
    }

    setSubmitting(true);
    try {
      await addExpense({ category, amount: amt, description: description || null, date });
      setSuccess(true);
      setAmount("");
      setDescription("");
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
      <PageHeader title="บันทึกรายจ่าย" backHref="/" />
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-4 py-5">
        {!isSupabaseConfigured ? <Banner variant="warning">ยังไม่ได้เชื่อมต่อ Supabase</Banner> : null}
        {error ? <Banner variant="error">{error}</Banner> : null}
        {success ? <Banner variant="success">บันทึกสำเร็จ! 🎉</Banner> : null}

        <SelectField
          label="หมวดหมู่รายจ่าย"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SelectField>

        <TextField
          label="จำนวนเงิน"
          suffix="บาท"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <TextAreaField
          label="รายละเอียดเพิ่มเติม"
          rows={3}
          placeholder="เช่น ค่าจ้างตัดหญ้ารอบเดือนนี้"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <TextField
          label="วันที่จ่าย"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <div className="mt-2">
          <SubmitButton loading={submitting} colorClass="bg-red-600 active:bg-red-700">
            บันทึกรายจ่าย
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
