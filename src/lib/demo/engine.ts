/**
 * Rule-based demo engines: panchayat summaries, reliability, advisories, alerts,
 * history and calibration series. Deterministic — no LLM generates advice.
 */
import { cellsIn, coarseAt, panchayats, seededRandom, type CropKey, type Panchayat } from "./data";

export type ReliabilityLevel = "High" | "Medium" | "Low";

export function reliabilityLevel(score: number): ReliabilityLevel {
  return score >= 0.75 ? "High" : score >= 0.58 ? "Medium" : "Low";
}

export function uncertaintyRange(value: number, score: number): [number, number] {
  const spread = Math.max(0.6, value * (1 - score) * 0.55);
  return [Math.max(0, value - spread), value + spread];
}

export interface PanchayatWeather {
  panchayat: Panchayat;
  rainMm: number;
  rainProb: number;
  tempC: number;
  tempMax: number;
  humidity: number;
  windKmh: number;
  reliability: number;
  level: ReliabilityLevel;
  condition: string;
  coarseRainMm: number;
  coarseTempC: number;
  soilMoisture: number; // proxy 0..100
}

const cache = new Map<string, PanchayatWeather>();

export function weatherFor(p: Panchayat): PanchayatWeather {
  const hit = cache.get(p.id);
  if (hit) return hit;
  const cells = cellsIn(p);
  const avg = (k: "rain" | "temp" | "humidity" | "reliability") =>
    cells.reduce((a, c) => a + c.values[k], 0) / Math.max(1, cells.length);
  const rainMm = avg("rain");
  const tempC = avg("temp");
  const humidity = avg("humidity");
  const reliability = avg("reliability");
  const rainProb = Math.min(96, Math.round(18 + rainMm * 1.25));
  const coarse = coarseAt(p.centroid[0], p.centroid[1]);
  const w: PanchayatWeather = {
    panchayat: p,
    rainMm,
    rainProb,
    tempC,
    tempMax: tempC + 3.2,
    humidity,
    windKmh: 9 + (p.centroid[0] / 480) * 14 + rainMm * 0.08,
    reliability,
    level: reliabilityLevel(reliability),
    condition: rainMm > 40 ? "Heavy showers" : rainMm > 22 ? "Moderate rain" : rainMm > 10 ? "Light showers" : "Partly cloudy",
    coarseRainMm: coarse.values.rain,
    coarseTempC: coarse.values.temp,
    soilMoisture: Math.min(95, 35 + rainMm * 0.8),
  };
  cache.set(p.id, w);
  return w;
}

export const allWeather = () => panchayats.map(weatherFor);

export interface Hour {
  time: string;
  tempC: number;
  rainProb: number;
  rainMm: number;
  confidence: number;
}

export function hourlyFor(w: PanchayatWeather): Hour[] {
  const r = seededRandom(w.panchayat.name.length * 97);
  return Array.from({ length: 12 }, (_, i) => {
    const h = 6 + i * 1.5;
    const diurnal = Math.sin(((h - 8) / 14) * Math.PI);
    const storm = Math.exp(-((h - 15) ** 2) / 6);
    const rainMm = (w.rainMm / 6) * storm + r() * 0.4;
    return {
      time: `${String(Math.floor(h)).padStart(2, "0")}:${h % 1 ? "30" : "00"}`,
      tempC: w.tempC - 3 + diurnal * 5 - storm * 2,
      rainProb: Math.min(98, Math.round(w.rainProb * (0.35 + storm * 0.75))),
      rainMm,
      confidence: Math.round((w.reliability - i * 0.012) * 100),
    };
  });
}

export interface Day {
  day: string;
  tempMax: number;
  tempMin: number;
  rainMm: number;
  rainProb: number;
  reliability: number;
}

