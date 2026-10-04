import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CloudRainWind, Sun, Leaf, Wind, Droplets } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader, Panel, DemoTag } from "@/components/app/widgets";
import { SmsSection } from "@/components/app/sections";
import { api } from "@/lib/services/api";
import { alertHistory, type AlertCategory } from "@/lib/demo/engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Risk Alerts & SMS — SUKSHMA-AI" },
      { name: "description", content: "Heavy rain, heat, dry spell, wind and field moisture alerts by Panchayat, with SMS delivery for keypad phones." },
      { property: "og:title", content: "Risk Alerts & SMS — SUKSHMA-AI" },
      { property: "og:description", content: "Panchayat risk alerts delivered to every phone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AlertsPage,
});

const CATS: { c: AlertCategory; icon: typeof Sun }[] = [
  { c: "Heavy Rain", icon: CloudRainWind },
  { c: "Heat Risk", icon: Sun },
  { c: "Dry Spell", icon: Leaf },
  { c: "High Wind", icon: Wind },
  { c: "Field Moisture Risk", icon: Droplets },
];
const sev = { Severe: "bg-risk text-primary-foreground", Moderate: "bg-amber text-foreground", Watch: "bg-sky-soft text-sky" };

function AlertsPage() {
  const all = api.alerts();
  const [cat, setCat] = useState<AlertCategory | "All">("All");
  const list = cat === "All" ? all : all.filter((a) => a.category === cat);
  return (
    <AppShell>
      <PageHeader eyebrow="Risk overview" title="Risk Alerts" actions={<DemoTag />} />
      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
        {(["All", ...CATS.map((x) => x.c)] as const).map((c) => {
          const n = c === "All" ? all.length : all.filter((a) => a.category === c).length;
          return (
            <button key={c} onClick={() => setCat(c)} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold", cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>
              {c} <span className="ml-1 opacity-70">{n}</span>
            </button>
          );
        })}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => {
          const Icon = CATS.find((x) => x.c === a.category)!.icon;
          return (
            <article key={a.id} className="card-surface p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="flex items-center gap-2 font-semibold"><Icon className="size-5 text-primary" />{a.category}</p>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", sev[a.severity])}>{a.severity}</span>
              </div>
              <p className="mt-3 text-xl font-semibold">{a.panchayat}</p>
              <p className="text-sm text-muted-foreground">{a.period} · {a.confidence}% confidence</p>
              <p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm"><strong>Action:</strong> {a.action}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
        <Panel eyebrow="Timeline" title="Alert history">
          <ol className="relative space-y-5 border-l border-border pl-5">
            {alertHistory.map((h) => (
              <li key={h.title}>
                <span className={cn("absolute -left-[5px] mt-1.5 size-2.5 rounded-full", h.severity === "Severe" ? "bg-risk" : h.severity === "Moderate" ? "bg-amber" : "bg-sky")} />
                <p className="font-mono text-xs text-muted-foreground">{h.date}</p>
                <p className="font-semibold">{h.title}</p>
                <p className="text-sm text-muted-foreground">{h.outcome}</p>
              </li>
            ))}
          </ol>
        </Panel>
        <SmsSection />
      </div>
    </AppShell>
  );
}
