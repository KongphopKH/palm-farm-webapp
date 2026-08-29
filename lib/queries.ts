import { supabase } from "./supabase";
import { startOfMonthISO, endOfMonthISO, monthRangeISO } from "./format";
import type { Activity, Expense, FarmSettings, Harvest, Plot } from "@/types";

// ---------- Plots ----------

export async function getPlots(): Promise<Plot[]> {
  const { data, error } = await supabase.from("plots").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function addPlot(input: Omit<Plot, "id" | "created_at">): Promise<Plot> {
  const { data, error } = await supabase.from("plots").insert(input).select().single();
  if (error) throw error;
  return data as Plot;
}

export async function updatePlot(
  id: string,
  input: Partial<Omit<Plot, "id" | "created_at">>
): Promise<Plot> {
  const { data, error } = await supabase.from("plots").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data as Plot;
}

export async function deletePlot(id: string): Promise<void> {
  const { error } = await supabase.from("plots").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Activities ----------

export async function getActivities(limit = 50): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function addActivity(input: Omit<Activity, "id" | "created_at">): Promise<Activity> {
  const { data, error } = await supabase.from("activities").insert(input).select().single();
  if (error) throw error;
  return data as Activity;
}

export async function updateActivity(
  id: string,
  input: Partial<Omit<Activity, "id" | "created_at">>
): Promise<Activity> {
  const { data, error } = await supabase
    .from("activities")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Activity;
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) throw error;
}

export async function getActivitiesInRange(from: string, to: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ---------- Harvests ----------

export async function getHarvests(limit = 50): Promise<Harvest[]> {
  const { data, error } = await supabase
    .from("harvests")
    .select("*")
    .order("sale_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/**
 * total_price is a generated column in Postgres (weight_kg * price_per_kg),
 * so we never write it directly — the database computes it and returns it
 * in the response.
 */
export async function addHarvest(
  input: Omit<Harvest, "id" | "created_at" | "total_price">
): Promise<Harvest> {
  const { data, error } = await supabase.from("harvests").insert(input).select().single();
  if (error) throw error;
  return data as Harvest;
}

export async function updateHarvest(
  id: string,
  input: Partial<Omit<Harvest, "id" | "created_at" | "total_price">>
): Promise<Harvest> {
  const { data, error } = await supabase
    .from("harvests")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Harvest;
}

export async function deleteHarvest(id: string): Promise<void> {
  const { error } = await supabase.from("harvests").delete().eq("id", id);
  if (error) throw error;
}

export async function getHarvestsInRange(from: string, to: string): Promise<Harvest[]> {
  const { data, error } = await supabase
    .from("harvests")
    .select("*")
    .gte("sale_date", from)
    .lte("sale_date", to)
    .order("sale_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getLastHarvestDate(): Promise<string | null> {
  const { data, error } = await supabase
    .from("harvests")
    .select("sale_date")
    .order("sale_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.sale_date ?? null;
}

// ---------- Expenses ----------

export async function getExpenses(limit = 50): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function addExpense(input: Omit<Expense, "id" | "created_at">): Promise<Expense> {
  const { data, error } = await supabase.from("expenses").insert(input).select().single();
  if (error) throw error;
  return data as Expense;
}

export async function updateExpense(
  id: string,
  input: Partial<Omit<Expense, "id" | "created_at">>
): Promise<Expense> {
  const { data, error } = await supabase
    .from("expenses")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Expense;
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

export async function getExpensesInRange(from: string, to: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ---------- Dashboard summary ----------

export interface MonthlySummary {
  income: number;
  expense: number;
  profit: number;
}

export async function getMonthlySummary(): Promise<MonthlySummary> {
  const from = startOfMonthISO();
  const to = endOfMonthISO();

  const [harvestRes, expenseRes] = await Promise.all([
    supabase.from("harvests").select("total_price").gte("sale_date", from).lte("sale_date", to),
    supabase.from("expenses").select("amount").gte("date", from).lte("date", to),
  ]);

  if (harvestRes.error) throw harvestRes.error;
  if (expenseRes.error) throw expenseRes.error;

  const income = (harvestRes.data ?? []).reduce(
    (sum, row) => sum + Number(row.total_price ?? 0),
    0
  );
  const expense = (expenseRes.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount ?? 0),
    0
  );

  return { income, expense, profit: income - expense };
}

export interface MonthlyTrendPoint {
  year: number;
  month: number; // 0-indexed, like Date#getMonth
  income: number;
  expense: number;
}

/** Income/expense per month for the last `months` months (oldest first, current
 *  month last) — powers the finance page's trend chart. */
export async function getMonthlyTrend(months = 6): Promise<MonthlyTrendPoint[]> {
  const now = new Date();
  const points: { year: number; month: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    points.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const from = monthRangeISO(points[0].year, points[0].month).from;
  const to = monthRangeISO(points[points.length - 1].year, points[points.length - 1].month).to;

  const [harvestRes, expenseRes] = await Promise.all([
    supabase
      .from("harvests")
      .select("total_price, sale_date")
      .gte("sale_date", from)
      .lte("sale_date", to),
    supabase.from("expenses").select("amount, date").gte("date", from).lte("date", to),
  ]);

  if (harvestRes.error) throw harvestRes.error;
  if (expenseRes.error) throw expenseRes.error;

  const monthKey = (year: number, month: number) => `${year}-${String(month + 1).padStart(2, "0")}`;
  const buckets = new Map<string, { income: number; expense: number }>();
  for (const p of points) buckets.set(monthKey(p.year, p.month), { income: 0, expense: 0 });

  for (const row of harvestRes.data ?? []) {
    const bucket = buckets.get(String(row.sale_date).slice(0, 7));
    if (bucket) bucket.income += Number(row.total_price ?? 0);
  }
  for (const row of expenseRes.data ?? []) {
    const bucket = buckets.get(String(row.date).slice(0, 7));
    if (bucket) bucket.expense += Number(row.amount ?? 0);
  }

  return points.map((p) => {
    const bucket = buckets.get(monthKey(p.year, p.month))!;
    return { year: p.year, month: p.month, income: bucket.income, expense: bucket.expense };
  });
}

// ---------- Farm settings (location, for weather lookups) ----------

export async function getFarmSettings(): Promise<FarmSettings | null> {
  const { data, error } = await supabase.from("farm_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function upsertFarmSettings(lat: number, lon: number): Promise<FarmSettings> {
  const { data, error } = await supabase
    .from("farm_settings")
    .upsert({ id: 1, farm_lat: lat, farm_lon: lon, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data as FarmSettings;
}
