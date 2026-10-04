import type { ReactNode } from "react";
import { ArrowRight, FlaskConical, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { BLOCKS, DISTRICT, panchayats } from "@/lib/demo/data";
import { uncertaintyRange, type ReliabilityLevel } from "@/lib/demo/engine";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Panel({ title, eyebrow, action, children, className }: { title?: ReactNode; eyebrow?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("card-surface p-5 md:p-6", className)}>
      {(title || eyebrow || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
            {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function DemoTag({ label = "Demo data" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber/40 bg-amber-soft px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground">
      <FlaskConical className="size-3" /> {label}
    </span>
  );
}

const levelStyle: Record<ReliabilityLevel, string> = {
  High: "bg-success-soft text-accent-foreground border-primary/30",
  Medium: "bg-amber-soft text-foreground border-amber/40",
  Low: "bg-risk-soft text-risk border-risk/30",
};

export function ReliabilityBadge({ level, className }: { level: ReliabilityLevel; className?: string }) {
  const Icon = level === "High" ? ShieldCheck : level === "Medium" ? Shield : ShieldAlert;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", levelStyle[level], className)}>
      <Icon className="size-3.5" /> {level}
    </span>
  );
}

export function UncertaintyBar({ value, score, max, unit }: { value: number; score: number; max: number; unit: string }) {
  const [lo, hi] = uncertaintyRange(value, score);
  const pct = (v: number) => `${Math.min(100, (v / max) * 100)}%`;
  return (
    <div>
      <div className="relative h-3 rounded-full bg-muted">
        <div className="absolute inset-y-0 rounded-full bg-sky/25" style={{ left: pct(lo), width: `calc(${pct(hi)} - ${pct(lo)})` }} />
        <div className="absolute -top-1 h-5 w-1 -translate-x-1/2 rounded-full bg-sky" style={{ left: pct(value) }} />
      </div>
      <div className="mt-2 flex justify-between font-mono text-xs text-muted-foreground">
        <span>0</span>
        <span className="text-foreground">
          Expected range {lo.toFixed(0)}–{hi.toFixed(0)} {unit}
        </span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export function Metric({ icon, label, value, unit, tone = "primary" }: { icon: ReactNode; label: string; value: string; unit?: string; tone?: "primary" | "sky" | "teal" | "amber" | "violet" }) {
  const tones = {
    primary: "bg-accent text-accent-foreground",
    sky: "bg-sky-soft text-sky",
    teal: "bg-teal-soft text-teal",
    amber: "bg-amber-soft text-amber",
    violet: "bg-violet-soft text-violet",
  };
  return (
    <div className="flex items-center gap-3">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl [&_svg]:size-5", tones[tone])}>{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="tabular text-lg font-semibold text-foreground">
          {value}
          {unit && <span className="ml-0.5 text-sm font-medium text-muted-foreground">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

export function PanchayatPicker({ value, onChange, showHierarchy = false }: { value: string; onChange: (id: string) => void; showHierarchy?: boolean }) {
  const current = (panchayats.find((p) => p.id === value) ?? panchayats[0])!;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showHierarchy && (
        <>
          <Select value={DISTRICT} disabled>
            <SelectTrigger className="h-10 w-[140px] bg-card"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value={DISTRICT}>{DISTRICT}</SelectItem></SelectContent>
          </Select>
          <Select
            value={current.block}
            onValueChange={(b) => onChange(panchayats.find((p) => p.block === b)!.id)}
          >
            <SelectTrigger className="h-10 w-[150px] bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              {BLOCKS.map((b) => (
                <SelectItem key={b} value={b}>{b} block</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
      <Select value={current.id} onValueChange={onChange}>
        <SelectTrigger className="h-10 w-[180px] bg-card font-semibold"><SelectValue /></SelectTrigger>
        <SelectContent>
          {(showHierarchy ? panchayats.filter((p) => p.block === current.block) : panchayats).map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function Flow({ steps, highlight, vertical }: { steps: string[]; highlight?: string; vertical?: boolean }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", vertical && "flex-col items-stretch")}>
      {steps.map((s, i) => (
        <div key={s} className={cn("flex items-center gap-2", vertical && "flex-col")}>
          <span
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-semibold",
              s === highlight ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground",
            )}
          >
            {s}
          </span>
          {i < steps.length - 1 && <ArrowRight className={cn("size-4 text-muted-foreground", vertical && "rotate-90")} />}
        </div>
      ))}
    </div>
  );
}
