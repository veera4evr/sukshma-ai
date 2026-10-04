/**
 * MapView — pure SVG/CSS India map visualization (no external map libraries).
 *
 * Renders:
 * - Simplified India SVG outline as a decorative background
 * - Dots for a sampled set of panchayats from ALL_PANCHAYATS
 * - The currently-selected panchayat highlighted with a pulsing ring
 * - State label annotations
 * - Hover tooltips showing panchayat name and weather condition
 */
import { useState } from "react";
import { ALL_PANCHAYATS, type IndiaPanchayat } from "@/lib/demo/india-panchayats";
import { api } from "@/lib/services/api";
import { cn } from "@/lib/utils";

// ── Viewport configuration ────────────────────────────────────────────────────
// We project lat/lon → SVG coordinates using a simple linear mapping
// bounded by India's approximate bounding box.
const GEO = {
  minLat: 8.0,
  maxLat: 37.5,
  minLon: 68.0,
  maxLon: 97.5,
};
const VIEW_W = 480;
const VIEW_H = 560;

function project(lat: number, lon: number): [number, number] {
  const x = ((lon - GEO.minLon) / (GEO.maxLon - GEO.minLon)) * VIEW_W;
  // SVG y-axis is inverted
  const y = ((GEO.maxLat - lat) / (GEO.maxLat - GEO.minLat)) * VIEW_H;
  return [Math.round(x), Math.round(y)];
}

// ── Simplified India outline path (hand-traced, approximate) ─────────────────
// This is a drastically simplified polygon — good enough for a demo overlay.
const INDIA_OUTLINE =
  "M 262,8 " +
  "L 310,12 L 358,25 L 390,40 L 408,58 L 420,80 " + // NW → NE
  "L 440,102 L 452,130 L 460,165 L 455,195 " +        // NE descent
  "L 465,220 L 470,248 L 460,275 " +                   // East coast
  "L 445,300 L 428,322 L 410,345 " +                   // approaching tip
  "L 390,365 L 368,380 L 345,392 " +                   // Bay of Bengal side
  "L 320,400 L 300,415 L 278,430 " +                   // South tip
  "L 255,422 L 232,408 L 210,390 " +                   // West side of tip
  "L 190,370 L 172,345 L 158,318 " +                   // West coast
  "L 148,290 L 142,265 L 138,240 " +
  "L 130,215 L 120,190 L 110,165 " +
  "L 95,138 L 85,110 L 88,82 " +                       // NW coast
  "L 100,58 L 118,38 L 148,22 " +                      // back to NW
  "L 182,12 L 220,8 L 262,8 Z";

// ── State label positions (SVG coordinates for major states) ─────────────────
const STATE_LABELS = [
  { name: "Punjab",    x: 175, y: 62  },
  { name: "Rajasthan", x: 130, y: 155 },
  { name: "UP",        x: 255, y: 120 },
  { name: "Gujarat",   x: 105, y: 225 },
  { name: "MP",        x: 215, y: 195 },
  { name: "WB",        x: 370, y: 160 },
  { name: "Maharashtra",x: 185,y: 270 },
  { name: "Odisha",    x: 320, y: 230 },
  { name: "AP",        x: 275, y: 310 },
  { name: "Karnataka", x: 215, y: 345 },
  { name: "TN",        x: 255, y: 385 },
  { name: "Kerala",    x: 192, y: 390 },
];

// ── Sample a diverse set of panchayats for the dots ──────────────────────────
// Show all registered ones + a broad sample of national ones
const DISPLAYED = ALL_PANCHAYATS;

// ── Tooltip ───────────────────────────────────────────────────────────────────
interface TooltipState {
  p: IndiaPanchayat;
  svgX: number;
  svgY: number;
}

// ── Component ─────────────────────────────────────────────────────────────────
interface MapViewProps {
  /** Highlighted panchayat id (from GPS or selection) */
  highlightId?: string | null;
  className?: string;
}

