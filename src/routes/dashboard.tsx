import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { ScanLine, Activity, ShieldCheck, AlertTriangle, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — AgroAI" }] }),
  component: Dashboard,
});

type Detection = {
  id: string; plant: string | null; disease: string; is_healthy: boolean;
  confidence: number; severity: string | null; created_at: string; image_data_url: string | null;
};

function Dashboard() {
  const { t } = useT();
  const navigate = useNavigate();
  const [items, setItems] = useState<Detection[] | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) { setAuthed(false); navigate({ to: "/auth" }); }
      else { setAuthed(true); load(); }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { setAuthed(false); navigate({ to: "/auth" }); }
      else { setAuthed(true); load(); }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function load() {
    const { data, error } = await supabase
      .from("detections")
      .select("id,plant,disease,is_healthy,confidence,severity,created_at,image_data_url")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems(data ?? []);
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from("detections").delete().eq("id", id);
    if (error) toast.error(error.message);
    else setItems((p) => p?.filter((x) => x.id !== id) ?? null);
  };

  const stats = useMemo(() => {
    const list = items ?? [];
    const total = list.length;
    const diseased = list.filter((x) => !x.is_healthy).length;
    const healthy = total - diseased;
    const counts = new Map<string, number>();
    list.filter((x) => !x.is_healthy).forEach((x) => counts.set(x.disease, (counts.get(x.disease) ?? 0) + 1));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const breakdown = [...counts.entries()].map(([name, value]) => ({ name, value })).slice(0, 6);

    // Trend by day (last 14 days)
    const days = 14;
    const trend: { day: string; scans: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const n = list.filter((x) => x.created_at.slice(0, 10) === key).length;
      trend.push({ day: label, scans: n });
    }
    return { total, diseased, healthy, top, breakdown, trend };
  }, [items]);

  if (authed === null) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t.dash.title}</h1>
          </div>
          <Button asChild className="rounded-full"><Link to="/detect">+ New scan</Link></Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={ScanLine} label={t.dash.total} value={stats.total} tone="primary" />
          <Stat icon={ShieldCheck} label={t.dash.healthy} value={stats.healthy} tone="success" />
          <Stat icon={AlertTriangle} label={t.dash.diseased} value={stats.diseased} tone="destructive" />
          <Stat icon={Activity} label={t.dash.topDisease} value={stats.top} tone="accent" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] lg:col-span-3">
            <h3 className="mb-4 font-semibold">{t.dash.trend}</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={stats.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 120)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.03 150)" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="oklch(0.5 0.03 150)" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.02 120)" }} />
                  <Bar dataKey="scans" fill="oklch(0.52 0.16 148)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] lg:col-span-2">
            <h3 className="mb-4 font-semibold">{t.dash.breakdown}</h3>
            <div className="h-64">
              {stats.breakdown.length ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={stats.breakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                      {stats.breakdown.map((_, i) => (
                        <Cell key={i} fill={["oklch(0.52 0.16 148)","oklch(0.72 0.18 145)","oklch(0.78 0.16 80)","oklch(0.58 0.22 27)","oklch(0.6 0.118 184)","oklch(0.65 0.18 145)"][i % 6]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.02 120)" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No diseases recorded yet</div>
              )}
            </div>
          </div>
        </div>

        <h2 className="mt-10 mb-4 text-xl font-semibold">{t.dash.recent}</h2>
        {items && items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">{t.dash.empty}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(items ?? []).map((d) => (
              <div key={d.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
                {d.image_data_url && <img src={d.image_data_url} alt={d.disease} className="h-40 w-full object-cover" />}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground">{d.plant ?? "Plant"}</p>
                      <p className="truncate font-semibold">{d.is_healthy ? t.result.healthy : d.disease}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${d.is_healthy ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>
                      {Math.round(d.confidence)}%
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(d.created_at).toLocaleDateString()}</span>
                    <button onClick={() => remove(d.id)} className="rounded-md p-1 transition hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number | string; tone: "primary" | "success" | "destructive" | "accent" }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    destructive: "bg-destructive/10 text-destructive",
    accent: "bg-accent/20 text-accent-foreground",
  } as const;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}