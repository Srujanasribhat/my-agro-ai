import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Upload, Loader2, RotateCcw, Sparkles, Leaf as LeafIcon, AlertTriangle, ShieldCheck, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SiteHeader } from "@/components/site-header";
import { useT } from "@/lib/i18n";
import { predictDisease } from "@/server/predict.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/detect")({
  head: () => ({ meta: [{ title: "Detect — AgroAI" }] }),
  component: DetectPage,
});

type Result = {
  is_plant: boolean;
  plant: string;
  disease: string;
  is_healthy: boolean;
  confidence: number;
  severity: string;
  description: string;
  treatment: string;
  prevention: string;
};

function DetectPage() {
  const { t, lang } = useT();
  const predict = useServerFn(predictDisease);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [saving, setSaving] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => stopCamera(), []);

  const compressToDataUrl = (file: File | Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => { img.src = reader.result as string; };
      reader.onerror = reject;
      img.onload = () => {
        const max = 1024;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onFile = async (f: File | undefined | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Please pick an image"); return; }
    const url = await compressToDataUrl(f);
    setImageDataUrl(url);
    setResult(null);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setCameraOn(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 0);
    } catch {
      toast.error("Camera not available");
    }
  };
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };
  const capture = async () => {
    const v = videoRef.current; if (!v) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), "image/jpeg", 0.9)!);
    stopCamera();
    const url = await compressToDataUrl(blob);
    setImageDataUrl(url);
    setResult(null);
  };

  const analyze = async () => {
    if (!imageDataUrl) return;
    setAnalyzing(true);
    try {
      const res = await predict({ data: { imageDataUrl, language: lang } });
      if (!res.ok) { toast.error(res.error); return; }
      if (!res.result.is_plant) { toast.error("That doesn't look like a leaf. Try another photo."); return; }
      setResult(res.result);
    } catch (err: any) {
      toast.error(err?.message ?? "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const save = async () => {
    if (!result || !imageDataUrl) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Sign in to save scans"); setSaving(false); return; }
    const { error } = await supabase.from("detections").insert({
      user_id: session.user.id,
      image_data_url: imageDataUrl,
      plant: result.plant,
      disease: result.disease,
      is_healthy: result.is_healthy,
      confidence: result.confidence,
      severity: result.severity,
      description: result.description,
      treatment: result.treatment,
      prevention: result.prevention,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(t.result.saved);
      // Auto-create alert for diseased crops
      if (!result.is_healthy) {
        const sev = result.severity === "severe" ? "critical" : result.severity === "moderate" ? "warning" : "info";
        await supabase.from("notifications").insert({
          user_id: session.user.id,
          kind: "disease",
          severity: sev,
          title: `${result.plant}: ${result.disease}`,
          body: `${Math.round(result.confidence)}% confidence — ${result.severity ?? "detected"}. Tap to review treatment.`,
        });
      }
    }
  };

  const reset = () => { setImageDataUrl(null); setResult(null); };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t.detect.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.detect.sub}</p>

        <div className="mt-8 grid gap-6 md:grid-cols-5">
          {/* Capture */}
          <div className="md:col-span-3">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              {cameraOn ? (
                <div className="space-y-4">
                  <video ref={videoRef} autoPlay playsInline className="aspect-video w-full rounded-2xl bg-black object-cover" />
                  <div className="flex gap-2">
                    <Button onClick={capture} className="flex-1 rounded-xl"><Camera className="mr-2 h-4 w-4" />{t.detect.capture}</Button>
                    <Button onClick={stopCamera} variant="outline" className="rounded-xl">{t.detect.stop}</Button>
                  </div>
                </div>
              ) : imageDataUrl ? (
                <div className="space-y-4">
                  <img src={imageDataUrl} alt="leaf" className="aspect-video w-full rounded-2xl object-cover" />
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={analyze} disabled={analyzing} className="flex-1 rounded-xl shadow-[var(--shadow-leaf)]">
                      {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.detect.analyzing}</> : <><Sparkles className="mr-2 h-4 w-4" />{t.detect.analyze}</>}
                    </Button>
                    <Button onClick={reset} variant="outline" className="rounded-xl"><RotateCcw className="mr-2 h-4 w-4" />{t.detect.reset}</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}
                    className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-secondary/40 text-center transition hover:border-primary hover:bg-primary/5"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">{t.detect.drop}</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG • up to 8MB</p>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                  <div className="flex gap-2">
                    <Button onClick={() => fileRef.current?.click()} variant="outline" className="flex-1 rounded-xl">
                      <Upload className="mr-2 h-4 w-4" />Upload
                    </Button>
                    <Button onClick={startCamera} variant="outline" className="flex-1 rounded-xl">
                      <Camera className="mr-2 h-4 w-4" />{t.detect.camera}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Result */}
          <div className="md:col-span-2">
            {result ? (
              <ResultCard result={result} onSave={save} saving={saving} t={t} />
            ) : (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <LeafIcon className="h-10 w-10 opacity-30" />
                <p className="text-sm">{analyzing ? t.detect.analyzing : "Diagnosis appears here"}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ResultCard({ result, onSave, saving, t }: { result: Result; onSave: () => void; saving: boolean; t: ReturnType<typeof useT>["t"] }) {
  const healthy = result.is_healthy;
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${healthy ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>
          {healthy ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{result.plant}</p>
          <h2 className="text-xl font-bold leading-tight">{healthy ? t.result.healthy : result.disease}</h2>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t.result.confidence}</span>
          <span className="font-semibold text-foreground">{Math.round(result.confidence)}%</span>
        </div>
        <Progress value={result.confidence} className="h-2" />
        {!healthy && (
          <p className="text-xs text-muted-foreground">{t.result.severity}: <span className="font-medium capitalize text-foreground">{result.severity}</span></p>
        )}
      </div>

      <Section title={t.result.about}>{result.description}</Section>
      {!healthy && <Section title={t.result.treatment}>{result.treatment}</Section>}
      <Section title={t.result.prevention}>{result.prevention}</Section>

      <Button onClick={onSave} disabled={saving} className="mt-6 w-full rounded-xl">
        <Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : t.result.save}
      </Button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground">{children}</p>
    </div>
  );
}