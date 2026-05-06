import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({
  message: z.string().min(1).max(2000),
  language: z.enum(["en", "hi", "ta", "kn", "te", "mr", "bn", "gu", "pa", "ml", "or"]).default("en"),
});

const langName: Record<string, string> = {
  en: "English",
  hi: "Hindi (हिन्दी)",
  ta: "Tamil (தமிழ்)",
  kn: "Kannada (ಕನ್ನಡ)",
  te: "Telugu (తెలుగు)",
  mr: "Marathi (मराठी)",
  bn: "Bengali (বাংলা)",
  gu: "Gujarati (ગુજરાતી)",
  pa: "Punjabi (ਪੰਜਾਬੀ)",
  ml: "Malayalam (മലയാളം)",
  or: "Odia (ଓଡ଼ିଆ)",
};

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI not configured" };

    const { supabase, userId } = context;

    // Build context: profile (crops/location) + recent detections + last 10 messages
    const [{ data: profile }, { data: recent }, { data: history }] = await Promise.all([
      supabase.from("profiles").select("display_name, crops, location").eq("id", userId).maybeSingle(),
      supabase.from("detections").select("plant, disease, is_healthy, severity, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("chat_messages").select("role, content").order("created_at", { ascending: false }).limit(10),
    ]);

    const recentText = (recent ?? []).map((d: any) =>
      `- ${new Date(d.created_at).toLocaleDateString()}: ${d.plant ?? "plant"} — ${d.is_healthy ? "healthy" : `${d.disease} (${d.severity ?? "?"})`}`
    ).join("\n") || "No recent scans.";

    const crops = (profile?.crops ?? []).join(", ") || "unknown";
    const location = profile?.location || "unknown";

    const replyLang = langName[data.language] ?? "English";
    const sys = `You are AgroAI — a senior agronomist and plant pathologist with 20+ years of field experience advising Indian farmers.

RESPONSE LANGUAGE: Reply ONLY in ${replyLang}. Use simple, farmer-friendly vocabulary. Keep scientific names and product names in English/Latin; everything else in ${replyLang}. Never mix languages otherwise.

ACCURACY RULES:
- Base advice on established agronomy science (ICAR, FAO, state agricultural universities).
- For diseases: name the pathogen, list 2-3 key symptoms, environmental triggers, and your confidence (low/medium/high).
- For treatments: provide BOTH organic/IPM options AND specific chemical options. For each chemical: active ingredient, exact dose (per litre or per acre), spray interval, pre-harvest interval (PHI), and PPE.
- Use concrete numbers (e.g. "2 ml per litre", "250 g per acre"). Never use vague phrases.
- If the question lacks information, ask ONE focused clarifying question instead of guessing.
- Never invent product brands, prices, or studies. If unsure, say so honestly.

FORMAT (Markdown):
- Lead with a one-line direct answer.
- Use **bold** for key terms, bullet lists for symptoms/causes, numbered steps for treatment plans.
- End with "⚠️ Safety:" one-liner whenever chemicals are mentioned.

FARMER CONTEXT:
- Name: ${profile?.display_name || "Farmer"}
- Crops grown: ${crops}
- Location: ${location}
- Recent leaf scans:\n${recentText}

Personalize using this context. If the question relates to a recent scan, reference that disease by name.`;

    const messages: { role: string; content: string }[] = [{ role: "system", content: sys }];
    // Reverse to chronological
    (history ?? []).slice().reverse().forEach((m: any) => messages.push({ role: m.role, content: m.content }));
    messages.push({ role: "user", content: data.message });

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "google/gemini-2.5-pro", messages, temperature: 0.3 }),
      });
      if (res.status === 429) return { ok: false as const, error: "Rate limit reached. Try again in a minute." };
      if (res.status === 402) return { ok: false as const, error: "AI credits exhausted." };
      if (!res.ok) return { ok: false as const, error: "AI request failed" };
      const json = await res.json();
      const reply: string = json?.choices?.[0]?.message?.content ?? "(no reply)";

      // Persist both messages
      await supabase.from("chat_messages").insert([
        { user_id: userId, role: "user", content: data.message },
        { user_id: userId, role: "assistant", content: reply },
      ]);

      return { ok: true as const, reply };
    } catch (err) {
      console.error("askAssistant failed", err);
      return { ok: false as const, error: "Unexpected error" };
    }
  });

export const clearChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase.from("chat_messages").delete().eq("user_id", userId);
    return { ok: true as const };
  });