export function outlookFor(w: PanchayatWeather): Day[] {
  const r = seededRandom(w.panchayat.population);
  const names = ["Today", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
  return names.map((day, i) => {
    const wave = Math.max(0, Math.sin((i + 1) * 0.9));
    const rainMm = Math.max(0, w.rainMm * (i === 1 ? 1.3 : wave * 0.7) + (r() - 0.5) * 4);
    return {
      day,
      tempMax: w.tempMax + (r() - 0.4) * 2 - rainMm * 0.03,
      tempMin: w.tempC - 6 + (r() - 0.5) * 1.5,
      rainMm,
      rainProb: Math.min(95, Math.round(15 + rainMm * 1.3)),
      reliability: Math.max(0.35, w.reliability - i * 0.06),
    };
  });
}

// ---------------- Crop-aware advisory (rule-based) ----------------
export const CROPS: Record<CropKey, { label: string; stages: string[] }> = {
  paddy: { label: "Paddy", stages: ["Nursery", "Transplanting", "Tillering", "Flowering", "Maturity"] },
  groundnut: { label: "Groundnut", stages: ["Sowing", "Vegetative", "Pegging", "Pod filling", "Harvest"] },
  maize: { label: "Maize", stages: ["Sowing", "Vegetative", "Tasseling", "Grain filling", "Harvest"] },
};

export type Priority = "High" | "Medium" | "Low";
export interface Advisory {
  id: string;
  title: string;
  action: string;
  reason: string;
  priority: Priority;
  validity: string;
}

export function advisoryFor(w: PanchayatWeather, crop: CropKey, stage: string): Advisory[] {
  const out: Advisory[] = [];
  const cropName = CROPS[crop].label;
  if (w.rainProb >= 60) {
    out.push({
      id: "spray",
      title: "Delay spraying",
      action: `Postpone pesticide or fertiliser spraying on ${cropName} for the next 24 hours.`,
      reason: `Rain probability is ${w.rainProb}% — chemicals are likely to wash off.`,
      priority: "High",
      validity: "Next 24 hours",
    });
  }
  if (w.rainMm >= 30) {
    out.push({
      id: "drain",
      title: "Check field drainage",
      action:
        crop === "paddy"
          ? "Keep bund outlets open and avoid over-flooding the field."
          : `Clear drainage channels so water does not stand around ${cropName} plants.`,
      reason: `Expected rainfall around ${w.rainMm.toFixed(0)} mm may cause waterlogging.`,
      priority: crop === "groundnut" ? "High" : "Medium",
      validity: "Today – tomorrow",
    });
  }
  if (w.rainProb < 35 && w.soilMoisture < 50) {
    out.push({
      id: "irrigate",
      title: "Consider irrigation",
      action: `Light irrigation is suitable for ${cropName} at the ${stage.toLowerCase()} stage.`,
      reason: "Low rain chance and a dry soil-moisture proxy.",
      priority: "Medium",
      validity: "Next 2 days",
    });
  }
  if (w.tempMax >= 35 && (stage === "Flowering" || stage === "Tasseling" || stage === "Pegging")) {
    out.push({
      id: "heat",
      title: "Protect from heat stress",
      action: "Irrigate in the evening and avoid field work between 12 and 3 pm.",
      reason: `Daytime temperature may reach ${w.tempMax.toFixed(0)}°C during a sensitive stage.`,
      priority: "High",
      validity: "Next 3 days",
    });
  }
  if (w.humidity >= 82 && crop === "paddy") {
    out.push({
      id: "blast",
      title: "Watch for leaf disease",
      action: "Inspect leaves for blast or blight spots; consult the agriculture officer if seen.",
      reason: `High humidity (${w.humidity.toFixed(0)}%) favours fungal disease.`,
      priority: "Medium",
      validity: "This week",
    });
  }
  if ((stage === "Harvest" || stage === "Maturity") && w.rainProb >= 50) {
    out.push({
      id: "harvest",
      title: "Plan harvest timing",
      action: "Harvest mature produce before the rain window or keep tarpaulin cover ready.",
      reason: "Rain on mature crop can cause grain or pod damage.",
      priority: "High",
      validity: "Next 24 hours",
    });
  }
  if (w.level === "Low") {
    out.push({
      id: "uncertain",
      title: "Forecast is uncertain",
      action: "Re-check the forecast this evening before committing to field operations.",
      reason: "Model agreement is low for this Panchayat today.",
      priority: "Low",
      validity: "Today",
    });
  }
  if (!out.length) {
    out.push({
      id: "normal",
      title: "Normal field operations",
      action: `Conditions are suitable for routine ${cropName} work.`,
      reason: "No significant weather risk detected.",
      priority: "Low",
      validity: "Today",
    });
  }
  return out;
}

// ---------------- Risk alerts ----------------
export type AlertCategory = "Heavy Rain" | "Heat Risk" | "Dry Spell" | "High Wind" | "Field Moisture Risk";
export type Severity = "Severe" | "Moderate" | "Watch";
export interface RiskAlert {
  id: string;
  category: AlertCategory;
  severity: Severity;
  panchayat: string;
  period: string;
  confidence: number;
  action: string;
  issued: string;
}

export function buildAlerts(): RiskAlert[] {
  const out: RiskAlert[] = [];
  for (const w of allWeather()) {
    const name = w.panchayat.name;
    const conf = Math.round(w.reliability * 100);
    if (w.rainMm >= 30)
      out.push({ id: `rain-${name}`, category: "Heavy Rain", severity: w.rainMm > 45 ? "Severe" : "Moderate", panchayat: name, period: "Today 1 pm – 8 pm", confidence: conf, action: "Check drainage and delay spraying.", issued: "Today, 06:00" });
    if (w.tempMax >= 35.5)
      out.push({ id: `heat-${name}`, category: "Heat Risk", severity: "Watch", panchayat: name, period: "Next 3 days, 12 – 3 pm", confidence: conf, action: "Irrigate in the evening; rest livestock in shade.", issued: "Today, 06:00" });
    if (w.windKmh >= 20)
      out.push({ id: `wind-${name}`, category: "High Wind", severity: "Watch", panchayat: name, period: "Today afternoon", confidence: conf - 5, action: "Stake young plants; avoid spraying.", issued: "Today, 06:00" });
    if (w.soilMoisture >= 70)
      out.push({ id: `soil-${name}`, category: "Field Moisture Risk", severity: "Moderate", panchayat: name, period: "Next 48 hours", confidence: conf - 3, action: "Avoid heavy machinery in wet fields.", issued: "Today, 06:00" });
    if (w.rainMm < 9)
      out.push({ id: `dry-${name}`, category: "Dry Spell", severity: "Watch", panchayat: name, period: "Next 5 days", confidence: conf - 8, action: "Plan irrigation; mulch to retain moisture.", issued: "Yesterday, 18:00" });
  }
  const order: Record<Severity, number> = { Severe: 0, Moderate: 1, Watch: 2 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
}

export const alertHistory = [
  { date: "29 Sep", title: "Heavy Rain — Melattur", outcome: "Observed 51 mm at Thiruvaiyaru AWS", severity: "Severe" as Severity },
  { date: "26 Sep", title: "High Wind — Ammapettai", outcome: "Gusts recorded up to 34 km/h", severity: "Watch" as Severity },
  { date: "21 Sep", title: "Heat Risk — Okkanadu", outcome: "Max 37.2 °C observed", severity: "Moderate" as Severity },
  { date: "15 Sep", title: "Dry Spell — Pudur", outcome: "Ended with 12 mm rain on 19 Sep", severity: "Watch" as Severity },
];

// ---------------- History (forecast vs observation) ----------------
export interface HistoryRow {
  date: string;
  iso: string;
  forecastTemp: number;
  observedTemp: number;
  forecastRain: number;
  observedRain: number;
}

export function historyFor(p: Panchayat, days = 30): HistoryRow[] {
  const r = seededRandom(p.population + days);
  const base = new Date("2026-10-03T00:00:00Z");
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(base.getTime() - (days - i) * 86400000);
    const season = Math.sin(i / 4) * 1.6;
    const observedTemp = 31 + season + (r() - 0.5) * 2;
    const rainEvent = r() > 0.6 ? r() * 40 : r() * 3;
    return {
      date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      iso: d.toISOString().slice(0, 10),
      observedTemp,
      forecastTemp: observedTemp + (r() - 0.5) * 2.2,
      observedRain: rainEvent,
      forecastRain: Math.max(0, rainEvent + (r() - 0.5) * 10),
    };
  });
}

