import { useState } from "react";
import { ArrowRight, Brain, Cpu, Database, Globe2, Layers, MessageSquareText, Phone, Radio, Server, Smartphone, Send } from "lucide-react";
import { CartesianGrid, Legend as RLegend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { MeshMap, Legend } from "./MeshMap";
import { Panel, DemoTag, ReliabilityBadge, UncertaintyBar, PanchayatPicker } from "./widgets";
import { api, DEFAULT_PANCHAYAT } from "@/lib/services/api";
import { composeAlertSms, getSmsProvider } from "@/lib/services/sms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const tooltipStyle = {
  contentStyle: { borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 },
};

export function MeshTriptych() {
  return (
    <Panel eyebrow="SUKSHMA Mesh" title="Coarse → Fine Weather Refinement" action={<DemoTag />}>
      <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div>
          <p className="mb-2 text-sm font-semibold">Block Forecast</p>
          <MeshMap layer="rain" mode="coarse" showBoundaries={false} showValues />
          <p className="mt-2 text-xs text-muted-foreground">One value covers several Panchayats.</p>
        </div>
        <ArrowRight className="mx-auto hidden text-muted-foreground md:block" />
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Brain className="size-4 text-primary" /> SUKSHMA Mesh
          </p>
          <MeshMap layer="rain" showBoundaries={false} />
          <p className="mt-2 text-xs text-muted-foreground">1 km target grid with spatial variation.</p>
        </div>
        <ArrowRight className="mx-auto hidden text-muted-foreground md:block" />
        <div>
          <p className="mb-2 text-sm font-semibold">Panchayat View</p>
          <MeshMap layer="rain" showValues />
          <p className="mt-2 text-xs text-muted-foreground">Localized values per Panchayat.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <Legend layer="rain" />
        <p className="text-xs text-muted-foreground">
          1 km-resolution target grid; prediction skill is evaluated through validation experiments.
        </p>
      </div>
    </Panel>
  );
}

