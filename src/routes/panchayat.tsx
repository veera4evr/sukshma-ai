import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CloudRain, Droplets, Thermometer, ShieldCheck, TriangleAlert, Lightbulb } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader, Panel, Metric, PanchayatPicker, DemoTag } from "@/components/app/widgets";
import { tooltipStyle } from "@/components/app/sections";
import { api, DEFAULT_PANCHAYAT } from "@/lib/services/api";

export const Route = createFileRoute("/panchayat")({
  head: () => ({
    meta: [
      { title: "Panchayat Insights — SUKSHMA-AI" },
      { name: "description", content: "Panchayat weather overview with 7-day outlook, reliability, current risk and key insights." },
      { property: "og:title", content: "Panchayat Insights — SUKSHMA-AI" },
      { property: "og:description", content: "7-day outlook and key weather insights per Panchayat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PanchayatPage,
});

function PanchayatPage() {
  const [id, setId] = useState(DEFAULT_PANCHAYAT);
  const w = api.weather(id);
  const days = api.outlook(id).map((d) => ({ ...d, tempMax: +d.tempMax.toFixed(1), tempMin: +d.tempMin.toFixed(1), rainMm: +d.rainMm.toFixed(1) }));
  const wettest = days.reduce((a, b) => (b.rainMm > a.rainMm ? b : a));
  const risk = w.rainMm >= 30 ? "Heavy rain" : w.tempMax >= 35.5 ? "Heat" : w.rainMm < 9 ? "Dry spell" : "Low";
  const insights = [
    `Rainfall risk peaks ${wettest.day === "Today" ? "today" : `on ${wettest.day}`} (~${wettest.rainMm.toFixed(0)} mm).`,
    w.tempMax >= 34 ? "Temperature is expected to remain elevated through the week." : "Temperatures stay moderate this week.",
    `Forecast reliability is ${w.level.toLowerCase()} today and decreases for later days.`,
    `Refined estimate differs from the block forecast by ${(w.rainMm - w.coarseRainMm).toFixed(1)} mm.`,
  ];
  return (
    <AppShell>
      <PageHeader eyebrow="For Panchayat & agriculture officers" title="Panchayat Weather Overview" actions={<PanchayatPicker value={id} onChange={setId} />} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {[
          <Metric key="r" icon={<CloudRain />} tone="sky" label="Rainfall" value={w.rainMm.toFixed(0)} unit="mm" />,
          <Metric key="t" icon={<Thermometer />} tone="amber" label="Temperature" value={w.tempC.toFixed(1)} unit="°C" />,
          <Metric key="h" icon={<Droplets />} tone="teal" label="Humidity" value={w.humidity.toFixed(0)} unit="%" />,
          <Metric key="re" icon={<ShieldCheck />} label="Reliability" value={w.level} />,
          <Metric key="k" icon={<TriangleAlert />} tone="violet" label="Current risk" value={risk} />,
        ].map((m, i) => (
          <div key={i} className="card-surface p-4">{m}</div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <Panel eyebrow="7-day outlook" title={w.panchayat.name} action={<DemoTag />}>
          <div className="h-80">
            <ResponsiveContainer>
              <ComposedChart data={days} margin={{ left: -15, right: 0 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis yAxisId="t" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" domain={["dataMin - 2", "dataMax + 1"]} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="r" dataKey="rainMm" name="Rain (mm)" fill="var(--sky)" radius={[6, 6, 0, 0]} barSize={26} />
                <Line yAxisId="t" dataKey="tempMax" name="Max °C" stroke="var(--amber)" strokeWidth={2.5} />
                <Line yAxisId="t" dataKey="tempMin" name="Min °C" stroke="var(--teal)" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel eyebrow="Key insights" title="What to know" action={<DemoTag label="Demo-generated" />}>
          <ul className="space-y-3">
            {insights.map((t) => (
              <li key={t} className="flex gap-3 rounded-lg bg-muted/40 p-3 text-sm"><Lightbulb className="mt-0.5 size-4 shrink-0 text-amber" />{t}</li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
