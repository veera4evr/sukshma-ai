/**
 * Service layer. Every screen reads data through these functions.
 * Today they resolve DEMO data; swap each body for a fetch to the real
 * FastAPI endpoints (/api/weather, /api/downscale, …) without touching UI code.
 */
import { panchayats, fineGrid, coarseGrid, stations } from "@/lib/demo/data";
import {
  weatherFor,
  allWeather,
  hourlyFor,
  outlookFor,
  advisoryFor,
  buildAlerts,
  historyFor,
  calibrationSeries,
  demoMetrics,
  baselines,
} from "@/lib/demo/engine";
import type { CropKey } from "@/lib/demo/data";

export const DATA_SOURCE = "demo" as const;

const byId = (id: string) => panchayats.find((p) => p.id === id) ?? panchayats[0]!;

export const api = {
  panchayats: () => panchayats,
  weather: (id: string) => weatherFor(byId(id)),
  allWeather,
  hourly: (id: string) => hourlyFor(weatherFor(byId(id))),
  outlook: (id: string) => outlookFor(weatherFor(byId(id))),
  downscale: () => ({ fine: fineGrid, coarse: coarseGrid, resolution: "1 km target grid" }),
  calibration: () => ({ stations, series: calibrationSeries() }),
  advisory: (id: string, crop: CropKey, stage: string) => advisoryFor(weatherFor(byId(id)), crop, stage),
  alerts: buildAlerts,
  history: (id: string, days = 30) => historyFor(byId(id), days),
  metrics: () => ({ metrics: demoMetrics, baselines, label: "Prototype / Demo Metrics" }),
};

export const DEFAULT_PANCHAYAT = "tirupalanam";
