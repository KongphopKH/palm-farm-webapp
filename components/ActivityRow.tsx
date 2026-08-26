"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { formatDateThai } from "@/lib/format";
import { deleteActivity, updateActivity } from "@/lib/queries";
import { ACTIVITY_TYPES } from "@/lib/constants";
import { SelectField, TextAreaField, TextField } from "@/components/FormControls";
import type { Activity, Plot } from "@/types";

interface ActivityRowProps {
  activity: Activity;
  plots: Plot[];
  onChanged: () => void;
}

export default function ActivityRow({ activity, plots, onChanged }: ActivityRowProps) {
  const [editing, setEditing] = useState(false);
  const [plotId, setPlotId] = useState(activity.plot_id);
  const [activityType, setActivityType] = useState(activity.activity_type);
  const [description, setDescription] = useState(activity.description ?? "");
  const [date, setDate] = useState(activity.date);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plotName = plots.find((p) => p.id === activity.plot_id)?.name ?? "-";

  function startEdit() {
    setPlotId(activity.plot_id);
    setActivityType(activity.activity_type);
    setDescription(activity.description ?? "");
    setDate(activity.date);
    setError(null);
    setEditing(true);
  }

  async function handleSave() {
    if (!plotId) {
      setError("กรุณาเลือกแปลงปาล์ม");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateActivity(activity.id, {
        plot_id: plotId,
        activity_type: activityType,
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
    if (!window.confirm("ลบบันทึกกิจกรรมนี้?")) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteActivity(activity.id);
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
        <SelectField
          label="ประเภทกิจกรรม"
          value={activityType}
          onChange={(e) => setActivityType(e.target.value)}
        >
          {ACTIVITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectField>
        <TextAreaField
          label="รายละเอียดเพิ่มเติม"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField label="วันที่ทำกิจกรรม" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white active:bg-blue-700 disabled:opacity-60"
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
          {formatDateThai(activity.date)} · {plotName}
        </p>
        <p className="text-base font-bold text-stone-800">{activity.activity_type}</p>
        {activity.description ? (
          <p className="truncate text-sm text-stone-600">{activity.description}</p>
        ) : null}
        {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : null}
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
  );
}
