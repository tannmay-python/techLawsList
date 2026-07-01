import { scaleTime } from "d3-scale";
import type { Law, Lens } from "../types";
import { GROUP_ORDER, radiusForType } from "./palette";

export interface NodePos { id: string; x: number; y: number; r: number; }

export interface ClusterLabel { key: string; label: string; cx: number; cy: number; count: number; }

export interface LayoutResult {
  positions: Record<string, NodePos>;
  clusters: ClusterLabel[];
  timeAxis?: { x: number; label: string; major: boolean }[];
  velocity?: { year: number; count: number }[];
  swimLanes?: { key: string; y: number; label: string }[];
  brush?: { padL: number; padR: number; laneTop: number; laneBottom: number; xToYear: (px: number) => number; yearToX: (y: number) => number };
  height: number;
}

const MIN_YEAR = 1885;
const MAX_YEAR = 2025;

function hash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967295;
}

/* ---------------- TIMELINE ---------------- */
function timelineLayout(laws: Law[], width: number): LayoutResult {
  const padL = 78, padR = 40;
  const laneTop = 92, laneH = 46;
  const lanes = GROUP_ORDER;
  const height = laneTop + lanes.length * laneH + 70;

  const x = scaleTime()
    .domain([new Date(MIN_YEAR, 0, 1), new Date(MAX_YEAR, 11, 31)])
    .range([padL, width - padR - 60]);

  const laneY: Record<string, number> = {};
  const swimLanes = lanes.map((d, i) => {
    const y = laneTop + i * laneH + laneH / 2;
    laneY[d] = y;
    return { key: d, y, label: d };
  });

  const positions: Record<string, NodePos> = {};
  const laneList: Record<string, { x: number; y: number }[]> = {};
  lanes.forEach((d) => (laneList[d] = []));
  const undatedX = width - padR - 30;
  const dated = [...laws].sort((a, b) => (a.dateISO ?? "z").localeCompare(b.dateISO ?? "z"));

  for (const l of dated) {
    const r = radiusForType(l.type);
    const lane = l.group;
    const baseY = laneY[lane] ?? laneTop;
    const px = l.dateISO ? x(new Date(l.dateISO)) : undatedX + (hash(l.id) - 0.5) * 22;
    const list = laneList[lane] ?? (laneList[lane] = []);
    const overlaps = (yy: number) => list.some((p) => Math.abs(p.x - px) < r * 1.5 && Math.abs(p.y - yy) < r * 1.7);
    const dir = hash(l.id + "d") > 0.5 ? 1 : -1;
    let py = baseY, tries = 0;
    while (overlaps(py) && tries < 12) { tries++; py = baseY + dir * Math.ceil(tries / 2) * r * 1.7; }
    list.push({ x: px, y: py });
    positions[l.id] = { id: l.id, x: px, y: py, r };
  }

  const ticks = [1885, 1920, 1950, 1970, 1990, 2000, 2005, 2010, 2015, 2020, 2025];
  const timeAxis = ticks.map((yr) => ({
    x: x(new Date(yr, 0, 1)), label: String(yr),
    major: [1885, 2000, 2016, 2023, 2025].includes(yr),
  }));

  const byYear: Record<number, number> = {};
  for (const l of laws) if (l.year) byYear[l.year] = (byYear[l.year] || 0) + 1;
  const velocity: { year: number; count: number }[] = [];
  for (let yr = MIN_YEAR; yr <= MAX_YEAR; yr++) velocity.push({ year: yr, count: byYear[yr] || 0 });

  const brush = {
    padL, padR: padR + 60, laneTop: laneTop - 20, laneBottom: laneTop + lanes.length * laneH,
    xToYear: (px: number) => x.invert(px).getFullYear(),
    yearToX: (yr: number) => x(new Date(yr, 0, 1)),
  };
  return { positions, clusters: [], timeAxis, velocity, swimLanes, brush, height };
}

