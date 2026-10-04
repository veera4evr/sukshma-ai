import { createFileRoute } from "@tanstack/react-router";
import { api, DEFAULT_PANCHAYAT } from "@/lib/services/api";
import type { CropKey } from "@/lib/demo/data";

// Demo REST surface mirroring the planned FastAPI routes. Returns structured demo data.
export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("panchayat") ?? DEFAULT_PANCHAYAT;
        const name = (params as { _splat?: string })._splat ?? "";
        const strip = <T extends { panchayat?: unknown }>(w: T) => ({ ...w, panchayat: undefined });
        const routes: Record<string, () => unknown> = {
          weather: () => strip(api.weather(id)),
          panchayats: () => api.panchayats().map(({ polygon, ...p }) => ({ ...p, vertices: polygon.length })),
          downscale: () => {
            const d = api.downscale();
            return { resolution: d.resolution, fineCells: d.fine.length, coarseCells: d.coarse.length };
          },
          calibration: () => api.calibration(),
          reliability: () => {
            const w = api.weather(id);
            return { panchayat: id, score: w.reliability, level: w.level };
          },
          advisory: () =>
            api.advisory(id, (url.searchParams.get("crop") as CropKey) ?? "paddy", url.searchParams.get("stage") ?? "Tillering"),
          alerts: () => api.alerts(),
          history: () => api.history(id),
        };
        const fn = routes[name];
        if (!fn) return Response.json({ error: "Not found", available: Object.keys(routes) }, { status: 404 });
        return Response.json({ source: "demo", data: fn() });
      },
    },
  },
});
