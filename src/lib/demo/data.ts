/**
 * DEMO DATA — deterministic synthetic weather fields for the SUKSHMA-AI prototype.
 * Nothing here is an observation or a real model output. Replace via the service
 * layer (src/lib/services/api.ts) when live forecasts and ML inference exist.
 */

export type Pt = [number, number];
export type LayerKey = "rain" | "temp" | "humidity" | "reliability" | "delta";
export type CropKey = "paddy" | "groundnut" | "maize";

export const MAP_W = 480;
export const MAP_H = 360;
export const FINE_COLS = 32; // ~1 km target grid (demo)
export const FINE_ROWS = 24;
export const COARSE_COLS = 4; // block-level forecast cells
export const COARSE_ROWS = 3;

export const DISTRICT = "Thanjavur";
export const BLOCKS = ["Thiruvaiyaru", "Papanasam", "Orathanadu"] as const;

const NAMES = [
  "Kandiyur", "Naducauvery", "Tirupalanam", "Melattur",
  "Kabisthalam", "Ayyampettai", "Ammapettai", "Vilangudi",
  "Okkanadu", "Thennamanadu", "Kannanthangudi", "Pudur",
];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ---------- synthetic continuous fields (normalised x,y in 0..1) ----------
const g = (x: number, y: number, cx: number, cy: number, s: number) =>
  Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / s);

export const elevation = (x: number, y: number) => 0.9 * g(x, y, 0.12, 0.18, 0.05) + 0.3 * g(x, y, 0.9, 0.9, 0.03);

export function fineField(layer: Exclude<LayerKey, "delta">, x: number, y: number): number {
  const rain =
    58 * g(x, y, 0.7, 0.3, 0.035) + 28 * g(x, y, 0.25, 0.72, 0.025) + 6 + 3 * Math.sin(x * 14) * Math.cos(y * 11);
  if (layer === "rain") return Math.max(0, rain);
  if (layer === "temp") return 34.5 - 5 * elevation(x, y) + 1.4 * x - rain * 0.045;
  if (layer === "humidity") return Math.min(98, 60 + rain * 0.42 + (1 - x) * 5);
  // reliability 0..1 — lower near convective core and complex terrain
  return Math.max(0.3, 0.92 - 0.38 * g(x, y, 0.66, 0.34, 0.012) - 0.18 * elevation(x, y) - 0.05 * y);
}

export interface Cell {
  col: number;
  row: number;
  x: number;
  y: number;
  w: number;
  h: number;
  values: Record<LayerKey, number>;
}

function buildFine(): Cell[] {
  const cw = MAP_W / FINE_COLS;
  const ch = MAP_H / FINE_ROWS;
  const raw: Cell[] = [];
  for (let r = 0; r < FINE_ROWS; r++)
    for (let c = 0; c < FINE_COLS; c++) {
      const nx = (c + 0.5) / FINE_COLS;
      const ny = (r + 0.5) / FINE_ROWS;
      raw.push({
        col: c, row: r, x: c * cw, y: r * ch, w: cw, h: ch,
        values: {
          rain: fineField("rain", nx, ny),
          temp: fineField("temp", nx, ny),
          humidity: fineField("humidity", nx, ny),
          reliability: fineField("reliability", nx, ny),
          delta: 0,
        },
      });
    }
  return raw;
}

export const fineGrid: Cell[] = buildFine();

function buildCoarse(): Cell[] {
  const cw = MAP_W / COARSE_COLS;
  const ch = MAP_H / COARSE_ROWS;
  const out: Cell[] = [];
  for (let r = 0; r < COARSE_ROWS; r++)
    for (let c = 0; c < COARSE_COLS; c++) {
      const inside = fineGrid.filter((f) => f.x >= c * cw && f.x < (c + 1) * cw && f.y >= r * ch && f.y < (r + 1) * ch);
      const mean = (k: LayerKey) => inside.reduce((a, f) => a + f.values[k], 0) / inside.length;
      out.push({
        col: c, row: r, x: c * cw, y: r * ch, w: cw, h: ch,
        values: { rain: mean("rain"), temp: mean("temp"), humidity: mean("humidity"), reliability: mean("reliability"), delta: 0 },
      });
    }
  return out;
}

export const coarseGrid: Cell[] = buildCoarse();

export function coarseAt(x: number, y: number): Cell {
  const c = Math.min(COARSE_COLS - 1, Math.floor(x / (MAP_W / COARSE_COLS)));
  const r = Math.min(COARSE_ROWS - 1, Math.floor(y / (MAP_H / COARSE_ROWS)));
  return coarseGrid[r * COARSE_COLS + c]!;
}

// rainfall delta (fine − coarse) and temperature delta
for (const f of fineGrid) {
  const c = coarseAt(f.x + 0.1, f.y + 0.1);
  f.values.delta = f.values.rain - c.values.rain;
}
export const tempDelta = (f: Cell) => f.values.temp - coarseAt(f.x + 0.1, f.y + 0.1).values.temp;

// ---------- Panchayat boundaries (jittered lattice → shared edges) ----------
function buildVertices(): Pt[][] {
  const rand = seeded(42);
  const cols = 5, rows = 4;
  const v: Pt[][] = [];
  for (let r = 0; r < rows; r++) {
    v.push([]);
    for (let c = 0; c < cols; c++) {
      const bx = (c / (cols - 1)) * MAP_W;
      const by = (r / (rows - 1)) * MAP_H;
      const edgeX = c === 0 || c === cols - 1;
      const edgeY = r === 0 || r === rows - 1;
      v[r]!.push([bx + (edgeX ? 0 : (rand() - 0.5) * 60), by + (edgeY ? 0 : (rand() - 0.5) * 50)]);
    }
  }
  return v;
}

export interface Panchayat {
  id: string;
  name: string;
  block: (typeof BLOCKS)[number];
  district: string;
  polygon: Pt[];
  centroid: Pt;
  population: number;
}

function pip([x, y]: Pt, poly: Pt[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const V = buildVertices();
const rand = seeded(7);
export const panchayats: Panchayat[] = NAMES.map((name, i) => {
  const c = i % 4;
  const r = Math.floor(i / 4);
  const polygon: Pt[] = [V[r]![c]!, V[r]![c + 1]!, V[r + 1]![c + 1]!, V[r + 1]![c]!];
  const centroid: Pt = [polygon.reduce((a, p) => a + p[0], 0) / 4, polygon.reduce((a, p) => a + p[1], 0) / 4];
  return {
    id: name.toLowerCase(),
    name,
    block: BLOCKS[r]!,
    district: DISTRICT,
    polygon,
    centroid,
    population: Math.round(3000 + rand() * 9000),
  };
});

export function cellsIn(p: Panchayat) {
  return fineGrid.filter((f) => pip([f.x + f.w / 2, f.y + f.h / 2], p.polygon));
}

// ---------- stations (local observations, demo) ----------
export interface Station {
  id: string;
  name: string;
  pos: Pt;
  type: "AWS" | "ARG";
}
export const stations: Station[] = [
  { id: "aws-01", name: "Thiruvaiyaru AWS", pos: [150, 70], type: "AWS" },
  { id: "arg-02", name: "Papanasam Rain Gauge", pos: [330, 175], type: "ARG" },
  { id: "aws-03", name: "Orathanadu AWS", pos: [95, 290], type: "AWS" },
];

export const seededRandom = seeded;