/* ---------------- CLUSTERED ---------------- */
function clusterKey(l: Law, lens: Lens): { key: string; label: string; order: number } {
  switch (lens) {
    case "group": return { key: l.group, label: l.group, order: GROUP_ORDER.indexOf(l.group as any) };
    case "family": return { key: l.parentStatute, label: l.parentStatute, order: parentOrder(l.parentStatute) };
    case "power": { const k = l.empoweringSection ?? "none"; return { key: k, label: k === "none" ? "No section" : k, order: sectionOrder(k) }; }
    case "type": return { key: l.type, label: l.type, order: typeOrder(l.type) };
    case "status": return { key: l.status, label: l.status, order: statusOrder(l.status) };
    case "binding": return { key: l.bindingForce, label: shortBinding(l.bindingForce), order: bindingOrder(l.bindingForce) };
    default: return { key: l.group, label: l.group, order: 0 };
  }
}

const parentOrder = (p: string) => ["IT Act 2000", "Aadhaar Act 2016", "Telegraph Act 1885", "Telecom Act 2023", "TRAI Act 1997", "DPDP Act 2023", "MMDR Act 1957", "PSS Act 2007", "Standalone"].indexOf(p);
const sectionOrder = (s: string) => ["s.70", "s.79A", "s.69A", "s.69B", "s.69", "s.70B", "s.46", "s.88", "s.7", "none"].indexOf(s);
const typeOrder = (t: string) => ["Act", "Amendment Act", "Rules", "Regulations", "Notification", "Order", "Policy / Framework", "Scheme", "Guidelines", "Strategy", "Advisory", "Directive", "Directions", "Bill (Draft)", "Control List"].indexOf(t);
const statusOrder = (s: string) => ["In force", "In force (phased)", "Consolidated", "Superseded / Repealed", "Draft / Proposed"].indexOf(s);
const bindingOrder = (b: string) => ["Primary legislation", "Subordinate / statutory instrument", "Soft law / policy", "Draft (not in force)"].indexOf(b);
function shortBinding(b: string) {
  if (b.startsWith("Primary")) return "Primary legislation";
  if (b.startsWith("Subordinate")) return "Subordinate instrument";
  if (b.startsWith("Soft")) return "Soft law / policy";
  return "Draft";
}

function clusteredLayout(laws: Law[], lens: Lens, width: number): LayoutResult {
  const groups = new Map<string, { label: string; order: number; items: Law[] }>();
  for (const l of laws) {
    const { key, label, order } = clusterKey(l, lens);
    if (!groups.has(key)) groups.set(key, { label, order, items: [] });
    groups.get(key)!.items.push(l);
  }
  const entries = [...groups.entries()].sort((a, b) => a[1].order - b[1].order);

  const n = entries.length;
  const cols = n <= 3 ? n : n <= 4 ? 2 : n <= 6 ? 3 : n <= 9 ? 3 : 4;
  const rows = Math.ceil(n / cols);
  const colW = width / cols;
  const topPad = 120, rowH = 268;
  const height = topPad + rows * rowH + 40;

  const centroids: Record<string, { cx: number; cy: number }> = {};
  const clusters: ClusterLabel[] = entries.map(([key, g], i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const cx = colW * col + colW / 2;
    const cy = topPad + row * rowH + rowH / 2;
    centroids[key] = { cx, cy };
    return { key, label: g.label, cx, cy, count: g.items.length };
  });

  const GOLDEN = Math.PI * (3 - Math.sqrt(5));
  const positions: Record<string, NodePos> = {};
  const maxClusterR = Math.min(colW, rowH) * 0.43;
  for (const [key, g] of entries) {
    const { cx, cy } = centroids[key];
    const items = [...g.items].sort((a, b) => radiusForType(b.type) - radiusForType(a.type));
    const count = items.length;
    const spacing = Math.min(15, count > 1 ? maxClusterR / Math.sqrt(count) : 0);
    items.forEach((l, j) => {
      const rr = spacing * Math.sqrt(j);
      const ang = j * GOLDEN + hash(key) * 6.28;
      positions[l.id] = { id: l.id, x: cx + rr * Math.cos(ang), y: cy + rr * Math.sin(ang), r: radiusForType(l.type) };
    });
  }
  return { positions, clusters, height };
}

export function computeLayout(laws: Law[], lens: Lens, width: number): LayoutResult {
  if (lens === "timeline") return timelineLayout(laws, width);
  return clusteredLayout(laws, lens, width);
}
