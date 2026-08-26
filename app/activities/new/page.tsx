"use client";

import { useEffect, useState, type FormEvent } from "react";
import PageHeader from "@/components/PageHeader";
import { SelectField, TextAreaField, TextField } from "@/components/FormControls";
import SubmitButton from "@/components/SubmitButton";
import Banner from "@/components/Banner";
import ActivityRow from "@/components/ActivityRow";
import { addActivity, getActivities, getPlots } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";
import { todayISODate } from "@/lib/format";
import { ACTIVITY_TYPES } from "@/lib/constants";
import type { Activity, Plot } from "@/types";

export default function NewActivityPage() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(isSupabaseConfigured);
  const [plotId, setPlotId] = useState("");
  const [activityType, setActivityType] = useState<string>(ACTIVITY_TYPES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISODate());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function refreshActivities() {
    try {
      const data = await getActivities(50);
      setActivities(data);
    } catch (err) {
      console.error(err);
      setError("โหลดประวัติกิจกรรมไม่สำเร็จ");
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    Promise.all([getPlots(), getActivities(50)])
      .then(([p, a]) => {
        if (cancelled) return;
        setPlots(p);
        setActivities(a);
        if (p.length > 0) setPlotId((current) => current || p[0].id);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          setError("โหลดข้อมูลไม่สำเร็จ");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
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
      await refreshActivities();
      setTimeout(() => setSuccess(false), 2000);
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
      <div className="flex flex-1 flex-col gap-4 px-4 py-5">
        {!isSupabaseConfigured ? <Banner variant="warning">ยังไม่ได้เชื่อมต่อ Supabase</Banner> : null}
        {error ? <Banner variant="error">{error}</Banner> : null}
        {success ? <Banner variant="success">บันทึกสำเร็จ! 🎉</Banner> : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        <section className="mt-2 flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-stone-400">
            ประวัติกิจกรรมล่าสุด
          </h2>
          {loadingHistory ? (
            <p className="py-8 text-center text-stone-400">กำลังโหลด...</p>
          ) : activities.length === 0 ? (
            <p className="py-8 text-center text-stone-400">ยังไม่มีบันทึกกิจกรรม</p>
          ) : (
            <div className="flex flex-col gap-3">
              {activities.map((a) => (
                <ActivityRow key={a.id} activity={a} plots={plots} onChanged={refreshActivities} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
