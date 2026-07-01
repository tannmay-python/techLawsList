import type { Lens } from "../types";
import { emptyFilters, type Filters } from "./filters";

export interface AppUrlState {
  lens: Lens;
  filters: Filters;
  selectedId: string | null;
}

const LENSES: Lens[] = ["timeline", "family", "power", "instrument", "status"];

export function readUrl(): AppUrlState {
  const p = new URLSearchParams(window.location.search);
  const lens = (p.get("lens") as Lens) || "timeline";
  const list = (k: string) => (p.get(k) ? p.get(k)!.split(",").filter(Boolean) : []);
  const num = (k: string) => (p.get(k) ? Number(p.get(k)) : null);
  return {
    lens: LENSES.includes(lens) ? lens : "timeline",
    filters: {
      ...emptyFilters,
      domains: list("domain"),
      instruments: list("instr"),
      statuses: list("status"),
      decades: list("decade"),
      sections: list("section"),
      query: p.get("q") || "",
      yearFrom: num("t0"),
      yearTo: num("t1"),
    },
    selectedId: p.get("sel"),
  };
}

export function writeUrl(s: AppUrlState) {
  const p = new URLSearchParams();
  if (s.lens !== "timeline") p.set("lens", s.lens);
  const f = s.filters;
  if (f.domains.length) p.set("domain", f.domains.join(","));
  if (f.instruments.length) p.set("instr", f.instruments.join(","));
  if (f.statuses.length) p.set("status", f.statuses.join(","));
  if (f.decades.length) p.set("decade", f.decades.join(","));
  if (f.sections.length) p.set("section", f.sections.join(","));
  if (f.query.trim()) p.set("q", f.query.trim());
  if (f.yearFrom != null) p.set("t0", String(f.yearFrom));
  if (f.yearTo != null) p.set("t1", String(f.yearTo));
  if (s.selectedId) p.set("sel", s.selectedId);
  const qs = p.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", url);
}
