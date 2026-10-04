import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { MeshMap, Legend, LAYERS } from "@/components/app/MeshMap";
import { PageHeader, Panel, ReliabilityBadge, DemoTag } from "@/components/app/widgets";
import { MeshTriptych, CalibrationSection, ReliabilitySection } from "@/components/app/sections";
import { api, DEFAULT_PANCHAYAT } from "@/lib/services/api";
import type { LayerKey } from "@/lib/demo/data";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Panchayat Weather Map — SUKSHMA-AI" },
      { name: "description", content: "Interactive 1 km target-grid weather map with rainfall, temperature, humidity, reliability and delta layers." },
      { property: "og:title", content: "Panchayat Weather Map — SUKSHMA-AI" },
      { property: "og:description", content: "Explore downscaled weather across Panchayat boundaries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WeatherPage,
});

function WeatherPage() {
  const [layer, setLayer] = useState<LayerKey>("rain");
  const [sel, setSel] = useState<string | null>(DEFAULT_PANCHAYAT);
  const w = sel ? api.weather(sel) : null;
  const adv = sel ? api.advisory(sel, "paddy", "Tillering")[0] : null;
  const risk = w ? (w.rainMm >= 30 ? "Heavy rain" : w.tempMax >= 35.5 ? "Heat stress" : w.rainMm < 9 ? "Dry spell" : "Low") : "";

  return (
    <AppShell>
      <PageHeader eyebrow="Hero feature" title="Panchayat Weather Map" description="Tap a Panchayat to see its local forecast, reliability and recommended action." />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Panel>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <ToggleGroup type="single" value={layer} onValueChange={(v) => v && setLayer(v as LayerKey)} className="flex-wrap justify-start">
              {(Object.keys(LAYERS) as LayerKey[]).map((k) => (
                <ToggleGroupItem key={k} value={k} className="h-9 rounded-full border border-border px-3 text-xs font-semibold data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  {LAYERS[k].label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <DemoTag />
          </div>
          <MeshMap layer={layer} selectedId={sel ?? undefined} onSelect={setSel} showStations />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Legend layer={layer} />
            <p className="text-xs text-muted-foreground">Cells: 1 km target grid · ▢ observation stations</p>
          </div>
        </Panel>

        <Panel eyebrow="Panchayat" title={w?.panchayat.name ?? "Select a Panchayat"} action={w && <button onClick={() => setSel(null)} aria-label="Close"><X className="size-4 text-muted-foreground" /></button>}>
          {w && adv ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{w.panchayat.block} block · {w.panchayat.district}</p>
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Current condition</p>
                <p className="text-xl font-semibold">{w.condition}, {w.tempC.toFixed(0)}°C</p>
                <p className="mt-1 text-sm">Forecast: {w.rainMm.toFixed(0)} mm rain expected today, peaking in the afternoon.</p>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-muted-foreground">Rain probability</dt><dd className="text-lg font-semibold">{w.rainProb}%</dd></div>
                <div><dt className="text-muted-foreground">Reliability</dt><dd className="mt-1"><ReliabilityBadge level={w.level} /></dd></div>
                <div><dt className="text-muted-foreground">Key risk</dt><dd className="font-semibold">{risk}</dd></div>
                <div><dt className="text-muted-foreground">Humidity</dt><dd className="font-semibold">{w.humidity.toFixed(0)}%</dd></div>
              </dl>
              <div className="rounded-xl border border-primary/30 bg-accent p-4">
                <p className="text-sm font-semibold text-accent-foreground">Recommended action</p>
                <p className="mt-1 text-sm">{adv.action}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Tap any Panchayat on the map.</p>
          )}
        </Panel>
      </div>
      <div className="mt-5 space-y-5">
        <MeshTriptych />
        <CalibrationSection />
        <ReliabilitySection id={sel ?? DEFAULT_PANCHAYAT} />
      </div>
    </AppShell>
  );
}
