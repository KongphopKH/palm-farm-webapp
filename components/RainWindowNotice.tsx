import type { RainWindow } from "@/lib/weather";

function formatHour(hour: number): string {
  return `${String(hour % 24).padStart(2, "0")}:00`;
}

function formatRainWindows(windows: RainWindow[]): string {
  const labels = windows.map((w) => `${formatHour(w.startHour)}–${formatHour(w.endHour)}`);
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} และ ${labels[labels.length - 1]}`;
}

/** One-line "rain expected at 14:00–17:00" notice — kept always visible
 *  (not tucked behind the details toggle) since it's actionable today. */
export default function RainWindowNotice({ windows }: { windows: RainWindow[] }) {
  if (windows.length === 0) return null;

  return (
    <p className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 ring-1 ring-blue-200">
      🌧️ คาดว่าฝนจะตกช่วง {formatRainWindows(windows)} น.
    </p>
  );
}
