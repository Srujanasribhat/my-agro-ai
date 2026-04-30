import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CloudRain, Wind, Droplets, Thermometer, MapPin, AlertTriangle, ShieldCheck, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { useT } from "@/lib/i18n";
import { getWeatherRisk } from "@/server/weather.functions";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/weather")({
  head: () => ({ meta: [{ title: "Weather Risk — AgroAI" }, { name: "description", content: "5-day weather-based crop disease risk forecast for farmers." }] }),
  component: WeatherPage,
});

type Risk = { disease: string; level: "low" | "medium" | "high"; reason: string };
type Day = { date: string; temp: number; tempMin: number; tempMax: number; humidity: number; rain: number; wind: number };

function WeatherPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const fetchRisk = useServerFn(getWeatherRisk);
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<{ location: string; daily: Day[]; risks: Risk[] } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: s }) => {
      if (!s.session) { navigate({ to: "/auth" }); return; }
      const { data: profile } = await supabase.from("profiles").select("location").eq("id", s.session.user.id).maybeSingle();
      if (profile?.location) { setCity(profile.location); run(profile.location); }
    });
  }, [navigate]);

  async function run(c?: string, lat?: number, lon?: number) {
    setBusy(true);
    try {
      const res = await fetchRisk({ data: lat !== undefined ? { latitude: lat, longitude: lon } : { city: c ?? city } });
      if (!res.ok) { toast.error(res.error); return; }
      setData({ location: res.location, daily: res.daily, risks: res.risks });
      // Generate notification for high-risk
      const high = res.risks.filter((r) => r.level === "high");
      if (high.length > 0) {
        const { data: s } = await supabase.auth.getSession();
        if (s.session) {
          await supabase.from("notifications").insert(high.map((r) => ({
            user_id: s.session!.user.id,
            kind: "weather", severity: "warning",
            title: `High risk: ${r.disease}`,
            body: r.reason,
          })));
        }
      }
    } finally { setBusy(false); }
  }

  const useGps = () => {
    if (!navigator.geolocation) { toast.error("GPS not available"); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => run(undefined, p.coords.latitude, p.coords.longitude),
      () => toast.error("Could not get location"),
      { timeout: 8000 }
    );
  };

  const riskColor = (l: Risk["level"]) => l === "high" ? "bg-destructive/10 text-destructive border-destructive/30" : l === "medium" ? "bg-warning/15 text-foreground border-warning/30" : "bg-success/15 text-success border-success/30";

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t.weather.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.weather.sub}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 shadow-[var(--shadow-card)]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={city} onChange={(e) => setCity(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} placeholder={t.weather.city} className="h-12 flex-1 bg-transparent text-sm outline-none" />
          </div>
          <Button onClick={() => run()} disabled={busy || !city.trim()} className="h-12 rounded-full px-5">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t.weather.check}
          </Button>
          <Button onClick={useGps} variant="outline" className="h-12 rounded-full px-5"><MapPin className="mr-2 h-4 w-4" />{t.weather.gps}</Button>
        </div>

        {data && (
          <>
            <div className="mt-8">
              <p className="text-sm text-muted-foreground">{data.location}</p>
              <h2 className="mt-1 text-xl font-semibold">{t.weather.forecast}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {data.daily.slice(0, 5).map((d) => (
                  <div key={d.date} className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                    <p className="text-xs font-medium text-muted-foreground">{new Date(d.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{Math.round(d.temp)}°</span>
                      <span className="text-xs text-muted-foreground">{Math.round(d.tempMin)}/{Math.round(d.tempMax)}</span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5"><Droplets className="h-3 w-3" /> {Math.round(d.humidity)}%</p>
                      <p className="flex items-center gap-1.5"><CloudRain className="h-3 w-3" /> {d.rain.toFixed(1)} mm</p>
                      <p className="flex items-center gap-1.5"><Wind className="h-3 w-3" /> {d.wind.toFixed(1)} m/s</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold">{t.weather.risks}</h2>
              <div className="mt-3 space-y-3">
                {data.risks.map((r, i) => (
                  <div key={i} className={`flex gap-3 rounded-2xl border p-4 ${riskColor(r.level)}`}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/60">
                      {r.level === "high" || r.level === "medium" ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">{r.disease}</p>
                        <span className="rounded-full bg-background/60 px-2 py-0.5 text-xs font-medium uppercase">{r.level}</span>
                      </div>
                      <p className="mt-1 text-sm opacity-90">{r.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!data && !busy && (
          <div className="mt-10 rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <Thermometer className="mx-auto h-10 w-10 opacity-30" />
            <p className="mt-3 text-sm">Enter a city or use GPS to get a 5-day disease-risk forecast.</p>
          </div>
        )}
      </main>
    </div>
  );
}