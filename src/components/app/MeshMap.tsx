import { useMemo } from "react";
import {
  MAP_H,
  MAP_W,
  coarseGrid,
  fineGrid,
  panchayats,
  stations,
  tempDelta,
  type Cell,
  type LayerKey,
} from "@/lib/demo/data";
import { weatherFor } from "@/lib/demo/engine";
import { cn } from "@/lib/utils";

export const LAYERS: Record<
  LayerKey,
  { label: string; unit: string; min: number; max: number; scale: string; steps: number }
> = {
  rain: { label: "Rainfall", unit: "mm / 24h", min: 0, max: 60, scale: "rain", steps: 6 },
  temp: { label: "Temperature", unit: "°C", min: 30, max: 38, scale: "temp", steps: 6 },
  humidity: { label: "Humidity", unit: "%", min: 60, max: 95, scale: "hum", steps: 6 },
  reliability: { label: "Reliability", unit: "confidence", min: 0.4, max: 0.92, scale: "rel", steps: 6 },
  delta: { label: "Weather Delta", unit: "mm vs block", min: -20, max: 20, scale: "delta", steps: 7 },
};

export function colorFor(layer: LayerKey, v: number) {
  const m = LAYERS[layer];
  const t = Math.min(0.9999, Math.max(0, (v - m.min) / (m.max - m.min)));
  return `var(--${m.scale}-${Math.floor(t * m.steps)})`;
}

function panchayatValue(layer: LayerKey, id: string) {
  const w = weatherFor(panchayats.find((p) => p.id === id)!);
  const v = layer === "temp" ? w.tempC : layer === "humidity" ? w.humidity : layer === "reliability" ? w.reliability : w.rainMm;
  return fmt(layer === "delta" ? "rain" : layer, v);
}

export function fmt(layer: LayerKey, v: number) {
  if (layer === "reliability") return `${Math.round(v * 100)}%`;
  if (layer === "delta") return `${v > 0 ? "+" : ""}${v.toFixed(1)}`;
  return v.toFixed(layer === "temp" ? 1 : 0);
}

interface Props {
  layer: LayerKey;
  mode?: "fine" | "coarse";
  selectedId?: string | undefined;
  onSelect?: (id: string) => void;
  showBoundaries?: boolean;
  showStations?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  deltaKind?: "rain" | "temp";
  className?: string;
}

export function MeshMap({
  layer,
  mode = "fine",
  selectedId,
  onSelect,
  showBoundaries = true,
  showStations = false,
  showLabels = true,
  showValues = false,
  deltaKind = "rain",
  className,
}: Props) {
  const cells: Cell[] = mode === "fine" ? fineGrid : coarseGrid;
  const value = (c: Cell) => (layer === "delta" && deltaKind === "temp" ? tempDelta(c) * 6 : c.values[layer]);
  const selected = panchayats.find((p) => p.id === selectedId);
  const tiles = useMemo(
    () =>
      cells.map((c) => (
        <rect
          key={`${c.col}-${c.row}`}
          x={c.x}
          y={c.y}
          width={c.w + 0.4}
          height={c.h + 0.4}
          fill={colorFor(layer, mode === "coarse" && layer === "delta" ? 0 : value(c))}
        />
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layer, mode, deltaKind],
  );

  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className={cn("h-auto w-full touch-manipulation select-none rounded-xl", className)}
      role="img"
      aria-label={`${LAYERS[layer].label} map (demo data)`}
    >
      <g>{tiles}</g>
      {mode === "fine" && (
        <g stroke="var(--background)" strokeOpacity={0.25} strokeWidth={0.4}>
          {Array.from({ length: 33 }, (_, i) => (
            <line key={`v${i}`} x1={i * 15} y1={0} x2={i * 15} y2={MAP_H} />
          ))}
          {Array.from({ length: 25 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 15} x2={MAP_W} y2={i * 15} />
          ))}
        </g>
      )}
      {mode === "coarse" &&
        showValues &&
        coarseGrid.map((c) => (
          <text
            key={`t${c.col}${c.row}`}
            x={c.x + c.w / 2}
            y={c.y + c.h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground font-mono text-[13px] font-semibold"
          >
            {fmt(layer, c.values[layer])}
          </text>
        ))}
      {showBoundaries &&
        panchayats.map((p) => {
          const active = p.id === selectedId;
          return (
            <g key={p.id} onClick={() => onSelect?.(p.id)} className={onSelect ? "cursor-pointer" : undefined}>
              <polygon
                points={p.polygon.map((pt) => pt.join(",")).join(" ")}
                fill={active ? "var(--foreground)" : "transparent"}
                fillOpacity={active ? 0.08 : 0}
                stroke="var(--foreground)"
                strokeOpacity={active ? 0.95 : 0.45}
                strokeWidth={active ? 2.2 : 1}
                className="transition-all hover:fill-[var(--foreground)] hover:[fill-opacity:0.06]"
              />
              {showLabels && (
                <text
                  x={p.centroid[0]}
                  y={p.centroid[1] + (showValues ? -6 : 0)}
                  textAnchor="middle"
                  className="pointer-events-none fill-foreground text-[10px] font-semibold"
                  style={{ paintOrder: "stroke", stroke: "var(--card)", strokeWidth: 3, strokeOpacity: 0.85 }}
                >
                  {p.name}
                </text>
              )}
              {showValues && mode === "fine" && (
                <text
                  x={p.centroid[0]}
                  y={p.centroid[1] + 8}
                  textAnchor="middle"
                  className="pointer-events-none fill-foreground font-mono text-[10px]"
                  style={{ paintOrder: "stroke", stroke: "var(--card)", strokeWidth: 3, strokeOpacity: 0.85 }}
                >
                  {panchayatValue(layer, p.id)}
                </text>
              )}
            </g>
          );
        })}
      {showStations &&
        stations.map((s) => (
          <g key={s.id} transform={`translate(${s.pos[0]},${s.pos[1]})`}>
            <rect x={-6} y={-6} width={12} height={12} rx={2} fill="var(--card)" stroke="var(--violet)" strokeWidth={2} />
            <circle r={2.4} fill="var(--violet)" />
          </g>
        ))}
      {selected && (
        <g transform={`translate(${selected.centroid[0]},${selected.centroid[1] - 18})`} className="pointer-events-none">
          <path d="M0 10 C -7 0 -7 -8 0 -8 C 7 -8 7 0 0 10 Z" fill="var(--primary)" stroke="var(--card)" strokeWidth={1.5} />
          <circle cy={-2} r={2.4} fill="var(--card)" />
        </g>
      )}
    </svg>
  );
}

export function Legend({ layer, compact }: { layer: LayerKey; compact?: boolean }) {
  const m = LAYERS[layer];
  return (
    <div className={cn("flex items-center gap-3", compact && "gap-2")}>
      <span className="text-xs font-semibold text-foreground">{m.label}</span>
      <div className="flex flex-col gap-1">
        <div className="flex h-2.5 overflow-hidden rounded-full">
          {Array.from({ length: m.steps }, (_, i) => (
            <span key={i} className="w-6" style={{ background: `var(--${m.scale}-${i})` }} />
          ))}
        </div>
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>{fmt(layer, m.min)}</span>
          <span>{m.unit}</span>
          <span>{fmt(layer, m.max)}</span>
        </div>
      </div>
    </div>
  );
}
