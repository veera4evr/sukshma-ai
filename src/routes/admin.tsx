import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Database, CloudDownload, RadioTower, Map as MapIcon, Brain } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader, Panel, DemoTag } from "@/components/app/widgets";
import { TechStack, tooltipStyle } from "@/components/app/sections";
import { api } from "@/lib/services/api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Model Monitoring — SUKSHMA-AI" },
      { name: "description", content: "Data pipeline status, Residual U-Net model info, prototype validation metrics and technology stack." },
      { property: "og:title", content: "Model Monitoring — SUKSHMA-AI" },
      { property: "og:description", content: "How the SUKSHMA-AI system is monitored." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

const pipeline = [
  { icon: CloudDownload, l: "Forecast ingestion", s: "IMD / NWP block forecast · 06:00 IST" },
  { icon: Database, l: "Historical data", s: "ERA5-Land reanalysis · 1991–2025" },
  { icon: RadioTower, l: "Station observations", s: "3 stations · last 05:45 IST" },
  { icon: MapIcon, l: "GIS boundaries", s: "12 Panchayat polygons" },
];

function Admin() {
  const { metrics, baselines, label } = api.metrics();
  return (
    <AppShell>
      <PageHeader eyebrow="Technical monitoring" title="Model & Data Monitoring" actions={<DemoTag label={label} />} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel eyebrow="Data pipeline" title="Inputs">
          <ul className="space-y-3">
            {pipeline.map(({ icon: Icon, l, s }) => (
              <li key={l} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Icon className="size-5 text-sky" />
                <div className="flex-1"><p className="font-semibold">{l}</p><p className="text-xs text-muted-foreground">{s}</p></div>
                <CheckCircle2 className="size-5 text-primary" />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel eyebrow="Model" title="Residual U-Net">
          <dl className="grid grid-cols-2 gap-4">
            {[["Architecture", "Residual U-Net"], ["Model version", "sukshma-v0.3.1-demo"], ["Last inference", "Today, 06:12 IST"], ["Input timestamp", "Today, 06:00 IST"], ["Output grid", "1 km target"], ["Uncertainty", "Ensemble + quantile"]].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-muted/40 p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-mono text-sm font-semibold">{v}</dd></div>
            ))}
          </dl>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Brain className="size-4" />Inference is mocked; a real model endpoint replaces it via the service layer.</p>
        </Panel>
      </div>

      <Panel className="mt-5" eyebrow="Validation" title="Skill metrics" action={<DemoTag label="Prototype / Demo Metrics" />}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {metrics.map((m) => (
            <div key={m.key} className="rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="tabular font-display text-2xl font-semibold">{m.value}</p>
              <p className="text-[11px] text-muted-foreground">{m.hint}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold">Baseline comparison — RMSE (mm, lower is better)</p>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={baselines} margin={{ left: -20 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="model" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="rmse" name="RMSE" radius={[6, 6, 0, 0]} barSize={48}>
                  {baselines.map((b) => <Cell key={b.model} fill={b.model === "SUKSHMA" ? "var(--primary)" : "var(--muted-foreground)"} fillOpacity={b.model === "SUKSHMA" ? 1 : 0.35} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground">Illustrative values only — not real performance claims.</p>
        </div>
      </Panel>

      <div className="mt-5"><TechStack /></div>

      <Panel className="mt-5" eyebrow="Backend architecture" title="API surface (demo responses)">
        <div className="flex flex-wrap gap-2">
          {["weather", "panchayats", "downscale", "calibration", "reliability", "advisory", "alerts", "history"].map((r) => (
            <a key={r} href={`/api/${r}`} target="_blank" rel="noreferrer" className="rounded-md border border-border bg-muted/40 px-3 py-1.5 font-mono text-xs hover:border-primary">/api/{r}</a>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">React + TypeScript → FastAPI → PostgreSQL / PostGIS · PyTorch ML service · Redis cache.</p>
      </Panel>
    </AppShell>
  );
}
