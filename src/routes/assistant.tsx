import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Mic, MicOff, Trash2, Volume2, VolumeX, Bot, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { useT } from "@/lib/i18n";
import { askAssistant, clearChat } from "@/server/assistant.functions";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — AgroAI" }, { name: "description", content: "Ask AgroAI's voice-enabled assistant about crop diseases, pesticides, and prevention." }] }),
  component: AssistantPage,
});

type Msg = { id: string; role: "user" | "assistant"; content: string };

const langCode = { en: "en-US", hi: "hi-IN", ta: "ta-IN", kn: "kn-IN" } as const;

function AssistantPage() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const ask = useServerFn(askAssistant);
  const clear = useServerFn(clearChat);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const recogRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate({ to: "/auth" }); return; }
      loadHistory();
    });
  }, [navigate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function loadHistory() {
    const { data } = await supabase.from("chat_messages").select("id, role, content").order("created_at", { ascending: true }).limit(50);
    setMessages((data ?? []).filter((m: any) => m.role !== "system").map((m: any) => ({ id: m.id, role: m.role, content: m.content })));
  }

  const speak = (text: string) => {
    if (!speakReplies || typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = langCode[lang];
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Voice input not supported in this browser"); return; }
    const r = new SR();
    r.lang = langCode[lang];
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (ev: any) => {
      const text = ev.results[0][0].transcript;
      setInput(text);
      setListening(false);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start();
    recogRef.current = r;
    setListening(true);
  };
  const stopListening = () => { recogRef.current?.stop(); setListening(false); };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    try {
      const res = await ask({ data: { message: text, language: lang } });
      if (!res.ok) { toast.error(res.error); setBusy(false); return; }
      const reply: Msg = { id: crypto.randomUUID(), role: "assistant", content: res.reply };
      setMessages((m) => [...m, reply]);
      speak(res.reply);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally { setBusy(false); }
  };

  const clearAll = async () => {
    await clear();
    setMessages([]);
    toast.success("Chat cleared");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-soft)" }}>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t.assistant.title}</h1>
            <p className="text-sm text-muted-foreground">{t.assistant.sub}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSpeakReplies((v) => !v)} title="Read replies aloud">
              {speakReplies ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll} title={t.assistant.clear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:p-6" style={{ maxHeight: "60vh", minHeight: "400px" }}>
          {messages.length === 0 && !busy && (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Bot className="h-7 w-7" /></div>
              <p className="max-w-sm text-sm">{t.assistant.empty}</p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Bot className="h-4 w-4" /></div>
              )}
              <div className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"><UserIcon className="h-4 w-4" /></div>
              )}
            </div>
          ))}
          {busy && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Bot className="h-4 w-4" /></div>
              <div className="rounded-2xl bg-secondary px-4 py-2.5 text-sm text-muted-foreground"><Loader2 className="inline h-3.5 w-3.5 animate-spin" /> {t.assistant.thinking}</div>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant={listening ? "destructive" : "outline"} size="icon" className="h-12 w-12 shrink-0 rounded-full" onClick={listening ? stopListening : startListening}>
            {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={t.assistant.placeholder}
            className="flex-1 rounded-full border border-border bg-card px-5 text-sm shadow-[var(--shadow-card)] outline-none ring-primary/30 focus:ring-2"
            disabled={busy}
          />
          <Button onClick={send} disabled={busy || !input.trim()} size="icon" className="h-12 w-12 shrink-0 rounded-full shadow-[var(--shadow-leaf)]">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </main>
    </div>
  );
}