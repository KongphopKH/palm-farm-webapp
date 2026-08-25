"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { SelectField, TextAreaField, TextField } from "@/components/FormControls";
import SubmitButton from "@/components/SubmitButton";
import Banner from "@/components/Banner";
import { addActivity, getPlots } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";
import { todayISODate } from "@/lib/format";
import { ACTIVITY_TYPES } from "@/lib/constants";
import type { Plot } from "@/types";

export default function NewActivityPage() {
  const router = useRouter();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [plotId, setPlotId] = useState("");
  const [activityType, setActivityType] = useState<string>(ACTIVITY_TYPES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISODate());
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!plotId) {
      setError("กรุณาเลือกแปลงปาล์ม");
      return;
    }

    setSubmitting(true);
    try {
      await addActivity({
        plot_id: plotId,
        activity_type: activityType,
        description: description || null,
        date,
      });
      setSuccess(true);
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
      <PageHeader title="บันทึกกิจกรรมในแปลง" backHref="/" />
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

        <SelectField
          label="ประเภทกิจกรรม"
          value={activityType}
          onChange={(e) => setActivityType(e.target.value)}
          required
        >
          {ACTIVITY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </SelectField>

        <TextAreaField
          label="รายละเอียดเพิ่มเติม"
          rows={3}
          placeholder="เช่น ใส่ปุ๋ยสูตร 15-15-15 จำนวน 2 กระสอบ"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <TextField
          label="วันที่ทำกิจกรรม"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <div className="mt-2">
          <SubmitButton loading={submitting} colorClass="bg-blue-600 active:bg-blue-700">
            บันทึกกิจกรรม
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
