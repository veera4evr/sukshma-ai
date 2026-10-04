import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  MapPin, Users, CloudRain, Thermometer, Droplets, Sprout, BellRing,
  Printer, MessageSquare, Lock, Search, Clock, ChevronRight, BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader, Panel, DemoTag, Metric } from "@/components/app/widgets";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/services/api";
import { panchayats } from "@/lib/demo/data";
import { CROPS } from "@/lib/demo/engine";
import type { CropKey } from "@/lib/demo/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/panchayat-head")({
  head: () => ({
    meta: [
      { title: "Panchayat Head — SUKSHMA-AI" },
      { name: "description", content: "Area overview, farmer registry, active alerts and advisory management for Panchayat Head." },
    ],
  }),
  component: PanchayatHeadPage,
});

// ---- Types ---------------------------------------------------------------
interface StoredFarmer {
  id: string;
  name: string;
  phone: string;
  panchayatId: string;
  registeredOn: string;
  primaryCrop: CropKey;
}

// ---- Severity styles for alerts ------------------------------------------
const severityStyle: Record<string, string> = {
  Severe: "border-red-400/40 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300",
  Moderate: "border-amber/40 bg-amber-soft text-foreground",
  Watch: "border-primary/30 bg-accent text-accent-foreground",
};

const severityBadge: Record<string, string> = {
  Severe: "bg-red-600 text-white",
  Moderate: "bg-amber text-foreground",
  Watch: "bg-primary/20 text-primary",
};

const prio: Record<string, string> = {
  High: "border-risk/30 bg-risk-soft",
  Medium: "border-amber/40 bg-amber-soft",
  Low: "border-border bg-card",
};

// ---- Demo farmers seeded to kandiyur panchayat ---------------------------
const DEMO_FARMERS: StoredFarmer[] = [
  { id: "f1", name: "Arumugam Kannan", phone: "9876501234", panchayatId: "kandiyur", registeredOn: "2026-09-10", primaryCrop: "paddy" },
  { id: "f2", name: "Selvi Ramasamy", phone: "9123456780", panchayatId: "kandiyur", registeredOn: "2026-09-15", primaryCrop: "groundnut" },
  { id: "f3", name: "Murugaiyah S.", phone: "8012345678", panchayatId: "kandiyur", registeredOn: "2026-09-22", primaryCrop: "maize" },
  { id: "f4", name: "Kamala Devi", phone: "7890123456", panchayatId: "kandiyur", registeredOn: "2026-09-28", primaryCrop: "paddy" },
];

function maskPhone(phone: string): string {
  return `****${phone.slice(-4)}`;
}

// ---- Breadcrumb helper ---------------------------------------------------
function HierarchyBreadcrumb({ block, district, panchayat }: { block: string; district: string; panchayat: string }) {
  const crumbs = ["Tamil Nadu", district, block, panchayat];
  return (
    <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      {crumbs.map((c, i) => (
        <span key={c} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3.5 shrink-0" />}
          <span className={cn(i === crumbs.length - 1 && "font-semibold text-foreground")}>{c}</span>
        </span>
      ))}
    </div>
  );
}