// ---------------- Local calibration series ----------------
export function calibrationSeries() {
  const r = seededRandom(11);
  return Array.from({ length: 24 }, (_, h) => {
    const observed = 27 + 6 * Math.sin(((h - 7) / 24) * 2 * Math.PI) + (r() - 0.5) * 0.6;
    const forecast = observed + 1.8 + (r() - 0.5) * 1.4; // warm bias in coarse forecast
    const calibrated = observed + (forecast - observed) * 0.3 + (r() - 0.5) * 0.4;
    return { hour: `${String(h).padStart(2, "0")}h`, observed, forecast, calibrated };
  });
}

// ---------------- Admin demo metrics ----------------
export const demoMetrics = [
  { key: "RMSE", label: "RMSE (rain, mm)", value: "6.8", hint: "Root mean square error" },
  { key: "MAE", label: "MAE (rain, mm)", value: "4.1", hint: "Mean absolute error" },
  { key: "Bias", label: "Bias (temp, °C)", value: "+0.3", hint: "Mean signed error" },
  { key: "Corr", label: "Correlation", value: "0.81", hint: "Pearson r vs stations" },
  { key: "CSI", label: "CSI (>10 mm)", value: "0.54", hint: "Critical success index" },
  { key: "FSS", label: "FSS (5 km)", value: "0.68", hint: "Fractions skill score" },
  { key: "PIC", label: "90% PI coverage", value: "87%", hint: "Prediction interval coverage" },
];

export const baselines = [
  { model: "Bilinear", rmse: 9.4, csi: 0.38, fss: 0.49 },
  { model: "Bicubic", rmse: 9.1, csi: 0.4, fss: 0.51 },
  { model: "CNN", rmse: 7.7, csi: 0.47, fss: 0.6 },
  { model: "SUKSHMA", rmse: 6.8, csi: 0.54, fss: 0.68 },
];
