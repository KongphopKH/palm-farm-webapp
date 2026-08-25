import { createClient } from "@supabase/supabase-js";

// Use `||` (not `??`) throughout this file: an *unset* GitHub Actions
// secret is interpolated as an empty string, not omitted, so a nullish
// check alone lets "" slip through as if it were a real value and crashes
// the Supabase client ("supabaseUrl is required."). Treating "" the same
// as undefined keeps the build resilient whether env vars are missing,
// unset secrets, or genuinely empty.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || undefined;

// Supabase's newer projects use "publishable" keys instead of the legacy
// JWT "anon" key, and the dashboard's own Connect snippet now generates
// NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. We accept either name so the app
// works whichever key type your project (and the Connect dialog) gives you.
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  undefined;

/** True when real Supabase credentials are configured via env vars. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && typeof window !== "undefined") {
  // Warn once in the browser console instead of throwing, so the app can
  // still render (with a friendly on-screen banner) when env vars are
  // missing, e.g. during local development before .env.local is set up.
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL is missing, or neither " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY nor NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is set. " +
      "Copy .env.local.example to .env.local and fill in your Supabase project keys."
  );
}

/**
 * Supabase browser client. Safe to import in both client and server
 * components. When env vars are not configured, a placeholder client is
 * created so the app can still build/render; callers should check
 * `isSupabaseConfigured` before relying on real data.
 */
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "public-anon-key-placeholder"
);
