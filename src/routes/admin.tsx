import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, ScanLine, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { getAdminStats } from "@/server/admin.functions";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — AgroAI" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const fetchStats = useServerFn(getAdminStats);
  const [state, setState] = useState<"loading" | "forbidden" | "ok">("loading");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { navigate({ to: "/auth" }); return; }
      const res = await fetchStats();
      if (!res.ok) setState("forbidden");
      else { setStats(res); setState("ok"); }
    });
  }, [navigate, fetchStats]);

  if (state === "loading") return <div className="min-h-screen"><SiteHeader /></div>;

  if (state === "forbidden") return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><ShieldAlert className="h-8 w-8" /></div>
        <h1 className="mt-6 text-2xl font-bold">{t.admin.forbidden}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ask a workspace admin to grant you the admin role.</p>
        <Button asChild className="mt-6 rounded-full"><Link to="/dashboard">Back to dashboard</Link></Button>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-leaf)]"><ShieldCheck className="h-6 w-6" /></div>
          <h1 className="text-4xl font-bold tracking-tight">{t.admin.title}</h1>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Stat icon={Users} label={t.admin.users} value={stats.totals.users} />
          <Stat icon={ScanLine} label={t.admin.scans} value={stats.totals.detections} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h3 className="mb-4 font-semibold">{t.admin.topIssues}</h3>
            {stats.topDiseases.length === 0 ? (
              <p className="text-sm text-muted-foreground">No diseases recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {stats.topDiseases.map((d: any) => (
                  <li key={d.disease} className="flex items-center justify-between rounded-xl bg-secondary/40 px-3 py-2 text-sm">
                    <span className="truncate">{d.disease}</span>
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">{d.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h3 className="mb-4 font-semibold">{t.admin.recent}</h3>
            <ul className="space-y-2">
              {stats.recent.slice(0, 10).map((d: any) => (
                <li key={d.id} className="flex items-center justify-between gap-2 rounded-xl bg-secondary/40 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{d.is_healthy ? "Healthy" : d.disease}</p>
                    <p className="truncate text-xs text-muted-foreground">{d.plant ?? "plant"} • {new Date(d.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${d.is_healthy ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {Math.round(d.confidence)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
        <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-bold">{value}</p></div>
      </div>
    </div>
  );
}