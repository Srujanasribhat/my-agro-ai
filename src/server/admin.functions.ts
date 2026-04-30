import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getUserRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    return { roles: (data ?? []).map((r: any) => r.role as string), userId };
  });

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    // Verify admin via RLS-aware check
    const { data: roles } = await context.supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin");
    if (!roles || roles.length === 0) {
      return { ok: false as const, error: "Forbidden" };
    }
    // Use admin to bypass RLS for aggregate analytics
    const [{ count: detTotal }, { count: userTotal }, { data: recent }] = await Promise.all([
      supabaseAdmin.from("detections").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("detections").select("id, plant, disease, is_healthy, severity, confidence, created_at, user_id").order("created_at", { ascending: false }).limit(20),
    ]);
    const { data: byDisease } = await supabaseAdmin.from("detections").select("disease, is_healthy");
    const counts = new Map<string, number>();
    (byDisease ?? []).filter((x: any) => !x.is_healthy).forEach((x: any) => counts.set(x.disease, (counts.get(x.disease) ?? 0) + 1));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([disease, count]) => ({ disease, count }));
    return { ok: true as const, totals: { detections: detTotal ?? 0, users: userTotal ?? 0 }, recent: recent ?? [], topDiseases: top };
  });