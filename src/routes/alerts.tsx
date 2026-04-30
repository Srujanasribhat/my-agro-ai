import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Trash2, Check, AlertTriangle, CloudRain, Leaf, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { useT } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/alerts")({
  head: () => ({ meta: [{ title: "Alerts — AgroAI" }] }),
  component: AlertsPage,
});

type Notif = { id: string; kind: string; title: string; body: string | null; severity: string | null; read: boolean; created_at: string };

function AlertsPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const [items, setItems] = useState<Notif[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate({ to: "/auth" }); return; }
      load();
    });
    const ch = supabase.channel("notifs").on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => load()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [navigate]);

  async function load() {
    const { data } = await supabase.from("notifications").select("id, kind, title, body, severity, read, created_at").order("created_at", { ascending: false });
    setItems((data ?? []) as Notif[]);
  }

  const markAll = async () => {
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    load();
  };
  const clearAll = async () => {
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) return;
    await supabase.from("notifications").delete().eq("user_id", s.session.user.id);
    setItems([]);
    toast.success("Cleared");
  };
  const remove = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setItems((p) => p.filter((x) => x.id !== id));
  };

  const icon = (kind: string) => {
    if (kind === "weather") return <CloudRain className="h-5 w-5" />;
    if (kind === "disease") return <Leaf className="h-5 w-5" />;
    if (kind === "reminder") return <Bell className="h-5 w-5" />;
    return <Info className="h-5 w-5" />;
  };
  const tone = (sev: string | null) => sev === "critical" ? "bg-destructive/10 text-destructive" : sev === "warning" ? "bg-warning/15 text-foreground" : "bg-primary/10 text-primary";

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t.alerts.title}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAll}><Check className="mr-1.5 h-4 w-4" />{t.alerts.markAll}</Button>
            <Button variant="ghost" size="sm" onClick={clearAll}><Trash2 className="mr-1.5 h-4 w-4" />{t.alerts.clear}</Button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <Bell className="mx-auto h-10 w-10 opacity-30" />
            <p className="mt-3 text-sm">{t.alerts.empty}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <div key={n.id} className={`group flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] ${!n.read ? "ring-2 ring-primary/20" : ""}`}>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone(n.severity)}`}>
                  {n.severity === "critical" ? <AlertTriangle className="h-5 w-5" /> : icon(n.kind)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold leading-tight">{n.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
                </div>
                <button onClick={() => remove(n.id)} className="text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}