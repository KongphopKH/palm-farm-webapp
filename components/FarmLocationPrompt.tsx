"use client";

import { useState } from "react";
import { LocateFixed, MapPin } from "lucide-react";
import { upsertFarmSettings } from "@/lib/queries";
import FarmLocationMapPicker from "@/components/FarmLocationMapPicker";
import type { FarmSettings } from "@/types";

interface FarmLocationPromptProps {
  location: FarmSettings | null;
  onSaved: (settings: FarmSettings) => void;
}

// Fallback map center when no farm location is saved yet — Surat Thani,
// a major oil-palm growing province (same default used by lib/weather.ts).
const DEFAULT_MAP_LAT = 9.1382;
const DEFAULT_MAP_LON = 99.3215;

export default function FarmLocationPrompt({ location, onSaved }: FarmLocationPromptProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

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

  async function handleMapSave(lat: number, lon: number) {
    const settings = await upsertFarmSettings(lat, lon);
    onSaved(settings);
    setPickerOpen(false);
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

      {!pickerOpen ? (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="self-start text-xs font-semibold text-stone-500 underline decoration-stone-300 underline-offset-2 active:text-stone-700"
        >
          ไม่ได้อยู่ที่สวนตอนนี้? เลือกจากแผนที่
        </button>
      ) : (
        <div className="border-t border-stone-100 pt-3">
          <FarmLocationMapPicker
            initialLat={location?.farm_lat ?? DEFAULT_MAP_LAT}
            initialLon={location?.farm_lon ?? DEFAULT_MAP_LON}
            hasSavedLocation={Boolean(location)}
            onSave={handleMapSave}
            onCancel={() => setPickerOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
