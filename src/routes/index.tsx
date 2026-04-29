import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanLine, Stethoscope, BarChart3, Languages, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { useT } from "@/lib/i18n";
import heroLeaf from "@/assets/hero-leaf.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgroAI – AI Plant Disease Detection for Farmers" },
      { name: "description", content: "Snap a leaf, get instant AI diagnosis, treatment, and prevention. Multilingual crop health for farmers." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useT();
  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {t.hero.tag}
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              {t.hero.title}
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">{t.hero.sub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-6 text-base shadow-[var(--shadow-leaf)]">
                <Link to="/detect">
                  {t.hero.cta} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6 text-base">
                <Link to="/dashboard">{t.hero.cta2}</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-4 rounded-[2rem] opacity-30 blur-3xl"
              style={{ background: "var(--gradient-hero)" }}
            />
            <img
              src={heroLeaf}
              alt="Fresh green leaf with morning dew in a crop field"
              width={1536}
              height={1024}
              className="relative aspect-[4/3] w-full rounded-[2rem] object-cover shadow-[var(--shadow-leaf)] ring-1 ring-border"
            />
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Healthy</p>
                  <p className="font-semibold">98% confidence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="mb-10 text-3xl font-bold tracking-tight md:text-4xl">{t.features.title}</h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { i: ScanLine, ...t.features.a },
            { i: Stethoscope, ...t.features.b },
            { i: BarChart3, ...t.features.c },
            { i: Languages, ...t.features.d },
          ].map((f, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-leaf)]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <f.i className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        AgroAI — Made with 🌱 for growers everywhere.
      </footer>
    </div>
  );
}
