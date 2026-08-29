"use client";

import { useState } from "react";
import { LocateFixed, MapPin } from "lucide-react";
import { upsertFarmSettings } from "@/lib/queries";
import { TextField } from "@/components/FormControls";
import type { FarmSettings } from "@/types";

interface FarmLocationPromptProps {
  location: FarmSettings | null;
  onSaved: (settings: FarmSettings) => void;
}

export default function FarmLocationPrompt({ location, onSaved }: FarmLocationPromptProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualLat, setManualLat] = useState(location ? String(location.farm_lat) : "");
  const [manualLon, setManualLon] = useState(location ? String(location.farm_lon) : "");
  const [manualSaving, setManualSaving] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  function openManualEntry() {
    setManualLat(location ? String(location.farm_lat) : "");
    setManualLon(location ? String(location.farm_lon) : "");
    setManualError(null);
    setManualOpen(true);
  }

  async function handleManualSave() {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      setManualError("กรุณากรอกละติจูดให้ถูกต้อง (-90 ถึง 90)");
      return;
    }
    if (Number.isNaN(lon) || lon < -180 || lon > 180) {
      setManualError("กรุณากรอกลองจิจูดให้ถูกต้อง (-180 ถึง 180)");
      return;
    }
    setManualSaving(true);
    setManualError(null);
    try {
      const settings = await upsertFarmSettings(lat, lon);
      onSaved(settings);
      setManualOpen(false);
    } catch (err) {
      console.error(err);
      setManualError("บันทึกตำแหน่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setManualSaving(false);
    }
  }

  function handleUseCurrentLocation() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setError("อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง");
      return;
    }
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        upsertFarmSettings(pos.coords.latitude, pos.coords.longitude)
          .then((settings) => {
            onSaved(settings);
          })
          .catch((err) => {
            console.error(err);
            setError("บันทึกตำแหน่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
          })
          .finally(() => {
            setLoading(false);
          });
      },
      (err) => {
        console.error(err);
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("กรุณาอนุญาตให้เข้าถึงตำแหน่งในเบราว์เซอร์ก่อน");
        } else {
          setError("ไม่สามารถระบุตำแหน่งได้ กรุณาลองใหม่อีกครั้ง");
        }
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <MapPin className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-stone-500">
            {location ? "ตำแหน่งสวนที่บันทึกไว้" : "ยังไม่ได้ตั้งตำแหน่งสวน"}
          </p>
          <p className="truncate text-sm font-bold text-stone-800">
            {location
              ? `${location.farm_lat.toFixed(4)}, ${location.farm_lon.toFixed(4)}`
              : "พยากรณ์อากาศใช้ตำแหน่งค่าเริ่มต้นอยู่"}
          </p>
          {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : null}
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={loading}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white active:bg-blue-700 disabled:opacity-60"
        >
          <LocateFixed className="h-4 w-4" />
          {loading ? "กำลังระบุ..." : location ? "แก้ไข" : "ใช้ตำแหน่งปัจจุบัน"}
        </button>
      </div>

      {!manualOpen ? (
        <button
          type="button"
          onClick={openManualEntry}
          className="self-start text-xs font-semibold text-stone-500 underline decoration-stone-300 underline-offset-2 active:text-stone-700"
        >
          ไม่ได้อยู่ที่สวนตอนนี้? กรอกพิกัดเอง
        </button>
      ) : (
        <div className="flex flex-col gap-3 border-t border-stone-100 pt-3">
          <p className="text-xs leading-relaxed text-stone-500">
            💡 หาพิกัดสวนได้จาก Google Maps: กดค้างที่ตำแหน่งสวนบนแผนที่ แล้วคัดลอกตัวเลขสองชุดที่ขึ้นมา
            (เช่น 9.1382, 99.3215) มาใส่ด้านล่างนี้
          </p>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="ละติจูด (Lat)"
              type="number"
              inputMode="decimal"
              step="0.0001"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
            />
            <TextField
              label="ลองจิจูด (Lon)"
              type="number"
              inputMode="decimal"
              step="0.0001"
              value={manualLon}
              onChange={(e) => setManualLon(e.target.value)}
            />
          </div>
          {manualError ? <p className="text-xs font-medium text-red-600">{manualError}</p> : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleManualSave}
              disabled={manualSaving}
              className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white active:bg-blue-700 disabled:opacity-60"
            >
              {manualSaving ? "กำลังบันทึก..." : "บันทึกพิกัด"}
            </button>
            <button
              type="button"
              onClick={() => setManualOpen(false)}
              disabled={manualSaving}
              className="rounded-xl bg-stone-100 px-4 py-2.5 text-sm font-bold text-stone-600 active:bg-stone-200"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
