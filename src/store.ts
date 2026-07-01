import { create } from "zustand";
import type { Lens } from "./types";
import { emptyFilters, type Filters } from "./lib/filters";
import { readUrl, writeUrl } from "./lib/urlState";

type FacetKey = "domains" | "instruments" | "statuses" | "decades" | "sections";

interface AppState {
  lens: Lens;
  filters: Filters;
  selectedId: string | null;
  paletteOpen: boolean;
  dark: boolean;
  // play-through-time
  playing: boolean;
  playYear: number; // current cursor year; MAX when not playing
  playSpeed: number; // years per second

  setLens: (l: Lens) => void;
  toggleFacet: (key: FacetKey, value: string) => void;
  setQuery: (q: string) => void;
  setBrush: (from: number | null, to: number | null) => void;
  clearFilters: () => void;
  applyPreset: (lens: Lens, patch: Partial<Filters>) => void;
  select: (id: string | null) => void;
  setPaletteOpen: (v: boolean) => void;
  toggleDark: () => void;
  setPlaying: (v: boolean) => void;
  setPlayYear: (y: number) => void;
  setPlaySpeed: (s: number) => void;
}

const initial = readUrl();

const persistDark = () => {
  try {
    return localStorage.getItem("lex-dark") === "1";
  } catch {
    return false;
  }
};

function sync(get: () => AppState) {
  const s = get();
  writeUrl({ lens: s.lens, filters: s.filters, selectedId: s.selectedId });
}

export const useStore = create<AppState>((set, get) => ({
  lens: initial.lens,
  filters: initial.filters,
  selectedId: initial.selectedId,
  paletteOpen: false,
  dark: persistDark(),
  playing: false,
  playYear: 2025,
  playSpeed: 6,

  setLens: (l) => {
    set({ lens: l });
    sync(get);
  },
  toggleFacet: (key, value) => {
    const cur = get().filters[key];
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    set({ filters: { ...get().filters, [key]: next } });
    sync(get);
  },
  setQuery: (q) => {
    set({ filters: { ...get().filters, query: q } });
    sync(get);
  },
  setBrush: (from, to) => {
    set({ filters: { ...get().filters, yearFrom: from, yearTo: to } });
    sync(get);
  },
  clearFilters: () => {
    set({ filters: { ...emptyFilters } });
    sync(get);
  },
  applyPreset: (lens, patch) => {
    set({ lens, filters: { ...emptyFilters, ...patch }, selectedId: null, playing: false, playYear: 2025 });
    sync(get);
  },
  select: (id) => {
    set({ selectedId: id });
    sync(get);
  },
  setPaletteOpen: (v) => set({ paletteOpen: v }),
  toggleDark: () => {
    const d = !get().dark;
    set({ dark: d });
    try {
      localStorage.setItem("lex-dark", d ? "1" : "0");
    } catch {
      /* ignore */
    }
  },
  setPlaying: (v) => set({ playing: v }),
  setPlayYear: (y) => set({ playYear: y }),
  setPlaySpeed: (s) => set({ playSpeed: s }),
}));
