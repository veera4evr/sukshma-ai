import { cn } from "@/lib/utils";

export function LogoMark({ className, inverted = false }: { className?: string, inverted?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill={inverted ? "#FFFFFF" : "var(--foreground)"} />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <rect
            key={`${r}${c}`}
            x={6 + c * 5.2}
            y={6 + r * 5.2}
            width={4}
            height={4}
            rx={1}
            fill={r + c >= 4 ? "var(--primary)" : (inverted ? "#0F172A" : "var(--card)")}
            fillOpacity={r + c >= 4 ? 1 - (6 - r - c) * 0.18 : 0.22 + (r + c) * 0.08}
          />
        )),
      )}
    </svg>
  );
}

export function Logo({ subtitle = true, inverted = false }: { subtitle?: boolean, inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark inverted={inverted} />
      <div className="leading-tight">
        <p className={cn("font-display text-[15px] font-bold tracking-tight", inverted ? "text-white" : "text-foreground")}>
          SUKSHMA-AI
        </p>
        {subtitle && (
          <p className={cn("text-[11px]", inverted ? "text-white/70" : "text-muted-foreground")}>
            Hyperlocal Weather for Every Panchayat
          </p>
        )}
      </div>
    </div>
  );
}
