import React, { useState } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  CloudRain, Droplets, Thermometer, Wind, Sprout, ArrowRight,
  MapPin, Users, Bell, LayoutGrid,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import {
  PageHeader, Panel, Metric, PanchayatPicker,
  ReliabilityBadge, UncertaintyBar, DemoTag, Flow,
} from "@/components/app/widgets";
import { GpsWeatherPanel } from "@/components/app/GpsWeatherPanel";
import { MapView } from "@/components/app/MapView";
import { api, DEFAULT_PANCHAYAT } from "@/lib/services/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Farmer Dashboard — SUKSHMA-AI" },
      { name: "description", content: "Your Panchayat's local weather, forecast reliability and recommended farm action." },
      { property: "og:title", content: "Farmer Dashboard — SUKSHMA-AI" },
      { property: "og:description", content: "Local weather, reliability and farm actions for your Panchayat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
}

// ── Root switcher ─────────────────────────────────────────────────────────────

function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "admin") return <Navigate to="/admin" />;
  if (user?.role === "officer") return <OfficerDashboard />;
  return <FarmerDashboard />;
}

// ── Farmer Dashboard ──────────────────────────────────────────────────────────

function FarmerDashboard() {
  const { user } = useAuth();
  const registeredId = user?.panchayatId ?? DEFAULT_PANCHAYAT;
  const [id, setId] = useState(registeredId);
  const w = api.weather(id);
  const hours = api.hourly(id);
  const actions = api.advisory(id, "paddy", "Tillering").slice(0, 3);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Your farm, today"
        title={`${greeting()}, ${user?.name ?? "Farmer"}`}
        description="GPS-powered local weather and crop advisories for your panchayat."
        actions={<PanchayatPicker value={id} onChange={setId} showHierarchy />}
      />

      {/* Banner: registered panchayat */}
      <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200/60 bg-emerald-50/60 px-4 py-2.5 text-sm dark:border-emerald-800/30 dark:bg-emerald-950/20">
        <MapPin className="size-4 shrink-0 text-emerald-600" />
        <span className="text-muted-foreground">
          Getting alerts for{" "}
          <strong className="text-foreground">{w.panchayat.name}</strong> ·{" "}
          {w.panchayat.block} Block
        </span>
      </div>

      {/* GPS panel — full width, prominent */}
      <GpsWeatherPanel />

      {/* Registered panchayat weather */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel className="lg:col-span-2" eyebrow="Registered panchayat weather" action={<DemoTag />}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                <MapPin className="size-4 text-primary" />
                {w.panchayat.name} · {w.panchayat.block}
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="tabular font-display text-6xl font-semibold">{w.tempC.toFixed(0)}°</span>
                <span className="text-lg text-muted-foreground">C</span>
              </div>
              <p className="mt-1 text-lg font-medium">{w.condition}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Metric icon={<CloudRain />} tone="sky"    label="Rain chance" value={`${w.rainProb}`} unit="%" />
              <Metric icon={<Droplets />} tone="teal"   label="Humidity"    value={w.humidity.toFixed(0)} unit="%" />
              <Metric icon={<Wind />}     tone="violet" label="Wind"        value={w.windKmh.toFixed(0)} unit="km/h" />
              <Metric icon={<Thermometer />} tone="amber" label="Max today" value={w.tempMax.toFixed(0)} unit="°C" />
            </div>
          </div>
        </Panel>

        <Panel eyebrow="How reliable is it?" title="Forecast Reliability" action={<ReliabilityBadge level={w.level} />}>
          <p className="tabular font-display text-4xl font-semibold">
            {Math.round(w.reliability * 100)}%
            <span className="ml-2 text-sm font-normal text-muted-foreground">confidence (simulated)</span>
          </p>
          <div className="mt-4"><UncertaintyBar value={w.rainMm} score={w.reliability} max={80} unit="mm rain" /></div>
          <p className="mt-4 text-xs text-muted-foreground">Higher confidence indicates greater model agreement and data support.</p>
        </Panel>
      </div>

      {/* Hourly forecast */}
      <Panel className="mt-5" eyebrow="Today's local weather" title="Hour by hour">
        <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {hours.map((h) => (
            <div key={h.time} className="min-w-[104px] rounded-xl border border-border bg-muted/30 p-3 text-center">
              <p className="font-mono text-xs text-muted-foreground">{h.time}</p>
              <p className="tabular mt-1 text-xl font-semibold">{h.tempC.toFixed(0)}°</p>
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-sky-500">
                <CloudRain className="size-3" />{h.rainProb}%
              </p>
              <p className="tabular text-xs text-muted-foreground">{h.rainMm.toFixed(1)} mm</p>
              <div className="mt-2 h-1 rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${h.confidence}%` }} />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">{h.confidence}% conf.</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Crop advisory */}
      <Panel
        className="mt-5"
        eyebrow="What should I do?"
        title="Recommended Action"
        action={<Link to="/advisory" className="text-sm font-semibold text-primary">Crop advisory →</Link>}
      >
        <div className="grid gap-3 md:grid-cols-3">
          {actions.map((a) => (
            <div
              key={a.id}
              className={cn(
                "rounded-xl border p-4",
                a.priority === "High" ? "border-risk/30 bg-risk-soft" : "border-border bg-accent/40",
              )}
            >
              <p className="flex items-center gap-2 font-semibold">
                <Sprout className="size-4 text-primary" />{a.title}
              </p>
              <p className="mt-1 text-sm">{a.action}</p>
              <p className="mt-2 text-xs text-muted-foreground">{a.reason}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Rule-based demo advisory for Paddy (Tillering).</p>
      </Panel>

      {/* How SUKSHMA works */}
      <Panel className="mt-5" eyebrow="How SUKSHMA works">
        <h2 className="mb-5 font-display text-xl font-semibold">"From Coarse Forecasts to Trusted Panchayat-Level Decisions."</h2>
        <Flow steps={["Coarse Forecast", "SUKSHMA Mesh", "Local Calibration", "Reliability", "Panchayat Weather", "Crop Advisory", "App + SMS"]} highlight="SUKSHMA Mesh" />
        <Link to="/weather" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          See the mesh <ArrowRight className="size-4" />
        </Link>
      </Panel>
    </AppShell>
  );
}

// ── Officer / Panchayat Head Dashboard ────────────────────────────────────────

function OfficerDashboard() {
  const { user } = useAuth();
  const panchayatId = user?.panchayatId ?? DEFAULT_PANCHAYAT;
  const w = api.weather(panchayatId);
  const allPanchayats = api.panchayats();
  const activeAlerts = api.alerts().filter((a) => a.panchayat === w.panchayat.name);
  const actions = api.advisory(panchayatId, "paddy", "Tillering");

  // Stats
  const blockPanchayats = allPanchayats.filter((p) => p.block === w.panchayat.block);
  const totalAlerts = api.alerts().length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Panchayat officer view"
        title={`Welcome, ${user?.name ?? "Officer"}`}
        description={`${w.panchayat.block} Block · ${w.panchayat.district} District`}
      />

      {/* Stats row */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<LayoutGrid className="size-5 text-emerald-600" />}
          label="Panchayats in block"
          value={blockPanchayats.length}
          bg="bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/30"
        />
        <StatCard
          icon={<Bell className="size-5 text-amber-600" />}
          label="Active alerts (district)"
          value={totalAlerts}
          bg="bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/30"
        />
        <StatCard
          icon={<Users className="size-5 text-sky-600" />}
          label="Est. farmers in block"
          value={blockPanchayats.reduce((a, p) => a + Math.round(p.population * 0.4), 0).toLocaleString()}
          bg="bg-sky-50/60 dark:bg-sky-950/20 border-sky-200/60 dark:border-sky-800/30"
        />
      </div>

      {/* Current weather — large card */}
      <Panel eyebrow={`Current weather · ${w.panchayat.name}`} action={<ReliabilityBadge level={w.level} />}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
              <MapPin className="size-4 text-primary" />
              {w.panchayat.name} · {w.panchayat.block}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="tabular font-display text-6xl font-semibold">{w.tempC.toFixed(0)}°</span>
              <span className="text-lg text-muted-foreground">C</span>
            </div>
            <p className="mt-1 text-lg font-medium">{w.condition}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Reliability:{" "}
              <span className="font-semibold text-foreground">
                {Math.round(w.reliability * 100)}%
              </span>{" "}
              confidence
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <Metric icon={<CloudRain />} tone="sky"    label="Rain chance" value={`${w.rainProb}`} unit="%" />
            <Metric icon={<Droplets />} tone="teal"   label="Humidity"    value={w.humidity.toFixed(0)} unit="%" />
            <Metric icon={<Wind />}     tone="violet" label="Wind"        value={w.windKmh.toFixed(0)} unit="km/h" />
            <Metric icon={<Thermometer />} tone="amber" label="Max today" value={w.tempMax.toFixed(0)} unit="°C" />
          </div>
        </div>
      </Panel>

      {/* Active alerts */}
      <Panel className="mt-5" eyebrow="Active alerts" title={`${w.panchayat.name} alerts`}>
        {activeAlerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active alerts for this panchayat.</p>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "rounded-xl border p-4",
                  alert.severity === "Severe"
                    ? "border-risk/30 bg-risk-soft"
                    : alert.severity === "Moderate"
                      ? "border-amber/30 bg-amber-soft"
                      : "border-border bg-accent/40",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{alert.category}</p>
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    alert.severity === "Severe" ? "bg-risk text-white" :
                    alert.severity === "Moderate" ? "bg-amber-500 text-white" :
                    "bg-muted text-muted-foreground",
                  )}>
                    {alert.severity}
                  </span>
                </div>
                <p className="mt-1 text-sm">{alert.action}</p>
                <p className="mt-1 text-xs text-muted-foreground">{alert.period} · {alert.confidence}% confidence · Issued {alert.issued}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Advisory summary */}
      <Panel
        className="mt-5"
        eyebrow="Crop advisory summary"
        title="Paddy · Tillering stage"
        action={<Link to="/advisory" className="text-sm font-semibold text-primary">Full advisory →</Link>}
      >
        <div className="grid gap-3 md:grid-cols-3">
          {actions.slice(0, 3).map((a) => (
            <div
              key={a.id}
              className={cn(
                "rounded-xl border p-4",
                a.priority === "High" ? "border-risk/30 bg-risk-soft" : "border-border bg-accent/40",
              )}
            >
              <p className="flex items-center gap-2 font-semibold">
                <Sprout className="size-4 text-primary" />{a.title}
              </p>
              <p className="mt-1 text-sm">{a.action}</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Map */}
      <div className="mt-5">
        <MapView highlightId={panchayatId} />
      </div>
    </AppShell>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bg: string;
}) {
  return (
    <div className={cn("flex items-center gap-4 rounded-xl border p-4", bg)}>
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/60 dark:bg-white/5">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold tabular text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
