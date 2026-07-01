import { useState } from "react";
import type { Law, Lens, View } from "../types";
import type { Filters, FacetKey } from "../lib/filters";
import Canvas from "./Canvas";
import LensSwitcher from "./LensSwitcher";
import PlayControls from "./PlayControls";
import FilterRail from "./FilterRail";
import InsightCards from "./InsightCards";

interface Props {
  laws: Law[];
  filtered: Law[];
  lens: Lens;
  filters: Filters;
  selectedId: string | null;
  playing: boolean;
  playYear: number;
  playSpeed: number;
  reducedMotion: boolean;
  setLens: (l: Lens) => void;
  toggleFacet: (k: FacetKey, v: string) => void;
  toggleFlag: (k: "extraterritorial" | "contested" | "softOnly" | "hardOnly") => void;
  clearFilters: () => void;
  onSelect: (id: string) => void;
  onBrush: (from: number | null, to: number | null) => void;
  setPlaying: (v: boolean) => void;
  setPlayYear: (y: number) => void;
  setPlaySpeed: (s: number) => void;
  apply: (view: View, lens: Lens | undefined, patch: Partial<Filters>) => void;
  onPlay: () => void;
}

export default function Atlas(props: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [railOpen, setRailOpen] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* control strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-2.5 hairline">
        <div className="flex items-center gap-3">
          <button onClick={() => setRailOpen((v) => !v)} className="rounded-full border px-3 py-1.5 font-mono text-[11px] text-ink-soft hairline lg:hidden">☰ Filters</button>
          <LensSwitcher lens={props.lens} onChange={props.setLens} />
        </div>
        {props.lens === "timeline" && (
          <PlayControls playing={props.playing} playYear={props.playYear} speed={props.playSpeed} setPlaying={props.setPlaying} setPlayYear={props.setPlayYear} setSpeed={props.setPlaySpeed} reducedMotion={props.reducedMotion} />
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="hidden w-72 shrink-0 border-r hairline lg:block">
          <FilterRail laws={props.laws} filtered={props.filtered} filters={props.filters} toggle={props.toggleFacet} toggleFlag={props.toggleFlag} clear={props.clearFilters} />
        </div>

        {railOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setRailOpen(false)}>
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute left-0 top-0 h-full w-72 border-r bg-paper drawer-shadow hairline" onClick={(e) => e.stopPropagation()}>
              <FilterRail laws={props.laws} filtered={props.filtered} filters={props.filters} toggle={props.toggleFacet} toggleFlag={props.toggleFlag} clear={props.clearFilters} />
            </div>
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <Canvas laws={props.laws} lens={props.lens} filters={props.filters} selectedId={props.selectedId} hoverId={hoverId} playing={props.playing} playYear={props.playYear} onSelect={props.onSelect} onHover={setHoverId} onBrush={props.onBrush} reducedMotion={props.reducedMotion} />
          </div>
          <div className="border-t px-5 py-3 hairline">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Guided insights</div>
            <InsightCards apply={props.apply} onPlay={props.onPlay} />
          </div>
        </main>
      </div>
    </div>
  );
}
