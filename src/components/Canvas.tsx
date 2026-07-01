import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { area, curveBasis } from "d3-shape";
import { scaleLinear } from "d3-scale";
import type { Law, Lens } from "../types";
import { computeLayout } from "../lib/layout";
import { GROUP_COLORS } from "../lib/palette";
import { matchesFacets, hasAnyFilter, type Filters } from "../lib/filters";

interface Props {
  laws: Law[];
  lens: Lens;
  filters: Filters;
  selectedId: string | null;
  hoverId: string | null;
  playing: boolean;
  playYear: number;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onBrush: (from: number | null, to: number | null) => void;
  reducedMotion: boolean;
}

const ANNOTATIONS: { year: number; label: string }[] = [
  { year: 1885, label: "Telegraph Act" },
  { year: 2000, label: "IT Act 2000" },
  { year: 2016, label: "Aadhaar · s.70 wave" },
  { year: 2023, label: "Telecom Act · frontier wave" },
];

function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-full border px-1.5 py-px font-mono text-[9px] text-ink-soft hairline">{children}</span>;
}

export default function Canvas(props: Props) {
  const { laws, lens, filters, selectedId, hoverId, playing, playYear, onSelect, onHover, onBrush, reducedMotion } = props;
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(1000);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((e) => { const w = e[0].contentRect.width; if (w > 0) setWidth(w); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => computeLayout(laws, lens, Math.max(width, 360)), [laws, lens, width]);
  const matchIds = useMemo(() => {
    const s = new Set<string>();
    for (const l of laws) if (matchesFacets(l, filters)) s.add(l.id);
    return s;
  }, [laws, filters]);
  const anyFilter = hasAnyFilter(filters);

  const isVisibleByPlay = (l: Law) => {
    if (!playing && playYear >= 2025) return true;
    if (l.year == null) return playYear >= 2025;
    return l.year <= playYear;
  };

  const velPath = useMemo(() => {
    if (lens !== "timeline" || !layout.velocity || !layout.brush) return null;
    const maxC = Math.max(...layout.velocity.map((d) => d.count), 1);
    const yScale = scaleLinear().domain([0, maxC]).range([0, 130]);
    const baseY = layout.brush.laneBottom + 46;
    const gen = area<{ year: number; count: number }>()
      .x((d) => layout.brush!.yearToX(d.year))
      .y0(baseY)
      .y1((d) => baseY - yScale(playing ? (d.year <= playYear ? d.count : 0) : d.count))
      .curve(curveBasis);
    return { d: gen(layout.velocity) || "", baseY, maxC };
  }, [layout, lens, playing, playYear]);

  const [brushing, setBrushing] = useState<{ start: number } | null>(null);
  const pointerYear = (clientX: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * width;
    return Math.round(layout.brush!.xToYear(px));
  };
  const clampYear = (y: number) => Math.min(2025, Math.max(1885, y));
  const startBrush = (e: React.PointerEvent) => {
    if (lens !== "timeline") return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const y = clampYear(pointerYear(e.clientX));
    setBrushing({ start: y });
    onBrush(y, y);
  };
  const moveBrush = (e: React.PointerEvent) => {
    if (!brushing) return;
    const y = clampYear(pointerYear(e.clientX));
    onBrush(Math.min(brushing.start, y), Math.max(brushing.start, y));
  };
  const endBrush = () => {
    if (brushing && filters.yearFrom === filters.yearTo) onBrush(null, null);
    setBrushing(null);
  };

  const hoverLaw = hoverId ? laws.find((l) => l.id === hoverId) : null;
  const height = layout.height;
  const spring = reducedMotion ? { duration: 0.001 } : { type: "spring" as const, stiffness: 120, damping: 20, mass: 0.7 };

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-y-auto overflow-x-hidden scroll-thin"
      onMouseMove={(e) => { const r = wrapRef.current!.getBoundingClientRect(); setMouse({ x: e.clientX - r.left, y: e.clientY - r.top }); }}>
      <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block" role="group" aria-label={`Law atlas, ${lens} lens`}>
        {lens === "timeline" && velPath && (
          <g>
            <defs>
              <linearGradient id="vel" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--marigold)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--marigold)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path d={velPath.d} fill="url(#vel)" stroke="var(--marigold)" strokeOpacity="0.55" strokeWidth={1} />
            <text x={layout.brush!.padL} y={velPath.baseY + 16} className="font-mono" fontSize={9} fill="var(--ink-faint)">
              regulatory velocity — instruments / year (peak {velPath.maxC})
            </text>
          </g>
        )}

        {lens === "timeline" && layout.swimLanes?.map((lane) => (
          <g key={lane.key}>
            <line x1={layout.brush!.padL} x2={width - layout.brush!.padR + 40} y1={lane.y + 20} y2={lane.y + 20} stroke="var(--rule)" strokeWidth={1} />
            <text x={layout.brush!.padL} y={lane.y - 13} fontSize={10} className="font-sans" fill="var(--ink-soft)" fontWeight={600}>
              <tspan fill={GROUP_COLORS[lane.key as keyof typeof GROUP_COLORS]}>■ </tspan>{lane.label}
            </text>
          </g>
        ))}

        {lens === "timeline" && layout.timeAxis?.map((t) => (
          <g key={t.label}>
            <line x1={t.x} x2={t.x} y1={72} y2={layout.brush!.laneBottom} stroke={t.major ? "var(--rule)" : "transparent"} strokeWidth={1} strokeDasharray={t.major ? "2 4" : undefined} />
            <text x={t.x} y={62} fontSize={t.major ? 11 : 9} textAnchor="middle" className="font-mono" fill={t.major ? "var(--ink)" : "var(--ink-faint)"} fontWeight={t.major ? 600 : 400}>{t.label}</text>
          </g>
        ))}
        {lens === "timeline" && ANNOTATIONS.map((a, i) => {
          const px = layout.brush!.yearToX(a.year);
          const yy = 30 + (i % 2) * 13;
          return (
            <g key={a.label}>
              <line x1={px} x2={px} y1={yy + 3} y2={70} stroke="var(--llama)" strokeOpacity={0.18} strokeWidth={1} />
              <text x={px} y={yy} fontSize={9} textAnchor="middle" className="font-sans italic" fill="var(--llama)" opacity={0.8}>{a.label}</text>
            </g>
          );
        })}

        {lens !== "timeline" && layout.clusters.map((c) => (
          <g key={c.key}>
            <text x={c.cx} y={c.cy - 104} textAnchor="middle" className="font-display" fontSize={15} fill="var(--ink)" fontWeight={600}>{c.label}</text>
            <text x={c.cx} y={c.cy - 88} textAnchor="middle" className="font-mono" fontSize={10} fill="var(--ink-faint)">{c.count} {c.count === 1 ? "instrument" : "instruments"}</text>
          </g>
        ))}

        {lens === "timeline" && filters.yearFrom != null && filters.yearTo != null && (
          <rect x={layout.brush!.yearToX(filters.yearFrom)} width={Math.max(2, layout.brush!.yearToX(filters.yearTo) - layout.brush!.yearToX(filters.yearFrom))} y={70} height={layout.brush!.laneBottom - 70} fill="var(--marigold)" fillOpacity={0.1} stroke="var(--marigold)" strokeOpacity={0.5} strokeDasharray="3 3" pointerEvents="none" />
        )}

        <g>
          {laws.map((l) => {
            const p = layout.positions[l.id];
            if (!p) return null;
            const matched = !anyFilter || matchIds.has(l.id);
            const shown = isVisibleByPlay(l);
            const selected = selectedId === l.id;
            const hovered = hoverId === l.id;
            const dim = (anyFilter && !matched) || !shown;
            return (
              <motion.circle
                key={l.id} cx={p.x} cy={p.y} initial={false}
                animate={{ cx: p.x, cy: p.y, opacity: shown ? (dim ? 0.08 : matched ? 1 : 0.12) : 0 }}
                transition={spring}
                r={selected || hovered ? p.r + 2.5 : p.r}
                fill={GROUP_COLORS[l.group]}
                stroke={selected ? "var(--ink)" : hovered ? "var(--marigold)" : "var(--paper)"}
                strokeWidth={selected ? 2.5 : hovered ? 2 : 0.8}
                style={{ cursor: "pointer" }} tabIndex={0} role="button"
                aria-label={`${l.title}. ${l.type}, ${l.domain}, ${l.dateDisplay}.`}
                onMouseEnter={() => onHover(l.id)} onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(l.id)} onBlur={() => onHover(null)}
                onClick={() => onSelect(l.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(l.id); } }}
              />
            );
          })}
        </g>

        {lens === "timeline" && (
          <rect x={0} y={layout.brush!.laneBottom + 2} width={width} height={40} fill="transparent" style={{ cursor: "ew-resize" }} onPointerDown={startBrush} onPointerMove={moveBrush} onPointerUp={endBrush} />
        )}
      </svg>

      {lens === "timeline" && (
        <div className="pointer-events-none absolute left-0 right-0 text-center" style={{ top: layout.brush ? layout.brush.laneBottom + 44 : 0 }}>
          <span className="font-mono text-[10px] text-ink-faint">drag across the strip below the lanes to brush a time range</span>
        </div>
      )}

      {hoverLaw && mouse && (
        <div className="panel pointer-events-none absolute z-30 max-w-xs rounded-lg border p-3 card-shadow hairline" style={{ left: Math.min(mouse.x + 16, width - 280), top: mouse.y + 16 }}>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: GROUP_COLORS[hoverLaw.group] }} />
            <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">{hoverLaw.type} · {hoverLaw.dateDisplay}</span>
          </div>
          <div className="font-display text-sm font-semibold leading-snug text-ink">{hoverLaw.title}</div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <Chip>{hoverLaw.domain}</Chip>
            {hoverLaw.empoweringSection && <Chip>{hoverLaw.empoweringSection}</Chip>}
            <Chip>{hoverLaw.hardLaw ? "hard law" : "soft law"}</Chip>
          </div>
        </div>
      )}
    </div>
  );
}