export function MapView({ highlightId, className }: MapViewProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border bg-card", className)}>
      {/* Header */}
      <div className="border-b border-border px-5 py-3">
        <p className="eyebrow">Panchayat coverage map</p>
        <p className="text-sm font-semibold text-foreground">India — demo network</p>
      </div>

      {/* SVG map */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full"
          style={{ maxHeight: 480 }}
          aria-label="India panchayat map"
        >
          {/* Ocean background */}
          <rect width={VIEW_W} height={VIEW_H} className="fill-sky-50 dark:fill-sky-950/30" />

          {/* India landmass */}
          <path
            d={INDIA_OUTLINE}
            className="fill-emerald-50 stroke-emerald-300 dark:fill-emerald-950/50 dark:stroke-emerald-700"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />

          {/* State labels */}
          {STATE_LABELS.map((l) => (
            <text
              key={l.name}
              x={l.x}
              y={l.y}
              className="fill-emerald-700/50 dark:fill-emerald-400/40"
              fontSize={9}
              fontWeight={600}
              textAnchor="middle"
              aria-hidden
            >
              {l.name}
            </text>
          ))}

          {/* Panchayat dots */}
          {DISPLAYED.map((p) => {
            const [cx, cy] = project(p.lat, p.lon);
            const isHighlighted = p.id === highlightId;
            const isRegistered = p.registered;

            return (
              <g
                key={p.id}
                onMouseEnter={() => setTooltip({ p, svgX: cx, svgY: cy })}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: "pointer" }}
                role="img"
                aria-label={p.name}
              >
                {/* Pulsing outer ring for highlighted panchayat */}
                {isHighlighted && (
                  <>
                    <circle cx={cx} cy={cy} r={14} className="fill-green-400/20" />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={9}
                      className="fill-none stroke-green-500"
                      strokeWidth={1.5}
                    >
                      <animate
                        attributeName="r"
                        values="9;16;9"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.8;0;0.8"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </>
                )}

                {/* Main dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHighlighted ? 6 : isRegistered ? 4 : 3}
                  className={cn(
                    isHighlighted
                      ? "fill-green-500 stroke-white"
                      : isRegistered
                        ? "fill-emerald-500 stroke-white"
                        : "fill-slate-400 stroke-white dark:fill-slate-500",
                  )}
                  strokeWidth={1}
                />
              </g>
            );
          })}

          {/* SVG tooltip (positioned near the dot) */}
          {tooltip && (() => {
            const { p, svgX, svgY } = tooltip;
            // Clamp so tooltip doesn't overflow SVG
            const tx = Math.min(svgX, VIEW_W - 100);
            const ty = svgY - 48;
            const weather = p.registered ? api.weather(p.id) : null;
            return (
              <g key="tooltip">
                <rect
                  x={tx - 4}
                  y={ty - 14}
                  width={104}
                  height={weather ? 42 : 26}
                  rx={5}
                  className="fill-card stroke-border"
                  strokeWidth={0.8}
                  style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.15))" }}
                />
                <text
                  x={tx + 48}
                  y={ty + 1}
                  fontSize={8.5}
                  fontWeight={700}
                  textAnchor="middle"
                  className="fill-foreground"
                >
                  {p.name}
                </text>
                <text
                  x={tx + 48}
                  y={ty + 13}
                  fontSize={7.5}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                >
                  {p.district}, {p.state}
                </text>
                {weather && (
                  <text
                    x={tx + 48}
                    y={ty + 24}
                    fontSize={7.5}
                    textAnchor="middle"
                    className="fill-emerald-600"
                  >
                    {weather.tempC.toFixed(0)}°C · {weather.condition}
                  </text>
                )}
              </g>
            );
          })()}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1 rounded-lg border border-border bg-card/90 px-3 py-2 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <span className="block size-2.5 rounded-full bg-green-500" />
            GPS match
          </div>
          <div className="flex items-center gap-1.5">
            <span className="block size-2.5 rounded-full bg-emerald-500" />
            Registered
          </div>
          <div className="flex items-center gap-1.5">
            <span className="block size-2.5 rounded-full bg-slate-400" />
            National coverage
          </div>
        </div>
      </div>
    </div>
  );
}
