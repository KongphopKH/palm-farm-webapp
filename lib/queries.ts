import { supabase } from "./supabase";
import { startOfMonthISO, endOfMonthISO } from "./format";
import type { Activity, Expense, Harvest, Plot } from "@/types";

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
