import { scaleTime } from "d3-scale";
import type { Law, Lens, NodePos } from "../types";
import { DOMAIN_ORDER, INSTRUMENT_RADIUS } from "./palette";

export interface LayoutResult {
  positions: Record<string, NodePos>;
  clusters: ClusterLabel[]; // group headings for the current lens
  timeAxis?: { x: number; label: string; major: boolean }[];
  velocity?: { year: number; count: number }[];
  swimLanes?: { key: string; y: number; label: string }[];
  brush?: {
    padL: number;
    padR: number;
    laneTop: number;
    laneBottom: number;
    xToYear: (px: number) => number;
    yearToX: (y: number) => number;
  };
  height: number;
}

export interface ClusterLabel {
  key: string;
  label: string;
  cx: number;
  cy: number;
  count: number;
}

export const TIMELINE_DOMAINS = DOMAIN_ORDER;

const MIN_YEAR = 1885;
const MAX_YEAR = 2025;

function radius(l: Law) {
  return INSTRUMENT_RADIUS[l.instrumentType] ?? 5;
}

/** Deterministic hash so undated / stacking jitter is stable across renders. */
function hash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/* ------------------------------------------------------------------ *
 * TIMELINE — x = date, swim-lanes by domain, undated parked at right  *
 * ------------------------------------------------------------------ */
function timelineLayout(laws: Law[], width: number): LayoutResult {
  const padL = 70;
  const padR = 40;
  const laneTop = 92;
  const laneH = 52;
  const lanes = TIMELINE_DOMAINS;
  const height = laneTop + lanes.length * laneH + 60;

  const x = scaleTime()
    .domain([new Date(MIN_YEAR, 0, 1), new Date(MAX_YEAR, 11, 31)])
    .range([padL, width - padR - 90]); // reserve right gutter for undated

  const laneY: Record<string, number> = {};
  const swimLanes = lanes.map((d, i) => {
    const y = laneTop + i * laneH + laneH / 2;
    laneY[d] = y;
    return { key: d, y, label: d };
  });

  const positions: Record<string, NodePos> = {};
  // Per-lane vertical de-overlap: keep a list of placed {x,y} in each lane and
  // nudge new nodes up/down when they'd crowd a neighbour at the same date.
  const laneList: Record<string, { x: number; y: number }[]> = {};
  lanes.forEach((d) => (laneList[d] = []));

  const undatedX = width - padR - 45;
  const dated = [...laws].sort((a, b) => (a.dateISO ?? "z").localeCompare(b.dateISO ?? "z"));

  for (const l of dated) {
    const r = radius(l);
    const lane = l.domain;
    const baseY = laneY[lane] ?? laneTop;
    const px = l.dateISO ? x(new Date(l.dateISO)) : undatedX + (hash(l.id) - 0.5) * 26;

    const list = laneList[lane] ?? (laneList[lane] = []);
    const overlaps = (yy: number) =>
      list.some((p) => Math.abs(p.x - px) < r * 1.7 && Math.abs(p.y - yy) < r * 1.9);
    const dir = hash(l.id + "d") > 0.5 ? 1 : -1;
    let py = baseY;
    let tries = 0;
    while (overlaps(py) && tries < 14) {
      tries++;
      py = baseY + dir * Math.ceil(tries / 2) * r * 1.9;
    }
    list.push({ x: px, y: py });
    positions[l.id] = { id: l.id, x: px, y: py, r };
  }

  // Time axis ticks
  const ticks = [1885, 1900, 1920, 1940, 1960, 1980, 1990, 2000, 2005, 2010, 2015, 2020, 2025];
  const timeAxis = ticks.map((yr) => ({
    x: x(new Date(yr, 0, 1)),
    label: String(yr),
    major: [1885, 2000, 2016, 2023, 2025].includes(yr),
  }));

  // velocity: count per year
  const byYear: Record<number, number> = {};
  for (const l of laws) if (l.year) byYear[l.year] = (byYear[l.year] || 0) + 1;
  const velocity: { year: number; count: number }[] = [];
  for (let yr = MIN_YEAR; yr <= MAX_YEAR; yr++) velocity.push({ year: yr, count: byYear[yr] || 0 });

  const brush = {
    padL,
    padR: padR + 90,
    laneTop: laneTop - 20,
    laneBottom: laneTop + lanes.length * laneH,
    xToYear: (px: number) => x.invert(px).getFullYear(),
    yearToX: (yr: number) => x(new Date(yr, 0, 1)),
  };

  return { positions, clusters: [], timeAxis, velocity, swimLanes, brush, height };
}

