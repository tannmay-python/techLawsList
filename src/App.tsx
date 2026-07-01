import { useEffect, useMemo, useState } from "react";
import { useStore } from "./store";
import { LAWS } from "./data";
import { matchesFacets } from "./lib/filters";
import { makeFuse, search } from "./lib/search";
import Header from "./components/Header";
import Overview from "./components/Overview";
import Atlas from "./components/Atlas";
import Dashboard from "./components/Dashboard";
import Explore from "./components/Explore";
import DetailDrawer from "./components/DetailDrawer";
import SearchPalette from "./components/SearchPalette";

function usePrefersReducedMotion() {
  const [rm, setRm] = useState(() => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
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

  const fuse = useMemo(() => makeFuse(LAWS), []);
  const searchIds = useMemo(() => {
    if (!s.filters.query.trim()) return null;
    return new Set(search(fuse, s.filters.query).map((l) => l.id));
  }, [fuse, s.filters.query]);

  const filtered = useMemo(
    () => LAWS.filter((l) => matchesFacets(l, s.filters) && (searchIds === null || searchIds.has(l.id))),
    [s.filters, searchIds]
  );

  const selectedLaw = s.selectedId ? LAWS.find((l) => l.id === s.selectedId) ?? null : null;
  const onPlay = () => { s.setPlayYear(1885); s.setPlaying(true); };

  return (
    <div className="flex h-screen flex-col bg-paper">
      <Header view={s.view} setView={s.setView} query={s.filters.query} setQuery={s.setQuery} openPalette={() => s.setPaletteOpen(true)} count={filtered.length} total={LAWS.length} />

      <div className="min-h-0 flex-1">
        {s.view === "overview" && (
          <Overview apply={s.applyPreset} onPlay={onPlay} goAtlas={() => s.setView("atlas")} />
        )}
        {s.view === "atlas" && (
          <Atlas
            laws={LAWS} filtered={filtered} lens={s.lens} filters={s.filters} selectedId={s.selectedId}
            playing={s.playing} playYear={s.playYear} playSpeed={s.playSpeed} reducedMotion={reducedMotion}
            setLens={s.setLens} toggleFacet={s.toggleFacet} toggleFlag={s.toggleFlag} clearFilters={s.clearFilters}
            onSelect={s.select} onBrush={s.setBrush} setPlaying={s.setPlaying} setPlayYear={s.setPlayYear} setPlaySpeed={s.setPlaySpeed}
            apply={s.applyPreset} onPlay={onPlay}
          />
        )}
        {s.view === "dashboard" && (
          <Dashboard laws={filtered} onSelect={s.select} pick={s.applyPreset} />
        )}
        {s.view === "explore" && (
          <Explore laws={filtered} total={LAWS.length} onSelect={s.select} />
        )}
      </div>

      <DetailDrawer law={selectedLaw} all={LAWS} onClose={() => s.select(null)} onSelect={s.select} reducedMotion={reducedMotion} />
      <SearchPalette open={s.paletteOpen} laws={LAWS} onClose={() => s.setPaletteOpen(false)} onSelect={s.select} setView={s.setView} setLens={s.setLens} clear={s.clearFilters} reducedMotion={reducedMotion} />
    </div>
  );
}
