import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  parseDailyForecast,
  parseRainWindowsToday,
  type DailyResponse,
  type HourlyResponse,
} from "./weather";

const TODAY = "2026-08-29";

function hourTimestamp(hour: number, date = TODAY): string {
  return `${date}T${String(hour).padStart(2, "0")}:00`;
}

describe("parseRainWindowsToday", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function buildHourly(rainyHours: number[]): HourlyResponse {
    const time: string[] = [];
    const precipitation_probability: number[] = [];
    for (let h = 0; h < 24; h++) {
      time.push(hourTimestamp(h));
      precipitation_probability.push(rainyHours.includes(h) ? 70 : 10);
    }
    // A following day's rainy hour, to confirm it never leaks into "today".
    time.push(hourTimestamp(0, "2026-08-30"));
    precipitation_probability.push(90);
    return { time, precipitation_probability };
  }

  it("groups consecutive rainy hours into a single window", () => {
    vi.setSystemTime(new Date(2026, 7, 29, 10)); // now = 10:00
    const windows = parseRainWindowsToday(buildHourly([12, 13, 14]));
    expect(windows).toEqual([{ startHour: 12, endHour: 15 }]);
  });

  it("splits non-consecutive rainy hours into separate windows", () => {
    vi.setSystemTime(new Date(2026, 7, 29, 10));
    const windows = parseRainWindowsToday(buildHourly([12, 13, 14, 19]));
    expect(windows).toEqual([
      { startHour: 12, endHour: 15 },
      { startHour: 19, endHour: 20 },
    ]);
  });

  it("excludes hours before the current time", () => {
    vi.setSystemTime(new Date(2026, 7, 29, 13)); // now = 13:00, mid-window
    const windows = parseRainWindowsToday(buildHourly([12, 13, 14, 19]));
    expect(windows).toEqual([
      { startHour: 13, endHour: 15 },
      { startHour: 19, endHour: 20 },
    ]);
  });

  it("returns an empty array once all of today's rain is in the past", () => {
    vi.setSystemTime(new Date(2026, 7, 29, 20));
    expect(parseRainWindowsToday(buildHourly([12, 13, 14, 19]))).toEqual([]);
  });

  it("returns an empty array when there is no rain forecast today", () => {
    vi.setSystemTime(new Date(2026, 7, 29, 10));
    expect(parseRainWindowsToday(buildHourly([]))).toEqual([]);
  });

  it("returns an empty array when hourly data is missing", () => {
    vi.setSystemTime(new Date(2026, 7, 29, 10));
    expect(parseRainWindowsToday(undefined)).toEqual([]);
    expect(parseRainWindowsToday({})).toEqual([]);
  });

  it("treats a forecast precipitation amount as rainy even below the probability threshold", () => {
    vi.setSystemTime(new Date(2026, 7, 29, 10));
    const hourly: HourlyResponse = {
      time: [hourTimestamp(12)],
      precipitation_probability: [20], // below the 50% threshold
      precipitation: [0.5], // but a real forecast amount
    };
    expect(parseRainWindowsToday(hourly)).toEqual([{ startHour: 12, endHour: 13 }]);
  });
});

describe("parseDailyForecast", () => {
  it("maps each day's arrays into a DailyForecast entry", () => {
    const daily: DailyResponse = {
      time: ["2026-08-30", "2026-08-31"],
      temperature_2m_max: [34, 33],
      temperature_2m_min: [24, 23],
      precipitation_probability_max: [70, 10],
    };
    expect(parseDailyForecast(daily)).toEqual([
      {
        date: "2026-08-30",
        tempMax: 34,
        tempMin: 24,
        precipitationProbability: 70,
        willRain: true, // >= 50% threshold
      },
      {
        date: "2026-08-31",
        tempMax: 33,
        tempMin: 23,
        precipitationProbability: 10,
        willRain: false,
      },
    ]);
  });

  it("treats a missing probability as null, not rainy", () => {
    const daily: DailyResponse = {
      time: ["2026-08-30"],
      temperature_2m_max: [34],
      temperature_2m_min: [24],
    };
    const [day] = parseDailyForecast(daily);
    expect(day.precipitationProbability).toBeNull();
    expect(day.willRain).toBe(false);
  });

  it("returns an empty array when daily data is missing", () => {
    expect(parseDailyForecast(undefined)).toEqual([]);
    expect(parseDailyForecast({})).toEqual([]);
  });
});

