import { useEffect, useMemo, useState } from "react";
import { useStore } from "./store";
import { LAWS } from "./data";
import { matchesFacets } from "./lib/filters";
import { makeFuse, search } from "./lib/search";
import Header from "./components/Header";
import LensSwitcher from "./components/LensSwitcher";
import FilterRail from "./components/FilterRail";
import Canvas from "./components/Canvas";
import PlayControls from "./components/PlayControls";
import StoryCards from "./components/StoryCards";
import DetailDrawer from "./components/DetailDrawer";
import SearchPalette from "./components/SearchPalette";
import MobileList from "./components/MobileList";

function usePrefersReducedMotion() {
  const [rm, setRm] = useState(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setRm(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return rm;
}

export default function App() {
  const s = useStore();
  const reducedMotion = usePrefersReducedMotion();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [railOpen, setRailOpen] = useState(false);

  // dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", s.dark);
  }, [s.dark]);

  // Cmd/Ctrl-K palette + '/' to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        s.setPaletteOpen(!s.paletteOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [s]);

  // free-text search combines with facet filters
  const fuse = useMemo(() => makeFuse(LAWS), []);
  const searchIds = useMemo(() => {
    if (!s.filters.query.trim()) return null;
    return new Set(search(fuse, s.filters.query).map((l) => l.id));
  }, [fuse, s.filters.query]);

  const filtered = useMemo(
    () =>
      LAWS.filter(
        (l) => matchesFacets(l, s.filters) && (searchIds === null || searchIds.has(l.id))
      ),
    [s.filters, searchIds]
  );

  const selectedLaw = s.selectedId ? LAWS.find((l) => l.id === s.selectedId) ?? null : null;

  return (
    <div className="flex h-screen flex-col bg-[var(--paper)]">
      <Header
        query={s.filters.query}
        setQuery={s.setQuery}
        openPalette={() => s.setPaletteOpen(true)}
        dark={s.dark}
        toggleDark={s.toggleDark}
        count={filtered.length}
        total={LAWS.length}
      />

      {/* control strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 hairline">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRailOpen((v) => !v)}
            className="rounded-full border px-3 py-1.5 font-mono text-[11px] text-ink-soft hairline lg:hidden"
          >
            ☰ Filters
          </button>
          <LensSwitcher lens={s.lens} onChange={s.setLens} />
        </div>
        {s.lens === "timeline" && (
          <PlayControls
            playing={s.playing}
            playYear={s.playYear}
            speed={s.playSpeed}
            setPlaying={s.setPlaying}
            setPlayYear={s.setPlayYear}
            setSpeed={s.setPlaySpeed}
            reducedMotion={reducedMotion}
          />
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        {/* filter rail — desktop */}
        <div className="hidden w-72 shrink-0 border-r hairline lg:block">
          <FilterRail
            laws={LAWS}
            filtered={filtered}
            filters={s.filters}
            toggle={s.toggleFacet}
            clear={s.clearFilters}
          />
        </div>

        {/* filter rail — mobile drawer */}
        {railOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setRailOpen(false)}>
            <div className="absolute inset-0 bg-black/30" />
            <div
              className="absolute left-0 top-0 h-full w-72 border-r bg-[var(--paper)] shadow-drawer hairline"
              onClick={(e) => e.stopPropagation()}
            >
              <FilterRail
                laws={LAWS}
                filtered={filtered}
                filters={s.filters}
                toggle={s.toggleFacet}
                clear={s.clearFilters}
              />
            </div>
          </div>
        )}

        {/* main stage */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* canvas (desktop/tablet) */}
          <div className="relative hidden min-h-0 flex-1 md:block">
            <Canvas
              laws={LAWS}
              lens={s.lens}
              filters={s.filters}
              selectedId={s.selectedId}
              hoverId={hoverId}
              playing={s.playing}
              playYear={s.playYear}
              onSelect={s.select}
              onHover={setHoverId}
              onBrush={s.setBrush}
              reducedMotion={reducedMotion}
            />
          </div>

          {/* list (mobile) */}
          <div className="min-h-0 flex-1 md:hidden">
            <MobileList laws={filtered} lens={s.lens} onSelect={s.select} />
          </div>

          {/* story cards */}
          <div className="border-t px-5 py-3 hairline">
            <StoryCards apply={s.applyPreset} onPlay={() => { s.setPlayYear(1885); s.setPlaying(true); }} />
          </div>
        </main>
      </div>

      <DetailDrawer
        law={selectedLaw}
        all={LAWS}
        onClose={() => s.select(null)}
        onSelect={s.select}
        reducedMotion={reducedMotion}
      />

      <SearchPalette
        open={s.paletteOpen}
        laws={LAWS}
        onClose={() => s.setPaletteOpen(false)}
        onSelect={s.select}
        setLens={s.setLens}
        clear={s.clearFilters}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
