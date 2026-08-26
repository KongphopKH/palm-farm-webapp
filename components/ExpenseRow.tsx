"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { formatCurrency, formatDateThai } from "@/lib/format";
import { deleteExpense, updateExpense } from "@/lib/queries";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { SelectField, TextAreaField, TextField } from "@/components/FormControls";
import type { Expense } from "@/types";

interface ExpenseRowProps {
  expense: Expense;
  onChanged: () => void;
}

export default function ExpenseRow({ expense, onChanged }: ExpenseRowProps) {
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState(expense.category);
  const [amount, setAmount] = useState(String(expense.amount));
  const [description, setDescription] = useState(expense.description ?? "");
  const [date, setDate] = useState(expense.date);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setCategory(expense.category);
    setAmount(String(expense.amount));
    setDescription(expense.description ?? "");
    setDate(expense.date);
    setError(null);
    setEditing(true);
  }

  async function handleSave() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("กรุณากรอกจำนวนเงินให้ถูกต้อง");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateExpense(expense.id, {
        category,
        amount: amt,
        description: description || null,
        date,
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
    if (!window.confirm("ลบรายการรายจ่ายนี้?")) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteExpense(expense.id);
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
        <SelectField
          label="หมวดหมู่รายจ่าย"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <TextAreaField
          label="รายละเอียดเพิ่มเติม"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField label="วันที่จ่าย" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white active:bg-red-700 disabled:opacity-60"
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
          {formatDateThai(expense.date)} · {expense.category}
        </p>
        {expense.description ? (
          <p className="truncate text-sm text-stone-600">{expense.description}</p>
        ) : null}
        {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : null}
      </div>
      <p className="shrink-0 text-lg font-extrabold text-red-600">{formatCurrency(expense.amount)}</p>
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
