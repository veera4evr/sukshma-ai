import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CloudRain, Droplets, Thermometer, Sprout, Clock } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader, Panel, Metric, PanchayatPicker, DemoTag } from "@/components/app/widgets";
import { api, DEFAULT_PANCHAYAT } from "@/lib/services/api";
import { CROPS } from "@/lib/demo/engine";
import type { CropKey } from "@/lib/demo/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/advisory")({
  head: () => ({
    meta: [
      { title: "Crop-Aware Advisory — SUKSHMA-AI" },
      { name: "description", content: "Rule-based weather advisories for paddy, groundnut and maize by Panchayat and growth stage." },
      { property: "og:title", content: "Crop-Aware Advisory — SUKSHMA-AI" },
      { property: "og:description", content: "Structured farm actions from local weather for each crop stage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdvisoryPage,
});

const prio = { High: "border-risk/30 bg-risk-soft", Medium: "border-amber/40 bg-amber-soft", Low: "border-border bg-card" };

function AdvisoryPage() {
  const [id, setId] = useState(DEFAULT_PANCHAYAT);
  const [crop, setCrop] = useState<CropKey>("paddy");
  const [stage, setStage] = useState<string>(CROPS.paddy.stages[2]!);
  const w = api.weather(id);
  const items = api.advisory(id, crop, stage);
  return (
    <AppShell>
      <PageHeader eyebrow="What should I do?" title="Crop-Aware Advisory" />
      <div className="card-surface mb-5 flex flex-wrap items-center gap-3 p-4">
        <PanchayatPicker value={id} onChange={setId} />
        <Select value={crop} onValueChange={(v) => { setCrop(v as CropKey); setStage(CROPS[v as CropKey].stages[1]!); }}>
          <SelectTrigger className="h-10 w-[150px] bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>{(Object.keys(CROPS) as CropKey[]).map((c) => <SelectItem key={c} value={c}>{CROPS[c].label}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="h-10 w-[160px] bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>{CROPS[crop].stages.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Panel eyebrow="Weather conditions" title={w.panchayat.name} action={<DemoTag />}>
          <div className="space-y-4">
            <Metric icon={<CloudRain />} tone="sky" label="Rainfall (chance)" value={`${w.rainMm.toFixed(0)} mm · ${w.rainProb}%`} />
            <Metric icon={<Thermometer />} tone="amber" label="Temperature (max)" value={w.tempMax.toFixed(0)} unit="°C" />
            <Metric icon={<Droplets />} tone="teal" label="Humidity" value={w.humidity.toFixed(0)} unit="%" />
            <Metric icon={<Sprout />} label="Soil moisture proxy" value={w.soilMoisture.toFixed(0)} unit="/100" />
          </div>
        </Panel>
        <Panel eyebrow="Advisory" title={`${CROPS[crop].label} · ${stage}`}>
          <div className="space-y-3">
            {items.map((a) => (
              <article key={a.id} className={cn("rounded-xl border p-4", prio[a.priority])}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">{a.title}</h3>
                  <span className="rounded-full bg-foreground px-2.5 py-0.5 text-xs font-semibold text-background">{a.priority} priority</span>
                </div>
                <p className="mt-1 text-base">{a.action}</p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  <span><strong className="text-foreground">Why:</strong> {a.reason}</span>
                  <span className="flex items-center gap-1"><Clock className="size-3.5" />{a.validity}</span>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Advice comes from fixed agronomic rules, not free-form AI text. Consult your local agriculture officer for crop-specific doses.</p>
        </Panel>
      </div>
    </AppShell>
  );
}
