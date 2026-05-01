import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      let lat = data.latitude, lon = data.longitude, locName = "";

      // Geocode city → coords using Open-Meteo (no API key required)
      if (lat === undefined || lon === undefined) {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(data.city!)}&count=1&language=en&format=json`);
        if (!geoRes.ok) return { ok: false as const, error: `Geocoding failed (${geoRes.status})` };
        const geo = await geoRes.json();
        const r = geo?.results?.[0];
        if (!r) return { ok: false as const, error: "City not found" };
        lat = r.latitude; lon = r.longitude;
        locName = [r.name, r.admin1, r.country].filter(Boolean).join(", ");
      } else {
        // Reverse geocode for a friendly name (best-effort)
        try {
          const rev = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&format=json`);
          if (rev.ok) {
            const j = await rev.json();
            const r = j?.results?.[0];
            if (r) locName = [r.name, r.admin1, r.country].filter(Boolean).join(", ");
          }
        } catch { /* non-fatal */ }
        if (!locName) locName = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
      }

      // Forecast: daily aggregates for 5 days
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum,wind_speed_10m_max&forecast_days=5&timezone=auto`;
      const fr = await fetch(url);
      if (!fr.ok) return { ok: false as const, error: `Weather fetch failed (${fr.status})` };
      const f = await fr.json();
      const d = f.daily;
      if (!d || !Array.isArray(d.time)) return { ok: false as const, error: "No forecast data" };

      const daily = d.time.map((date: string, i: number) => ({
        date,
        temp: d.temperature_2m_mean?.[i] ?? ((d.temperature_2m_max[i] + d.temperature_2m_min[i]) / 2),
        tempMin: d.temperature_2m_min[i],
        tempMax: d.temperature_2m_max[i],
        humidity: d.relative_humidity_2m_mean?.[i] ?? 60,
        rain: d.precipitation_sum?.[i] ?? 0,
        wind: (d.wind_speed_10m_max?.[i] ?? 0) / 3.6, // km/h → m/s
      }));

      const risks = analyzeRisks(daily);
      return { ok: true as const, location: locName, daily, risks };
    } catch (err) {
      console.error("weather error", err);
      return { ok: false as const, error: "Weather service unavailable" };
    }
  });