describe("fetchWeatherTip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 29, 10));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  function mockFetchOnce(payload: unknown, ok = true) {
    const fetchMock = vi.fn().mockResolvedValue({
      ok,
      json: async () => payload,
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("recommends skipping fertilizer/spraying when it's currently raining", async () => {
    mockFetchOnce({ current: { temperature_2m: 28, precipitation: 2, rain: 2 } });
    const { fetchWeatherTip } = await import("./weather");
    const tip = await fetchWeatherTip(9.14, 99.32);
    expect(tip.isRaining).toBe(true);
    expect(tip.message).toContain("ฝนตก");
  });

  it("warns about heat when it's hot and dry", async () => {
    mockFetchOnce({ current: { temperature_2m: 36, precipitation: 0, rain: 0 } });
    const { fetchWeatherTip } = await import("./weather");
    const tip = await fetchWeatherTip(9.14, 99.32);
    expect(tip.isRaining).toBe(false);
    expect(tip.message).toContain("ร้อนจัด");
  });

  it("reports normal conditions otherwise", async () => {
    mockFetchOnce({ current: { temperature_2m: 30, precipitation: 0, rain: 0 } });
    const { fetchWeatherTip } = await import("./weather");
    const tip = await fetchWeatherTip(9.14, 99.32);
    expect(tip.isRaining).toBe(false);
    expect(tip.message).toContain("เหมาะสม");
  });

  it("falls back to a friendly error state when the request fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);
    const { fetchWeatherTip } = await import("./weather");
    const tip = await fetchWeatherTip(9.14, 99.32);
    expect(tip).toEqual({
      tempC: null,
      isRaining: false,
      message: "ไม่สามารถโหลดข้อมูลสภาพอากาศได้ในขณะนี้",
      rainWindowsToday: [],
      dailyForecast: [],
    });
  });

  it("falls back to a friendly error state when the response is not ok", async () => {
    mockFetchOnce({}, false);
    const { fetchWeatherTip } = await import("./weather");
    const tip = await fetchWeatherTip(9.14, 99.32);
    expect(tip.message).toBe("ไม่สามารถโหลดข้อมูลสภาพอากาศได้ในขณะนี้");
  });

  it("requests the explicitly provided coordinates, not the defaults", async () => {
    const fetchMock = mockFetchOnce({ current: {} });
    const { fetchWeatherTip } = await import("./weather");
    await fetchWeatherTip(12.34, 56.78);
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("latitude=12.34");
    expect(calledUrl).toContain("longitude=56.78");
  });

  // Regression test for a real bug: GitHub Actions substitutes an unset
  // `vars.NEXT_PUBLIC_FARM_LAT` with an EMPTY STRING, not undefined — a
  // naive `??` fallback lets the blank string through instead of using the
  // default coordinates. lib/weather.ts uses `||` specifically to guard
  // against this; this test fails again if that ever regresses.
  it("falls back to the default coordinates when the env vars are empty strings", async () => {
    vi.stubEnv("NEXT_PUBLIC_FARM_LAT", "");
    vi.stubEnv("NEXT_PUBLIC_FARM_LON", "");
    vi.resetModules();
    const fetchMock = mockFetchOnce({ current: {} });
    const { fetchWeatherTip } = await import("./weather");
    await fetchWeatherTip(); // no override — must use the module's fallback

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("latitude=9.1382");
    expect(calledUrl).toContain("longitude=99.3215");
  });
});