// ---- Main component ------------------------------------------------------
function PanchayatHeadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Role guard
  useEffect(() => {
    if (user && user.role !== "panchayat_head") {
      navigate({ to: "/dashboard" });
    }
  }, [user, navigate]);

  const [crop, setCrop] = useState<CropKey>("paddy");
  const [stage, setStage] = useState<string>(CROPS.paddy.stages[2]!);
  const [search, setSearch] = useState("");
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });

  if (!user || user.role !== "panchayat_head") return null;

  const panchayatId = user.panchayatId ?? "kandiyur";
  const panchayat = panchayats.find((p) => p.id === panchayatId) ?? panchayats[0]!;
  const weather = api.weather(panchayatId);
  const allAlerts = api.alerts().filter((a) => a.panchayat.toLowerCase() === panchayat.name.toLowerCase());
  const advisories = api.advisory(panchayatId, crop, stage);

  // Load farmers from localStorage + demo seed
  const storedRaw = localStorage.getItem("sukshma_farmers");
  const storedFarmers: StoredFarmer[] = storedRaw ? (JSON.parse(storedRaw) as StoredFarmer[]) : [];
  const allFarmers = [...DEMO_FARMERS, ...storedFarmers].filter((f) => f.panchayatId === panchayatId);
  const filteredFarmers = allFarmers.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.primaryCrop.toLowerCase().includes(search.toLowerCase()),
  );

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    toast.success("Password updated (demo — no change persisted).");
    setPwForm({ current: "", next: "", confirm: "" });
  }

  const areaSqKm = ((panchayat.polygon.reduce((a, _, i, arr) => {
    const [x1, y1] = arr[i]!;
    const [x2, y2] = arr[(i + 1) % arr.length]!;
    return a + (x1 * y2 - x2 * y1);
  }, 0) / 2) * 0.0035).toFixed(1);

  return (
    <AppShell>
      {/* ── A. Area Overview ────────────────────────────────────── */}
      <PageHeader
        eyebrow="Panchayat Head Portal"
        title={panchayat.name}
        description="Administrative dashboard for your panchayat area."
        actions={<DemoTag label="Demo data" />}
      />

      <Panel className="mb-5">
        <HierarchyBreadcrumb
          district={panchayat.district}
          block={panchayat.block}
          panchayat={panchayat.name}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-accent px-2.5 py-0.5 text-xs font-mono font-semibold text-accent-foreground">
            <BadgeCheck className="size-3.5" /> LGD {user.lgdCode ?? "TN-033-001-0042"}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Metric icon={<Users />} tone="sky" label="Population" value={panchayat.population.toLocaleString()} />
          <Metric icon={<MapPin />} tone="teal" label="Area (approx.)" value={areaSqKm} unit="km²" />
          <Metric icon={<CloudRain />} tone="sky" label="Rainfall today" value={weather.rainMm.toFixed(0)} unit="mm" />
          <Metric icon={<Thermometer />} tone="amber" label="Temperature" value={weather.tempMax.toFixed(0)} unit="°C max" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Metric icon={<Droplets />} tone="teal" label="Humidity" value={weather.humidity.toFixed(0)} unit="%" />
          <Metric icon={<Sprout />} tone="primary" label="Soil moisture" value={weather.soilMoisture.toFixed(0)} unit="/100" />
          <div className="flex flex-col justify-center rounded-xl border border-border bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">Condition</p>
            <p className="text-base font-semibold">{weather.condition}</p>
          </div>
        </div>
      </Panel>

      {/* ── B. Farmers in this Panchayat ────────────────────────── */}
      <Panel
        className="mb-5"
        eyebrow="Farmer Registry"
        title="Registered Farmers"
        action={
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            {allFarmers.length} registered
          </span>
        }
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or crop…"
              className="pl-9 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {filteredFarmers.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/30 py-12 text-center">
            <Users className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-semibold text-foreground">No farmers registered yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Farmers who register via the app will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Registered On</th>
                  <th className="px-4 py-3 font-semibold">Primary Crop</th>
                </tr>
              </thead>
              <tbody>
                {filteredFarmers.map((f) => (
                  <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{f.name}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{maskPhone(f.phone)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(f.registeredOn).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium capitalize">
                        {CROPS[f.primaryCrop].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* ── C. Active Alerts for Area ───────────────────────────── */}
      <Panel
        className="mb-5"
        eyebrow="Risk Alerts"
        title={`Active Alerts · ${panchayat.name}`}
        action={
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold",
            allAlerts.length > 0 ? "bg-red-600 text-white" : "bg-muted text-muted-foreground")}>
            {allAlerts.length} active
          </span>
        }
      >
        {allAlerts.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/30 py-10 text-center">
            <BellRing className="mx-auto mb-3 size-7 text-muted-foreground" />
            <p className="font-semibold">No active alerts for {panchayat.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">All clear — no risk conditions detected.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allAlerts.map((alert) => (
              <div key={alert.id} className={cn("rounded-xl border p-4", severityStyle[alert.severity] ?? "border-border bg-card")}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", severityBadge[alert.severity])}>
                      {alert.severity}
                    </span>
                    <span className="font-semibold">{alert.category}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() =>
                      toast.info(`SMS Preview: [SUKSHMA] ${alert.category} alert for ${alert.panchayat}. ${alert.action} (${alert.period})`)
                    }
                  >
                    <MessageSquare className="size-3.5" /> SMS Preview
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="size-3.5" /> {alert.period}
                  </span>
                  <span><strong className="text-foreground">Action:</strong> {alert.action}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Issued: {alert.issued} · Confidence: {alert.confidence}%
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* ── D. Advisory Management ─────────────────────────────── */}
      <Panel
        className="mb-5"
        eyebrow="Crop Advisory"
        title="Advisory for your Panchayat"
        action={
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => toast.info("Advisory export queued — PDF generation requires backend integration (demo).")}
          >
            <Printer className="size-4" /> Print / Export
          </Button>
        }
      >
        <div className="mb-4 flex flex-wrap gap-3">
          <Select value={crop} onValueChange={(v) => { setCrop(v as CropKey); setStage(CROPS[v as CropKey].stages[1]!); }}>
            <SelectTrigger className="h-10 w-[150px] bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>{(Object.keys(CROPS) as CropKey[]).map((c) => <SelectItem key={c} value={c}>{CROPS[c].label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger className="h-10 w-[160px] bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>{CROPS[crop].stages.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          {advisories.map((a) => (
            <article key={a.id} className={cn("rounded-xl border p-4", prio[a.priority])}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold">{a.title}</h3>
                <span className="rounded-full bg-foreground px-2.5 py-0.5 text-xs font-semibold text-background">
                  {a.priority} priority
                </span>
              </div>
              <p className="mt-1">{a.action}</p>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <span><strong className="text-foreground">Why:</strong> {a.reason}</span>
                <span className="flex items-center gap-1"><Clock className="size-3.5" />{a.validity}</span>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Advice is generated from fixed agronomic rules — not AI-generated text. Consult your district agriculture officer for doses.
        </p>
      </Panel>

      {/* ── E. Profile & Credentials ────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel eyebrow="Profile" title="Head & Panchayat Details">
          <dl className="space-y-3">
            {[
              ["Head Name", user.name],
              ["Panchayat", panchayat.name],
              ["Block", panchayat.block],
              ["District", panchayat.district],
              ["State", "Tamil Nadu"],
              ["LGD Code", user.lgdCode ?? "TN-033-001-0042"],
              ["Login ID", user.phone ?? "7777777777"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                <dt className="text-sm text-muted-foreground">{k}</dt>
                <dd className="font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel eyebrow="Security" title="Change Password">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cur-pw" className="flex items-center gap-1.5 text-sm">
                <Lock className="size-3.5" /> Current password
              </Label>
              <Input
                id="cur-pw"
                type="password"
                placeholder="Enter current password"
                value={pwForm.current}
                onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                className="h-10"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pw" className="text-sm">New password</Label>
              <Input
                id="new-pw"
                type="password"
                placeholder="At least 8 characters"
                value={pwForm.next}
                onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
                className="h-10"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="conf-pw" className="text-sm">Confirm new password</Label>
              <Input
                id="conf-pw"
                type="password"
                placeholder="Re-enter new password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                className="h-10"
                required
              />
            </div>
            <Button type="submit" className="w-full h-11">Update Password</Button>
            <p className="text-center text-xs text-muted-foreground">
              Demo only — no actual password is changed.
            </p>
          </form>
        </Panel>
      </div>
    </AppShell>
  );
}
