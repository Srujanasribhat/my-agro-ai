import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  city: z.string().min(1).max(100).optional(),
}).refine((d) => d.city || (d.latitude !== undefined && d.longitude !== undefined), {
  message: "Provide either city or coordinates",
});

type Risk = { disease: string; level: "low" | "medium" | "high"; reason: string };

function analyzeRisks(daily: { temp: number; humidity: number; rain: number; wind: number }[]): Risk[] {
  const avgHum = daily.reduce((s, d) => s + d.humidity, 0) / daily.length;
  const avgTemp = daily.reduce((s, d) => s + d.temp, 0) / daily.length;
  const totalRain = daily.reduce((s, d) => s + d.rain, 0);
  const risks: Risk[] = [];

  if (avgHum > 75 && avgTemp >= 18 && avgTemp <= 28) {
    risks.push({ disease: "Late Blight (fungal)", level: "high", reason: `Humidity ${Math.round(avgHum)}% with mild temps favor fungal spread.` });
  } else if (avgHum > 65) {
    risks.push({ disease: "Powdery Mildew", level: "medium", reason: `Elevated humidity (${Math.round(avgHum)}%) supports mildew.` });
  }
  if (totalRain > 30) {
    risks.push({ disease: "Bacterial Leaf Spot", level: "high", reason: `Heavy rainfall (${Math.round(totalRain)}mm) promotes bacterial splash spread.` });
  } else if (totalRain > 10) {
    risks.push({ disease: "Anthracnose", level: "medium", reason: `Wet conditions (${Math.round(totalRain)}mm rain) increase fungal infection risk.` });
  }
  if (avgTemp > 30 && avgHum < 40) {
    risks.push({ disease: "Spider Mite Outbreak", level: "medium", reason: `Hot & dry (${Math.round(avgTemp)}°C, ${Math.round(avgHum)}% humidity) favors mites.` });
  }
  if (risks.length === 0) {
    risks.push({ disease: "No major risk", level: "low", reason: "Weather conditions are unfavorable for most common crop diseases." });
  }
  return risks;
}

export const getWeatherRisk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Weather API not configured" };

    try {
      let lat = data.latitude, lon = data.longitude, locName = "";
      if (!lat || !lon) {
        const geo = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(data.city!)}&limit=1&appid=${apiKey}`);
        const arr = await geo.json();
        if (!Array.isArray(arr) || arr.length === 0) return { ok: false as const, error: "City not found" };
        lat = arr[0].lat; lon = arr[0].lon;
        locName = `${arr[0].name}${arr[0].country ? ", " + arr[0].country : ""}`;
      }

      // 5-day / 3-hour forecast (free tier)
      const fr = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
      if (!fr.ok) return { ok: false as const, error: `Weather fetch failed (${fr.status})` };
      const forecast = await fr.json();
      if (!locName) locName = `${forecast.city?.name ?? ""}${forecast.city?.country ? ", " + forecast.city.country : ""}`;

      // Group by date
      const byDay = new Map<string, { temps: number[]; hums: number[]; rains: number[]; winds: number[] }>();
      for (const item of forecast.list) {
        const day = item.dt_txt.slice(0, 10);
        if (!byDay.has(day)) byDay.set(day, { temps: [], hums: [], rains: [], winds: [] });
        const b = byDay.get(day)!;
        b.temps.push(item.main.temp);
        b.hums.push(item.main.humidity);
        b.rains.push(item.rain?.["3h"] ?? 0);
        b.winds.push(item.wind?.speed ?? 0);
      }
      const daily = [...byDay.entries()].map(([date, b]) => ({
        date,
        temp: b.temps.reduce((a, c) => a + c, 0) / b.temps.length,
        tempMin: Math.min(...b.temps),
        tempMax: Math.max(...b.temps),
        humidity: b.hums.reduce((a, c) => a + c, 0) / b.hums.length,
        rain: b.rains.reduce((a, c) => a + c, 0),
        wind: b.winds.reduce((a, c) => a + c, 0) / b.winds.length,
      }));

      const risks = analyzeRisks(daily);
      return { ok: true as const, location: locName, daily, risks };
    } catch (err) {
      console.error("weather error", err);
      return { ok: false as const, error: "Weather service unavailable" };
    }
  });