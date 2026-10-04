import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { MeshMap, Legend } from "@/components/app/MeshMap";
import { PageHeader, Panel, DemoTag } from "@/components/app/widgets";
import { api, DEFAULT_PANCHAYAT } from "@/lib/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Coarse vs Refined Forecast — SUKSHMA-AI" },
      { name: "description", content: "Compare the original block forecast with the SUKSHMA refined estimate and see the weather delta." },
      { property: "og:title", content: "Coarse vs Refined Forecast — SUKSHMA-AI" },
      { property: "og:description", content: "Where fine-scale conditions differ from the coarse forecast." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Compare,
});

function Compare() {
  const [sel, setSel] = useState(DEFAULT_PANCHAYAT);
  const [kind, setKind] = useState<"rain" | "temp">("rain");
  const layer = kind === "rain" ? "rain" : "temp";
  const rows = api.allWeather();
  return (
    <AppShell>
      <PageHeader
        eyebrow="Weather comparison"
        title="Coarse vs Refined"
        description="Both maps are synchronized — tap a Panchayat on either side."
        actions={
          <ToggleGroup type="single" value={kind} onValueChange={(v) => v && setKind(v as "rain" | "temp")}>
            <ToggleGroupItem value="rain" className="rounded-full border px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Rainfall</ToggleGroupItem>
            <ToggleGroupItem value="temp" className="rounded-full border px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Temperature</ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Panel title="Original Block Forecast" action={<DemoTag />}>
          <MeshMap layer={layer} mode="coarse" selectedId={sel} onSelect={setSel} />
        </Panel>
        <Panel title="SUKSHMA Refined Estimate" action={<DemoTag />}>
          <MeshMap layer={layer} selectedId={sel} onSelect={setSel} />
        </Panel>
      </div>
      <div className="mt-3"><Legend layer={layer} /></div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Panel eyebrow="Weather delta" title="Refined − block forecast">
          <MeshMap layer="delta" deltaKind={kind} selectedId={sel} onSelect={setSel} />
          <div className="mt-3"><Legend layer="delta" /></div>
          <p className="mt-3 text-sm text-muted-foreground">
            SUKSHMA-AI highlights where fine-scale conditions differ from the coarse forecast representation.
          </p>
        </Panel>
        <Panel eyebrow="Localized variation" title="Per-Panchayat difference" action={<DemoTag />}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Panchayat</TableHead>
                <TableHead className="text-right">Rain Δ (mm)</TableHead>
                <TableHead className="text-right">Rain Δ (%)</TableHead>
                <TableHead className="text-right">Temp Δ (°C)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((w) => {
                const d = w.rainMm - w.coarseRainMm;
                const t = w.tempC - w.coarseTempC;
                return (
                  <TableRow key={w.panchayat.id} onClick={() => setSel(w.panchayat.id)} className={`cursor-pointer ${sel === w.panchayat.id ? "bg-accent" : ""}`}>
                    <TableCell className="font-medium">{w.panchayat.name}</TableCell>
                    <TableCell className={`tabular text-right ${d > 0 ? "text-sky" : "text-risk"}`}>{d > 0 ? "+" : ""}{d.toFixed(1)}</TableCell>
                    <TableCell className="tabular text-right">{((d / w.coarseRainMm) * 100).toFixed(0)}%</TableCell>
                    <TableCell className="tabular text-right">{t > 0 ? "+" : ""}{t.toFixed(1)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Panel>
      </div>
    </AppShell>
  );
}
