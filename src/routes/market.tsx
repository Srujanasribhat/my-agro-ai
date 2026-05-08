import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RefreshCw, Search, TrendingUp, Leaf, FlaskConical } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listMandiPrices, refreshMandiPrices, listCrops, listChemicals } from "@/server/market.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Market & Knowledge — AgroAI" },
      { name: "description", content: "Live mandi prices, crop knowledge base, and agro-chemical catalog for Indian farmers." },
    ],
  }),
  component: MarketPage,
});

type Price = { id: string; state: string; district: string | null; market: string; commodity: string; variety: string | null; min_price: number | null; max_price: number | null; modal_price: number | null; arrival_date: string; unit: string };
type Crop = { id: string; crop: string; scientific_name: string | null; season: string | null; common_diseases: string[]; common_pests: string[]; soil: string | null; water_needs: string | null; notes: string | null };
type Chem = { id: string; name: string; active_ingredient: string; type: string; target: string[]; dose_per_litre: string | null; dose_per_acre: string | null; phi_days: number | null; safety_class: string | null; ppe: string | null; notes: string | null };

function MarketPage() {
  const fetchPrices = useServerFn(listMandiPrices);
  const refresh = useServerFn(refreshMandiPrices);
  const fetchCrops = useServerFn(listCrops);
  const fetchChems = useServerFn(listChemicals);

  const [state, setState] = useState("");
  const [commodity, setCommodity] = useState("");
  const [prices, setPrices] = useState<Price[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [chems, setChems] = useState<Chem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [p, c, ch] = await Promise.all([
      fetchPrices({ data: { state: state || undefined, commodity: commodity || undefined, limit: 100 } }),
      fetchCrops(),
      fetchChems(),
    ]);
    if (p.ok) setPrices(p.items as Price[]);
    if (c.ok) setCrops(c.items as Crop[]);
    if (ch.ok) setChems(ch.items as Chem[]);
    setLoading(false);
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, []);

  const onRefresh = async () => {
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) {
      toast.error("Please sign in to refresh live prices.");
      return;
    }
    setRefreshing(true);
    const r = await refresh({ data: { state: state || undefined, commodity: commodity || undefined, limit: 500 } });
    setRefreshing(false);
    if (!r.ok) { toast.error(r.error || "Refresh failed"); return; }
    toast.success(`Loaded ${r.inserted} fresh price rows`);
    await loadAll();
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold tracking-tight">Market & Knowledge</h1>
          <p className="mt-1 text-muted-foreground">Live mandi prices, crop reference, and pesticide catalog.</p>
        </div>

        <Tabs defaultValue="prices">
          <TabsList>
            <TabsTrigger value="prices"><TrendingUp className="mr-1.5 h-4 w-4" /> Mandi Prices</TabsTrigger>
            <TabsTrigger value="crops"><Leaf className="mr-1.5 h-4 w-4" /> Crops</TabsTrigger>
            <TabsTrigger value="chems"><FlaskConical className="mr-1.5 h-4 w-4" /> Agro-Chemicals</TabsTrigger>
          </TabsList>

          <TabsContent value="prices" className="mt-4 space-y-4">
            <Card className="p-4">
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
                <Input placeholder="State (e.g. Karnataka)" value={state} onChange={(e) => setState(e.target.value)} />
                <Input placeholder="Commodity (e.g. Tomato)" value={commodity} onChange={(e) => setCommodity(e.target.value)} />
                <Button variant="secondary" onClick={loadAll} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span className="ml-1.5">Search</span>
                </Button>
                <Button onClick={onRefresh} disabled={refreshing}>
                  {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span className="ml-1.5">Refresh live</span>
                </Button>
              </div>
            </Card>

            {prices.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                No price data yet. Click <strong>Refresh live</strong> to fetch from data.gov.in.
              </Card>
            ) : (
              <Card className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Commodity</th>
                      <th className="px-3 py-2 text-left">Variety</th>
                      <th className="px-3 py-2 text-left">Market</th>
                      <th className="px-3 py-2 text-left">State</th>
                      <th className="px-3 py-2 text-right">Min</th>
                      <th className="px-3 py-2 text-right">Modal</th>
                      <th className="px-3 py-2 text-right">Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((p) => (
                      <tr key={p.id} className="border-t border-border/50">
                        <td className="px-3 py-2">{p.arrival_date}</td>
                        <td className="px-3 py-2 font-medium">{p.commodity}</td>
                        <td className="px-3 py-2 text-muted-foreground">{p.variety || "—"}</td>
                        <td className="px-3 py-2">{p.market}</td>
                        <td className="px-3 py-2 text-muted-foreground">{p.state}</td>
                        <td className="px-3 py-2 text-right">{p.min_price ?? "—"}</td>
                        <td className="px-3 py-2 text-right font-semibold text-primary">{p.modal_price ?? "—"}</td>
                        <td className="px-3 py-2 text-right">{p.max_price ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-border/50 px-3 py-2 text-xs text-muted-foreground">
                  Prices in ₹ per Quintal. Source: data.gov.in (Agmarknet).
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="crops" className="mt-4">
            <div className="grid gap-3 md:grid-cols-2">
              {crops.map((c) => (
                <Card key={c.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-display text-lg font-semibold">{c.crop}</div>
                      <div className="text-xs italic text-muted-foreground">{c.scientific_name}</div>
                    </div>
                    {c.season && <Badge variant="secondary">{c.season}</Badge>}
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    {c.common_diseases?.length > 0 && (
                      <div><span className="text-muted-foreground">Diseases: </span>{c.common_diseases.join(", ")}</div>
                    )}
                    {c.common_pests?.length > 0 && (
                      <div><span className="text-muted-foreground">Pests: </span>{c.common_pests.join(", ")}</div>
                    )}
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {c.soil && <span>Soil: {c.soil}</span>}
                      {c.water_needs && <span>Water: {c.water_needs}</span>}
                    </div>
                    {c.notes && <p className="text-xs text-muted-foreground">{c.notes}</p>}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chems" className="mt-4">
            <div className="grid gap-3 md:grid-cols-2">
              {chems.map((c) => (
                <Card key={c.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-display text-base font-semibold">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.active_ingredient} · {c.type}</div>
                    </div>
                    {c.safety_class && (
                      <Badge variant={c.safety_class.startsWith("Red") ? "destructive" : c.safety_class.startsWith("Blue") ? "default" : "secondary"}>
                        {c.safety_class.split(" ")[0]}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {c.dose_per_litre && <div><span className="text-muted-foreground">Dose: </span>{c.dose_per_litre}</div>}
                    {c.dose_per_acre && <div><span className="text-muted-foreground">Per acre: </span>{c.dose_per_acre}</div>}
                    {c.phi_days != null && <div><span className="text-muted-foreground">PHI: </span>{c.phi_days} days</div>}
                    {c.ppe && <div className="col-span-2"><span className="text-muted-foreground">PPE: </span>{c.ppe}</div>}
                  </div>
                  {c.target?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.target.slice(0, 6).map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                    </div>
                  )}
                  {c.notes && <p className="mt-2 text-xs text-muted-foreground">⚠️ {c.notes}</p>}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}