export function CalibrationSection() {
  const { stations, series } = api.calibration();
  const steps = ["Forecast Value", "Terrain / Historical Context", "Local Observation"];
  return (
    <Panel eyebrow="Local calibration" title="Correcting forecasts with local observations" action={<DemoTag />}>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr_1fr]">
        <div className="flex flex-col gap-2">
          {steps.map((s, i) => (
            <div key={s}>
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium">{s}</div>
              {i < 2 && <p className="py-0.5 text-center text-muted-foreground">+</p>}
            </div>
          ))}
          <p className="text-center text-muted-foreground">↓</p>
          <div className="rounded-lg border border-violet/40 bg-violet-soft px-3 py-2 text-sm font-semibold">Calibration</div>
          <p className="text-center text-muted-foreground">↓</p>
          <div className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Refined Estimate</div>
        </div>
        <div>
          <MeshMap layer="temp" showStations showLabels={false} />
          <div className="mt-2 space-y-1">
            {stations.map((s) => (
              <p key={s.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-2.5 rounded-sm border-2 border-violet" /> {s.name} ({s.type})
              </p>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Observed vs Forecast vs Calibrated (°C)</p>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={series} margin={{ left: -20, right: 8 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 10 }} domain={["dataMin - 1", "dataMax + 1"]} tickFormatter={(v: number) => v.toFixed(0)} stroke="var(--muted-foreground)" />
                <Tooltip {...tooltipStyle} formatter={(v: number) => v.toFixed(1)} />
                <RLegend wrapperStyle={{ fontSize: 12 }} />
                <Line dataKey="observed" name="Observed" stroke="var(--foreground)" strokeWidth={2} dot={false} />
                <Line dataKey="forecast" name="Coarse forecast" stroke="var(--amber)" strokeWidth={2} strokeDasharray="4 3" dot={false} />
                <Line dataKey="calibrated" name="Calibrated" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function ReliabilitySection({ id = DEFAULT_PANCHAYAT }: { id?: string }) {
  const w = api.weather(id);
  const levels = [
    { l: "High" as const, d: "Strong model agreement and nearby observations." },
    { l: "Medium" as const, d: "Some disagreement or sparse local data." },
    { l: "Low" as const, d: "Convective or complex terrain — check again later." },
  ];
  return (
    <Panel eyebrow="Reliability engine" title="Forecast confidence" action={<DemoTag label="Simulated" />}>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Rainfall estimate · {w.panchayat.name}</p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="tabular font-display text-5xl font-semibold">{w.rainMm.toFixed(0)}</span>
            <span className="text-muted-foreground">mm</span>
            <ReliabilityBadge level={w.level} />
          </div>
          <div className="mt-5">
            <UncertaintyBar value={w.rainMm} score={w.reliability} max={80} unit="mm" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Reliability reflects model/data support and forecast uncertainty; it is not the same as forecast accuracy.
          </p>
        </div>
        <div className="space-y-2">
          {levels.map(({ l, d }) => (
            <div key={l} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <ReliabilityBadge level={l} />
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
          <div className="pt-2">
            <MeshMap layer="reliability" showLabels={false} selectedId={id} />
            <div className="mt-2"><Legend layer="reliability" compact /></div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function SmsSection() {
  const [phone, setPhone] = useState("");
  const [pid, setPid] = useState(DEFAULT_PANCHAYAT);
  const [pref, setPref] = useState("critical");
  const [enabled, setEnabled] = useState(true);
  const [sending, setSending] = useState(false);
  const w = api.weather(pid);
  const msg = composeAlertSms({
    risk: w.rainMm >= 30 ? "Heavy rainfall is possible in your Panchayat today." : "No severe weather expected in your Panchayat today.",
    action: w.rainMm >= 30 ? "Check drainage and delay spraying" : "Normal field work",
    reliability: w.level,
  });
  const flow = [
    { icon: Server, l: "SUKSHMA-AI Backend" },
    { icon: Radio, l: "Risk Detection" },
    { icon: Send, l: "SMS Gateway" },
    { icon: Phone, l: "Farmer's Phone" },
  ];
  async function preview() {
    if (!/^\+?\d{10,13}$/.test(phone.replace(/\s/g, ""))) return toast.error("Enter a valid 10-digit mobile number");
    setSending(true);
    const r = await getSmsProvider().send({ to: phone, body: msg });
    setSending(false);
    toast.info(r.note);
    return undefined;
  }
  return (
    <Panel eyebrow="Last-mile delivery" title="Weather Alerts for Every Phone">
      <p className="-mt-2 mb-5 text-muted-foreground">
        Critical advisories can be delivered through SMS to farmers using basic keypad phones.
      </p>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {flow.map(({ icon: Icon, l }, i) => (
          <div key={l} className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium">
              <Icon className="size-4 text-primary" /> {l}
            </span>
            {i < flow.length - 1 && <ArrowRight className="size-4 text-muted-foreground" />}
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Mobile number</Label>
            <Input id="phone" inputMode="tel" placeholder="98XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label>Panchayat</Label>
            <PanchayatPicker value={pid} onChange={setPid} />
          </div>
          <div className="space-y-1.5">
            <Label>Alert preference</Label>
            <Select value={pref} onValueChange={setPref}>
              <SelectTrigger className="h-11 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical alerts only</SelectItem>
                <SelectItem value="daily">Daily advisory + alerts</SelectItem>
                <SelectItem value="all">All updates</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-semibold">Enable SMS alerts</p>
              <p className="text-xs text-muted-foreground">Mock provider — no SMS is sent yet</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <Button onClick={preview} disabled={!enabled || sending} className="h-11 w-full">
            <MessageSquareText /> {sending ? "Preparing…" : "Preview alert delivery"}
          </Button>
        </div>
        <div className="flex justify-center">
          <div className="w-64 rounded-[2rem] border-4 border-foreground bg-card p-4 shadow-[var(--shadow-card)]">
            <div className="mb-3 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>SUKSHMA</span><Smartphone className="size-3" />
            </div>
            <div className="rounded-xl bg-muted p-3 font-mono text-[12px] leading-relaxed whitespace-pre-line text-foreground">{msg}</div>
            <p className="mt-3 text-center text-[10px] text-muted-foreground">Preview · keypad-phone friendly (160 chars)</p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

const STACK: { title: string; icon: typeof Database; items: [string, string?][] }[] = [
  { title: "Data Sources", icon: Database, items: [["IMD / NWP", "https://mausam.imd.gov.in"], ["ERA5-Land", "https://cds.climate.copernicus.eu"], ["DEM"], ["Station Data"], ["Panchayat GIS"]] },
  { title: "AI / ML", icon: Brain, items: [["PyTorch", "https://pytorch.org"], ["Residual U-Net"], ["XGBoost", "https://xgboost.ai"], ["Uncertainty Estimation"]] },
  { title: "Data Processing", icon: Cpu, items: [["Python", "https://python.org"], ["NumPy", "https://numpy.org"], ["Pandas", "https://pandas.pydata.org"], ["Xarray", "https://xarray.dev"], ["NetCDF"]] },
  { title: "Geo-spatial", icon: Globe2, items: [["GeoPandas", "https://geopandas.org"], ["Rasterio"], ["Shapely"], ["PostGIS", "https://postgis.net"]] },
  { title: "Backend", icon: Server, items: [["FastAPI", "https://fastapi.tiangolo.com"], ["PostgreSQL", "https://postgresql.org"], ["Redis", "https://redis.io"], ["REST APIs"]] },
  { title: "Application", icon: Layers, items: [["React", "https://react.dev"], ["TypeScript", "https://typescriptlang.org"], ["Mapbox / Leaflet"]] },
];

export function TechStack() {
  return (
    <Panel eyebrow="Architecture" title="Technology stack">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STACK.map(({ title, icon: Icon, items }) => (
          <div key={title} className="rounded-xl border border-border p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Icon className="size-4 text-primary" />{title}</p>
            <div className="flex flex-wrap gap-1.5">
              {items.map(([n, href]) =>
                href ? (
                  <a key={n} href={href} target="_blank" rel="noreferrer" className="rounded-md bg-muted px-2 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground">{n}</a>
                ) : (
                  <span key={n} className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{n}</span>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
