import { create } from "zustand";
import type { Lens, View } from "./types";
import { emptyFilters, type Filters, type FacetKey } from "./lib/filters";
import { readUrl, writeUrl } from "./lib/urlState";

interface AppState {
  view: View;
  lens: Lens;
  filters: Filters;
  selectedId: string | null;
  paletteOpen: boolean;
  playing: boolean;
  playYear: number;
  playSpeed: number;

  setView: (v: View) => void;
  setLens: (l: Lens) => void;
  toggleFacet: (key: FacetKey, value: string) => void;
  toggleFlag: (key: "extraterritorial" | "contested" | "softOnly" | "hardOnly") => void;
  setFacet: (key: FacetKey, values: string[]) => void;
  setQuery: (q: string) => void;
  setBrush: (from: number | null, to: number | null) => void;
  clearFilters: () => void;
  applyPreset: (view: View, lens: Lens | undefined, patch: Partial<Filters>) => void;
  select: (id: string | null) => void;
  setPaletteOpen: (v: boolean) => void;
  setPlaying: (v: boolean) => void;
  setPlayYear: (y: number) => void;
  setPlaySpeed: (s: number) => void;
}

const initial = readUrl();

function sync(get: () => AppState) {
  const s = get();
  writeUrl({ view: s.view, lens: s.lens, filters: s.filters, selectedId: s.selectedId });
}

export const useStore = create<AppState>((set, get) => ({
  view: initial.view,
  lens: initial.lens,
  filters: initial.filters,
  selectedId: initial.selectedId,
  paletteOpen: false,
  playing: false,
  playYear: 2025,
  playSpeed: 6,

  setView: (v) => { set({ view: v }); sync(get); },
  setLens: (l) => { set({ lens: l }); sync(get); },
  toggleFacet: (key, value) => {
    const cur = get().filters[key];
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    set({ filters: { ...get().filters, [key]: next } });
    sync(get);
  },
  toggleFlag: (key) => {
    set({ filters: { ...get().filters, [key]: !get().filters[key] } });
    sync(get);
  },
  setFacet: (key, values) => {
    set({ filters: { ...get().filters, [key]: values } });
    sync(get);
  },
  setQuery: (q) => { set({ filters: { ...get().filters, query: q } }); sync(get); },
  setBrush: (from, to) => {
    set({ filters: { ...get().filters, yearFrom: from, yearTo: to } });
    sync(get);
  },
  clearFilters: () => { set({ filters: { ...emptyFilters } }); sync(get); },
  applyPreset: (view, lens, patch) => {
    set({
      view,
      lens: lens ?? get().lens,
      filters: { ...emptyFilters, ...patch },
      selectedId: null,
      playing: false,
      playYear: 2025,
    });
    sync(get);
  },
  select: (id) => { set({ selectedId: id }); sync(get); },
  setPaletteOpen: (v) => set({ paletteOpen: v }),
  setPlaying: (v) => set({ playing: v }),
  setPlayYear: (y) => set({ playYear: y }),
  setPlaySpeed: (s) => set({ playSpeed: s }),
}));
