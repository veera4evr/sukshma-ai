import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  User as UserIcon, MapPin, Sprout, BellRing, BarChart2, Save,
  RefreshCw, CloudRain, Thermometer,
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader, Panel, DemoTag } from "@/components/app/widgets";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/services/api";
import { panchayats } from "@/lib/demo/data";
import { CROPS } from "@/lib/demo/engine";
import type { CropKey } from "@/lib/demo/data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer-profile")({
  head: () => ({
    meta: [
      { title: "My Profile — SUKSHMA-AI" },
      { name: "description", content: "Manage your crop setup, alert preferences and view your weather history." },
    ],
  }),
  component: FarmerProfilePage,
});

// ---- localStorage key for farmer crop prefs ----------------------------
const CROP_PREF_KEY = "sukshma_farmer_crop";

interface CropPref {
  crop: CropKey;
  stage: string;
  savedAt: string;
}

interface AlertPrefs {
  heavyRain: boolean;
  heatRisk: boolean;
  drySpell: boolean;
  sms: boolean;
}

const DEFAULT_ALERT_PREFS: AlertPrefs = {
  heavyRain: true,
  heatRisk: true,
  drySpell: false,
  sms: false,
};

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--card)",
    fontSize: 12,
  },
};

// ---- Main component ---------------------------------------------------
function FarmerProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Role guard
  useEffect(() => {
    if (user && user.role !== "farmer") {
      navigate({ to: "/dashboard" });
    }
  }, [user, navigate]);

  // Crop setup state
  const savedPrefRaw = localStorage.getItem(CROP_PREF_KEY);
  const savedPref: CropPref | null = savedPrefRaw ? (JSON.parse(savedPrefRaw) as CropPref) : null;

  const [crop, setCrop] = useState<CropKey>(savedPref?.crop ?? "paddy");
  const [stage, setStage] = useState<string>(savedPref?.stage ?? CROPS.paddy.stages[2]!);
  const [lastSaved, setLastSaved] = useState<string | null>(savedPref?.savedAt ?? null);

  // Alert preferences state
  const alertPrefRaw = localStorage.getItem("sukshma_alert_prefs");
  const initAlertPrefs: AlertPrefs = alertPrefRaw
    ? (JSON.parse(alertPrefRaw) as AlertPrefs)
    : DEFAULT_ALERT_PREFS;
  const [alertPrefs, setAlertPrefs] = useState<AlertPrefs>(initAlertPrefs);

  // GPS re-grant state
  const [gpsStatus, setGpsStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");

  if (!user || user.role !== "farmer") return null;

  const panchayatId = user.panchayatId ?? "kandiyur";
  const panchayat = panchayats.find((p) => p.id === panchayatId) ?? panchayats[0]!;

  // Last 7 days history for rainfall bar chart
  const historyRaw = api.history(panchayatId, 7);
  const historyData = historyRaw.map((row) => ({
    date: row.date,
    rain: isNaN(row.observedRain) || !isFinite(row.observedRain) ? 0 : Math.max(0, Number(row.observedRain.toFixed(1))),
    forecast: isNaN(row.forecastRain) || !isFinite(row.forecastRain) ? 0 : Math.max(0, Number(row.forecastRain.toFixed(1))),
  }));

  function saveCropPref() {
    const now = new Date().toISOString();
    const pref: CropPref = { crop, stage, savedAt: now };
    localStorage.setItem(CROP_PREF_KEY, JSON.stringify(pref));
    setLastSaved(now);
    toast.success("Crop setup saved.");
  }

  function saveAlertPrefs(updated: AlertPrefs) {
    setAlertPrefs(updated);
    localStorage.setItem("sukshma_alert_prefs", JSON.stringify(updated));
  }

  function requestGps() {
    setGpsStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      () => {
        setGpsStatus("granted");
        toast.success("Location access granted.");
      },
      () => {
        setGpsStatus("denied");
        toast.error("Location access denied. Please enable in browser settings.");
      },
    );
  }

  const hasGps = user.gpsLat !== undefined && user.gpsLon !== undefined;
  const gpsLabel = hasGps
    ? `${user.gpsLat?.toFixed(4)}°N, ${user.gpsLon?.toFixed(4)}°E`
    : "Not granted";

  return (
    <AppShell>
      <PageHeader
        eyebrow="Farmer Portal"
        title="My Profile"
        description="Manage your crop setup, alert preferences and view recent weather."
        actions={<DemoTag label="Demo data" />}
      />

      {/* ── A. My Details ─────────────────────────────────────── */}
      <Panel className="mb-5" eyebrow="Identity" title="My Details">
        <dl className="space-y-3">
          {[
            ["Name", user.name],
            ["Phone", user.phone ?? "—"],
            ["Panchayat", panchayat.name],
            ["Block", panchayat.block],
            ["District", panchayat.district],
            ["State", "Tamil Nadu"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
              <dt className="text-sm text-muted-foreground">{k}</dt>
              <dd className="font-medium text-foreground">{v}</dd>
            </div>
          ))}
        </dl>

        {/* GPS row */}
        <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <MapPin className={cn("size-4", hasGps || gpsStatus === "granted" ? "text-primary" : "text-muted-foreground")} />
            <div>
              <p className="text-sm font-medium text-foreground">GPS Location</p>
              <p className="text-xs text-muted-foreground">
                {gpsStatus === "requesting"
                  ? "Requesting…"
                  : gpsStatus === "denied"
                    ? "Access denied"
                    : gpsStatus === "granted"
                      ? "Just granted"
                      : gpsLabel}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-8"
            onClick={requestGps}
            disabled={gpsStatus === "requesting"}
          >
            <RefreshCw className={cn("size-3.5", gpsStatus === "requesting" && "animate-spin")} />
            {hasGps ? "Re-grant" : "Grant"}
          </Button>
        </div>
      </Panel>

      {/* ── B. My Crop Setup ──────────────────────────────────── */}
      <Panel className="mb-5" eyebrow="Crop Setup" title="My Crop & Stage">
        <div className="flex flex-wrap gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm flex items-center gap-1.5"><Sprout className="size-3.5" />Crop</Label>
            <Select
              value={crop}
              onValueChange={(v) => {
                setCrop(v as CropKey);
                setStage(CROPS[v as CropKey].stages[1]!);
              }}
            >
              <SelectTrigger className="h-10 w-[160px] bg-card"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(CROPS) as CropKey[]).map((c) => (
                  <SelectItem key={c} value={c}>{CROPS[c].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Growth Stage</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="h-10 w-[180px] bg-card"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CROPS[crop].stages.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Button onClick={saveCropPref} className="gap-2 h-10">
            <Save className="size-4" /> Save Setup
          </Button>
          {lastSaved && (
            <p className="text-sm text-muted-foreground">
              Last saved:{" "}
              {new Date(lastSaved).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </Panel>

      {/* ── C. Alert Preferences ─────────────────────────────── */}
      <Panel className="mb-5" eyebrow="Preferences" title="Alert Preferences">
        <div className="space-y-3">
          {(
            [
              { key: "heavyRain", label: "Heavy Rain alerts", desc: "Notify when heavy rainfall is expected" },
              { key: "heatRisk", label: "Heat Risk alerts", desc: "Notify when temperature exceeds safe limits" },
              { key: "drySpell", label: "Dry Spell alerts", desc: "Notify during extended dry periods" },
            ] as { key: keyof AlertPrefs; label: string; desc: string }[]
          ).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <BellRing className="size-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
              <Switch
                checked={alertPrefs[key] as boolean}
                onCheckedChange={(v) => saveAlertPrefs({ ...alertPrefs, [key]: v })}
              />
            </div>
          ))}

          {/* SMS toggle with disclaimer */}
          <div className="flex items-start justify-between rounded-lg border border-amber/40 bg-amber-soft p-4">
            <div className="flex items-start gap-3">
              <BellRing className="size-4 mt-0.5 text-amber" />
              <div>
                <p className="text-sm font-semibold">SMS notifications</p>
                <p className="text-xs text-muted-foreground">
                  SMS requires connectivity and provider setup. Currently unavailable in demo.
                </p>
              </div>
            </div>
            <Switch
              checked={alertPrefs.sms}
              onCheckedChange={(v) => {
                saveAlertPrefs({ ...alertPrefs, sms: v });
                if (v) toast.info("SMS notifications enabled (demo — no SMS will be sent without provider setup).");
              }}
            />
          </div>
        </div>
      </Panel>

      {/* ── D. My Weather History ────────────────────────────── */}
      <Panel eyebrow="Weather History" title="Last 7 Days · Rainfall" action={<DemoTag />}>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {historyData.slice(-4).map((row) => (
            <div key={row.date} className="rounded-xl border border-border bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground">{row.date}</p>
              <div className="mt-1 flex items-center justify-center gap-1">
                <CloudRain className="size-3.5 text-sky" />
                <span className="tabular text-sm font-semibold">{row.rain} mm</span>
              </div>
              <div className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                <Thermometer className="size-3" />
                <span>fcast {row.forecast} mm</span>
              </div>
            </div>
          ))}
        </div>

        <p className="mb-2 text-sm font-semibold">Observed rainfall (mm)</p>
        <div className="h-48">
          <ResponsiveContainer>
            <BarChart data={historyData} margin={{ left: -20 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" unit=" mm" />
              <Tooltip
                {...tooltipStyle}
                formatter={(v: number) => [`${v.toFixed(1)} mm`, "Rainfall"]}
              />
              <Bar dataKey="rain" name="Observed" fill="var(--sky)" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <BarChart2 className="size-3.5" />
          Illustrative demo values — not real observations.
        </p>
      </Panel>
    </AppShell>
  );
}
