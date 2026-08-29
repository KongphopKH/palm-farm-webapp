import { formatDayLabelThai } from "@/lib/format";
import type { DailyForecast, RainWindow } from "@/lib/weather";

interface WeatherOutlookProps {
  rainWindowsToday: RainWindow[];
  dailyForecast: DailyForecast[];
}

function formatHour(hour: number): string {
  return `${String(hour % 24).padStart(2, "0")}:00`;
}

function formatRainWindows(windows: RainWindow[]): string {
  const labels = windows.map((w) => `${formatHour(w.startHour)}–${formatHour(w.endHour)}`);
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} และ ${labels[labels.length - 1]}`;
}

function dayIcon(day: DailyForecast): string {
  if (day.willRain) return "🌧️";
  if ((day.precipitationProbability ?? 0) >= 20) return "⛅";
  return "☀️";
}

export default function WeatherOutlook({ rainWindowsToday, dailyForecast }: WeatherOutlookProps) {
  if (rainWindowsToday.length === 0 && dailyForecast.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
      {rainWindowsToday.length > 0 ? (
        <p className="text-sm font-bold text-blue-700">
          🌧️ คาดว่าฝนจะตกช่วง {formatRainWindows(rainWindowsToday)} น.
        </p>
      ) : null}

      {dailyForecast.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-400">
            พยากรณ์ล่วงหน้า 5 วัน
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {dailyForecast.map((day, i) => (
              <div
                key={day.date}
                className="flex min-w-[4.5rem] shrink-0 flex-col items-center gap-1 rounded-xl bg-stone-50 px-2 py-3"
              >
                <span className="text-xs font-semibold text-stone-500">
                  {i === 0 ? "พรุ่งนี้" : formatDayLabelThai(day.date)}
                </span>
                <span className="text-xl">{dayIcon(day)}</span>
                <span className="text-xs font-bold text-stone-700">
                  {day.tempMax != null ? Math.round(day.tempMax) : "-"}°/
                  {day.tempMin != null ? Math.round(day.tempMin) : "-"}°
                </span>
                {day.precipitationProbability != null ? (
                  <span className="text-[10px] text-blue-600">
                    ฝน {Math.round(day.precipitationProbability)}%
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