/* ------------------------------------------------------------------ *
 * CLUSTERED lenses — grid of cluster centroids + force packing        *
 * ------------------------------------------------------------------ */
function clusterKey(l: Law, lens: Lens): { key: string; label: string; order: number } {
  switch (lens) {
    case "family":
      return { key: l.parentStatute, label: l.parentStatute, order: parentOrder(l.parentStatute) };
    case "power": {
      const k = l.empoweringSection ?? "none";
      return { key: k, label: k === "none" ? "No section" : k, order: sectionOrder(k) };
    }
    case "instrument":
      return { key: l.instrumentType, label: l.instrumentType, order: instrOrder(l.instrumentType) };
    case "status":
      return { key: l.status, label: l.status, order: statusOrder(l.status) };
    default:
      return { key: l.domain, label: l.domain, order: 0 };
  }
}

const parentOrder = (p: string) =>
  ["IT Act 2000", "Aadhaar Act 2016", "Telegraph Act 1885", "Telecom Act 2023", "TRAI Act 1997", "Standalone"].indexOf(p);
const sectionOrder = (s: string) =>
  ["s.70", "s.79A", "s.69A", "s.69B", "s.46", "s.88", "s.7", "none"].indexOf(s);
const instrOrder = (i: string) =>
  ["Act", "Rule", "Regulation", "Notification", "Policy/Framework", "Order"].indexOf(i);
const statusOrder = (s: string) =>
  ["In force", "Consolidated", "Superseded/Rescinded", "Draft/Proposed"].indexOf(s);

function clusteredLayout(laws: Law[], lens: Lens, width: number): LayoutResult {
  // group
  const groups = new Map<string, { label: string; order: number; items: Law[] }>();
  for (const l of laws) {
    const { key, label, order } = clusterKey(l, lens);
    if (!groups.has(key)) groups.set(key, { label, order, items: [] });
    groups.get(key)!.items.push(l);
  }
  const entries = [...groups.entries()].sort((a, b) => a[1].order - b[1].order);

  // grid of cluster centroids
  const n = entries.length;
  const cols = n <= 3 ? n : n <= 4 ? 2 : n <= 6 ? 3 : 4;
  const rows = Math.ceil(n / cols);
  const colW = width / cols;
  const topPad = 130;
  const rowH = 280;
  const height = topPad + rows * rowH + 40;

  const centroids: Record<string, { cx: number; cy: number }> = {};
  const clusters: ClusterLabel[] = entries.map(([key, g], i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = colW * col + colW / 2;
    const cy = topPad + row * rowH + rowH / 2;
    centroids[key] = { cx, cy };
    return { key, label: g.label, cx, cy, count: g.items.length };
  });

  // Deterministic phyllotaxis (sunflower) pack around each centroid. Bigger
  // instruments (larger r) are placed first so they land near the middle.
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));
  const positions: Record<string, NodePos> = {};
  const maxClusterR = Math.min(colW, rowH) * 0.44;

  for (const [key, g] of entries) {
    const { cx, cy } = centroids[key];
    const items = [...g.items].sort((a, b) => radius(b) - radius(a));
    const count = items.length;
    // spacing so the whole cluster fits inside its cell radius
    const spacing = Math.min(15, count > 1 ? maxClusterR / Math.sqrt(count) : 0);
    items.forEach((l, j) => {
      const rr = spacing * Math.sqrt(j);
      const ang = j * GOLDEN + hash(key) * 6.28; // per-cluster rotation
      positions[l.id] = {
        id: l.id,
        x: cx + rr * Math.cos(ang),
        y: cy + rr * Math.sin(ang),
        r: radius(l),
      };
    });
  }

  return { positions, clusters, height };
}

export function computeLayout(laws: Law[], lens: Lens, width: number): LayoutResult {
  if (lens === "timeline") return timelineLayout(laws, width);
  return clusteredLayout(laws, lens, width);
}
