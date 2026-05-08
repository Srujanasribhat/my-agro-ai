import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({
  imageDataUrl: z.string().min(50).max(8_000_000),
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

export const predictDisease = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "AI service not configured" };
    }

    const systemPrompt = `You are AgroAI, an expert plant pathologist. Analyze the provided leaf image and return ONLY valid JSON (no markdown, no commentary) with this exact shape:
{
  "is_plant": boolean,
  "plant": string,
  "disease": string,
  "is_healthy": boolean,
  "confidence": number (0-100),
  "severity": "none" | "mild" | "moderate" | "severe",
  "description": string (2-3 sentences explaining the condition),
  "treatment": string (3-5 concrete steps, newline separated, organic & chemical options),
  "prevention": string (3-5 concrete preventive measures, newline separated)
}
If the image is not a plant/leaf, set is_plant=false and disease="Not a plant image".
Write all human-readable string fields in ${langName[data.language]}. Keep field keys in English.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: "Diagnose this leaf." },
                { type: "image_url", image_url: { url: data.imageDataUrl } },
              ],
            },
          ],
        }),
      });

      if (res.status === 429) return { ok: false as const, error: "Rate limit reached. Try again in a minute." };
      if (res.status === 402) return { ok: false as const, error: "AI credits exhausted. Add credits to continue." };
      if (!res.ok) {
        const text = await res.text();
        console.error("AI error", res.status, text);
        return { ok: false as const, error: "AI request failed" };
      }

      const json = await res.json();
      const content: string = json?.choices?.[0]?.message?.content ?? "";
      const cleaned = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/g, "").trim();
      let parsed: any;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const m = cleaned.match(/\{[\s\S]*\}/);
        if (!m) return { ok: false as const, error: "Could not parse AI response" };
        parsed = JSON.parse(m[0]);
      }

      return {
        ok: true as const,
        result: {
          is_plant: Boolean(parsed.is_plant ?? true),
          plant: String(parsed.plant ?? "Unknown"),
          disease: String(parsed.disease ?? "Unknown"),
          is_healthy: Boolean(parsed.is_healthy ?? false),
          confidence: Math.max(0, Math.min(100, Number(parsed.confidence ?? 0))),
          severity: String(parsed.severity ?? "none"),
          description: String(parsed.description ?? ""),
          treatment: String(parsed.treatment ?? ""),
          prevention: String(parsed.prevention ?? ""),
        },
      };
    } catch (err) {
      console.error("predictDisease failed", err);
      return { ok: false as const, error: "Unexpected error analyzing image" };
    }
  });