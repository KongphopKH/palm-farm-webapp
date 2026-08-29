"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { CircleMarker, Map as LeafletMap } from "leaflet";

interface FarmLocationMapPickerProps {
  initialLat: number;
  initialLon: number;
  hasSavedLocation: boolean;
  onSave: (lat: number, lon: number) => Promise<void>;
  onCancel: () => void;
}

const MARKER_STYLE = {
  radius: 10,
  color: "#15803d",
  fillColor: "#22c55e",
  fillOpacity: 0.9,
  weight: 2,
};

export default function FarmLocationMapPicker({
  initialLat,
  initialLon,
  hasSavedLocation,
  onSave,
  onCancel,
}: FarmLocationMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  const [picked, setPicked] = useState<{ lat: number; lon: number } | null>(
    hasSavedLocation ? { lat: initialLat, lon: initialLon } : null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamically imported (not top-level) so Leaflet — which touches the DOM
  // — never runs during Next's static-export prerender pass, only after
  // this effect fires in the browser.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current).setView(
        [initialLat, initialLon],
        hasSavedLocation ? 13 : 6
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      if (hasSavedLocation) {
        markerRef.current = L.circleMarker([initialLat, initialLon], MARKER_STYLE).addTo(map);
      }

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.circleMarker([lat, lng], MARKER_STYLE).addTo(map);
        }
        setPicked({ lat, lon: lng });
      });

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    if (!picked) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(picked.lat, picked.lon);
    } catch (err) {
      console.error(err);
      setError("บันทึกตำแหน่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs leading-relaxed text-stone-500">
        🗺️ แตะบนแผนที่ตรงตำแหน่งสวน แล้วกดบันทึก
      </p>
      <div
        ref={containerRef}
        className="h-56 w-full overflow-hidden rounded-xl ring-1 ring-stone-200"
      />
      {picked ? (
        <p className="text-xs text-stone-500">
          พิกัดที่เลือก: {picked.lat.toFixed(4)}, {picked.lon.toFixed(4)}
        </p>
      ) : null}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!picked || saving}
          className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white active:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "กำลังบันทึก..." : "บันทึกตำแหน่งนี้"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-xl bg-stone-100 px-4 py-2.5 text-sm font-bold text-stone-600 active:bg-stone-200"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
