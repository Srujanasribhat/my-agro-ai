import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { useT } from "@/lib/i18n";
import { Sprout, Droplets, Sun, Bug, Recycle, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/tips")({
  head: () => ({ meta: [{ title: "Farmer tips — AgroAI" }] }),
  component: TipsPage,
});

const TIPS = [
  { i: Sprout, t: "Crop rotation", d: "Rotate crop families every season to break disease cycles in the soil." },
  { i: Droplets, t: "Water at the base", d: "Avoid wetting foliage; damp leaves invite fungal infections." },
  { i: Sun, t: "Morning watering", d: "Water early so plants dry by night, reducing mildew risk." },
  { i: Bug, t: "Scout weekly", d: "Inspect underside of leaves for early signs of pests and spots." },
  { i: Recycle, t: "Healthy compost", d: "Use mature compost only — fresh material spreads pathogens." },
  { i: ShieldCheck, t: "Sanitize tools", d: "Clean pruners with diluted bleach between plants to stop spread." },
];

function TipsPage() {
  const { t } = useT();
  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t.tips.title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Simple, proven practices that prevent most crop diseases before they start.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TIPS.map((x, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><x.i className="h-5 w-5" /></div>
              <h3 className="font-semibold">{x.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{x.d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}