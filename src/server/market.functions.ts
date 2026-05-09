import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

function publicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false } });
}

// ---------- Public reads ----------
export const listCrops = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase.from("crops_kb").select("*").order("crop");
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, items: data ?? [] };
});

export const listChemicals = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase.from("agro_chemicals").select("*").order("name");
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, items: data ?? [] };
});

const PriceQuery = z.object({
  state: z.string().optional(),
  commodity: z.string().optional(),
  limit: z.number().int().min(1).max(500).default(100),
});

export const listMandiPrices = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => PriceQuery.parse(i ?? {}))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    let q = supabase.from("mandi_prices").select("*").order("arrival_date", { ascending: false }).limit(data.limit);
    if (data.state) q = q.ilike("state", data.state);
    if (data.commodity) q = q.ilike("commodity", data.commodity);
    const { data: rows, error } = await q;
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, items: rows ?? [] };
  });

// ---------- Live refresh from data.gov.in ----------
const RefreshInput = z.object({
  state: z.string().optional(),
  commodity: z.string().optional(),
  limit: z.number().int().min(1).max(2000).default(500),
});

export const refreshMandiPrices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => RefreshInput.parse(i ?? {}))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.DATA_GOV_IN_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Live data not configured" };
    if (apiKey.length < 30) {
      return { ok: false as const, error: "Invalid data.gov.in API key (too short). Please update DATA_GOV_IN_API_KEY with a valid key from https://data.gov.in/user/register" };
    }

    const RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070"; // daily mandi prices
    const params = new URLSearchParams({
      "api-key": apiKey,
      format: "json",
      limit: String(data.limit),
    });
    // data.gov.in filters are case-sensitive; capitalize first letter as a best effort.
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    if (data.state) params.append("filters[state]", cap(data.state.trim()));
    if (data.commodity) params.append("filters[commodity]", cap(data.commodity.trim()));

    try {
      const res = await fetch(`https://api.data.gov.in/resource/${RESOURCE}?${params.toString()}`);
      const text = await res.text();
      let json: any = {};
      try { json = JSON.parse(text); } catch { /* non-json */ }
      if (!res.ok) {
        const msg = json?.error || text?.slice(0, 200) || `HTTP ${res.status}`;
        return { ok: false as const, error: `data.gov.in: ${msg}` };
      }
      const records: any[] = Array.isArray(json?.records) ? json.records : [];
      if (records.length === 0) {
        return { ok: false as const, error: "No records returned. Check spelling of state/commodity (case-sensitive, e.g. 'Karnataka', 'Tomato'), or try without filters." };
      }

      const parseDate = (s?: string) => {
        if (!s) return null;
        const m = s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
        if (m) return `${m[3]}-${m[2]}-${m[1]}`;
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
      };

      const rows = records
        .map((r) => ({
          state: String(r.state ?? "").trim(),
          district: r.district ? String(r.district).trim() : null,
          market: String(r.market ?? "").trim(),
          commodity: String(r.commodity ?? "").trim(),
          variety: r.variety ? String(r.variety).trim() : null,
          min_price: r.min_price ? Number(r.min_price) : null,
          max_price: r.max_price ? Number(r.max_price) : null,
          modal_price: r.modal_price ? Number(r.modal_price) : null,
          arrival_date: parseDate(r.arrival_date) ?? new Date().toISOString().slice(0, 10),
          unit: "Quintal",
        }))
        .filter((r) => r.state && r.market && r.commodity);

      // Use service-role-equivalent via authed user only if admin? Simpler: use request supabase client (RLS allows admin write).
      const { supabase } = context;
      // upsert in batches of 200
      let inserted = 0;
      for (let i = 0; i < rows.length; i += 200) {
        const batch = rows.slice(i, i + 200);
        const { error } = await supabase
          .from("mandi_prices")
          .upsert(batch, { onConflict: "state,market,commodity,variety,arrival_date", ignoreDuplicates: true });
        if (error) return { ok: false as const, error: error.message, inserted };
        inserted += batch.length;
      }
      return { ok: true as const, inserted };
    } catch (e: any) {
      console.error("refreshMandiPrices failed", e);
      return { ok: false as const, error: "Refresh failed" };
    }
  });