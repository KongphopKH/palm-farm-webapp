export interface WeatherTip {
  tempC: number | null;
  isRaining: boolean;
  message: string;
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

/**
 * Fetches a very basic weather tip from Open-Meteo (free, no API key
 * required) and turns it into a short, actionable Thai-language suggestion
 * for the dashboard's Smart Reminders section.
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
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,rain&timezone=Asia%2FBangkok`;
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

    return { tempC, isRaining, message };
  } catch (err) {
    console.error("fetchWeatherTip failed:", err);
    return {
      tempC: null,
      isRaining: false,
      message: "ไม่สามารถโหลดข้อมูลสภาพอากาศได้ในขณะนี้",
    };
  }
}
