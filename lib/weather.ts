import { todayISODate } from "./format";

export interface RainWindow {
  startHour: number; // 0-23
  endHour: number; // 0-23, exclusive — rain expected until this hour begins
}

export interface DailyForecast {
  date: string; // ISO date (YYYY-MM-DD)
  tempMax: number | null;
  tempMin: number | null;
  precipitationProbability: number | null; // 0-100
  willRain: boolean;
}

export interface WeatherTip {
  tempC: number | null;
  isRaining: boolean;
  message: string;
  /** Upcoming rain windows today (from the current hour onward). */
  rainWindowsToday: RainWindow[];
  /** Next 5 days, starting tomorrow. */
  dailyForecast: DailyForecast[];
}

// Defaults to Surat Thani, a major oil-palm growing province in Thailand.
// Override with NEXT_PUBLIC_FARM_LAT / NEXT_PUBLIC_FARM_LON for your farm.
//
// Uses `||` rather than `??`: GitHub Actions substitutes an unset
// `vars.NEXT_PUBLIC_FARM_LAT` with an EMPTY STRING (not undefined), and `??`
// only falls back on null/undefined — so an empty string would sail through
// as a real (blank) coordinate instead of hitting the default. Same class of
// bug as the earlier Supabase env var fix.
const LAT = process.env.NEXT_PUBLIC_FARM_LAT || "9.1382";
const LON = process.env.NEXT_PUBLIC_FARM_LON || "99.3215";

const RAIN_PROBABILITY_THRESHOLD = 50;

/**
 * Fetches current conditions plus an hourly (today) and daily (next 5 days)
 * forecast from Open-Meteo (free, no API key required), and turns them into
 * a short Thai-language tip plus structured rain-window / outlook data for
 * the dashboard's Smart Reminders section.
 *
 * `lat`/`lon` (from the user-saved farm location in Supabase) override the
 * build-time env-var defaults when provided.
 */
export async function fetchWeatherTip(
  lat?: number | null,
  lon?: number | null
): Promise<WeatherTip> {
  try {
    const latitude = lat ?? LAT;
    const longitude = lon ?? LON;
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,precipitation,rain` +
      `&hourly=precipitation,precipitation_probability,rain` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&forecast_days=6&timezone=Asia%2FBangkok`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("weather fetch failed");
    const data = await res.json();

    const current = data?.current ?? {};
    const precipitation = Number(current.precipitation ?? 0);
    const rain = Number(current.rain ?? 0);
    const isRaining = precipitation > 0 || rain > 0;
    const tempC = typeof current.temperature_2m === "number" ? current.temperature_2m : null;

    let message: string;
    if (isRaining) {
      message = "🌧️ ฝนตก แนะนำให้งดใส่ปุ๋ยและงดฉีดยาในวันนี้";
    } else if (typeof tempC === "number" && tempC >= 35) {
      message = "☀️ อากาศร้อนจัด ควรรดน้ำเพิ่มและเลี่ยงงานกลางแจ้งช่วงเที่ยง";
    } else {
      message = "🌤️ อากาศเหมาะสมสำหรับทำงานในแปลงตามปกติ";
    }

    const rainWindowsToday = parseRainWindowsToday(data?.hourly);
    // daily[0] is today (already covered by current conditions above); the
    // next 5 entries are what the user asked for — "the coming 5 days".
    const dailyForecast = parseDailyForecast(data?.daily).slice(1, 6);

    return { tempC, isRaining, message, rainWindowsToday, dailyForecast };
  } catch (err) {
    console.error("fetchWeatherTip failed:", err);
    return {
      tempC: null,
      isRaining: false,
      message: "ไม่สามารถโหลดข้อมูลสภาพอากาศได้ในขณะนี้",
      rainWindowsToday: [],
      dailyForecast: [],
    };
  }
}

export interface HourlyResponse {
  time?: string[];
  precipitation_probability?: (number | null)[];
  precipitation?: (number | null)[];
}

/** Groups today's remaining forecast hours with rain into start–end windows.
 *  Exported (not just used internally) so it can be unit-tested directly. */
export function parseRainWindowsToday(hourly: HourlyResponse | undefined): RainWindow[] {
  if (!hourly?.time) return [];
  const today = todayISODate();
  const currentHour = new Date().getHours();

  const windows: RainWindow[] = [];
  let current: RainWindow | null = null;

  for (let i = 0; i < hourly.time.length; i++) {
    const t = hourly.time[i];
    if (!t.startsWith(today)) continue;
    const hour = Number(t.slice(11, 13));
    if (Number.isNaN(hour) || hour < currentHour) continue;

    const probability = hourly.precipitation_probability?.[i] ?? 0;
    const amount = hourly.precipitation?.[i] ?? 0;
    const isRainy = probability >= RAIN_PROBABILITY_THRESHOLD || amount > 0.1;

    if (isRainy) {
      if (current && current.endHour === hour) {
        current.endHour = hour + 1;
      } else {
        current = { startHour: hour, endHour: hour + 1 };
        windows.push(current);
      }
    } else {
      current = null;
    }
  }

  return windows;
}

export interface DailyResponse {
  time?: string[];
  temperature_2m_max?: (number | null)[];
  temperature_2m_min?: (number | null)[];
  precipitation_probability_max?: (number | null)[];
}

export function parseDailyForecast(daily: DailyResponse | undefined): DailyForecast[] {
  if (!daily?.time) return [];
  return daily.time.map((date, i) => {
    const probability = daily.precipitation_probability_max?.[i] ?? null;
    return {
      date,
      tempMax: daily.temperature_2m_max?.[i] ?? null,
      tempMin: daily.temperature_2m_min?.[i] ?? null,
      precipitationProbability: probability,
      willRain: (probability ?? 0) >= RAIN_PROBABILITY_THRESHOLD,
    };
  });
}
