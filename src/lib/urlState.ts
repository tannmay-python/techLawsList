import type { Lens, View } from "../types";
import { emptyFilters, type Filters } from "./filters";

export interface AppUrlState {
  view: View;
  lens: Lens;
  filters: Filters;
  selectedId: string | null;
}

const VIEWS: View[] = ["overview", "atlas", "dashboard", "explore"];
const LENSES: Lens[] = ["timeline", "group", "family", "power", "type", "status", "binding"];

export function readUrl(): AppUrlState {
  const p = new URLSearchParams(window.location.search);
  const view = (p.get("view") as View) || "overview";
  const lens = (p.get("lens") as Lens) || "timeline";
  const list = (k: string) => (p.get(k) ? p.get(k)!.split(",").filter(Boolean) : []);
  const num = (k: string) => (p.get(k) ? Number(p.get(k)) : null);
  const bool = (k: string) => p.get(k) === "1";
  return {
    view: VIEWS.includes(view) ? view : "overview",
    lens: LENSES.includes(lens) ? lens : "timeline",
    filters: {
      ...emptyFilters,
      groups: list("group"),
      domains: list("domain"),
      types: list("type"),
      statuses: list("status"),
      bindings: list("binding"),
      ministries: list("min"),
      sections: list("section"),
      decades: list("decade"),
      extraterritorial: bool("extra"),
      contested: bool("contested"),
      softOnly: bool("soft"),
      hardOnly: bool("hard"),
      query: p.get("q") || "",
      yearFrom: num("t0"),
      yearTo: num("t1"),
    },
    selectedId: p.get("sel"),
  };
}

export function writeUrl(s: AppUrlState) {
  const p = new URLSearchParams();
  if (s.view !== "overview") p.set("view", s.view);
  if (s.lens !== "timeline") p.set("lens", s.lens);
  const f = s.filters;
  const setList = (k: string, v: string[]) => v.length && p.set(k, v.join(","));
  setList("group", f.groups);
  setList("domain", f.domains);
  setList("type", f.types);
  setList("status", f.statuses);
  setList("binding", f.bindings);
  setList("min", f.ministries);
  setList("section", f.sections);
  setList("decade", f.decades);
  if (f.extraterritorial) p.set("extra", "1");
  if (f.contested) p.set("contested", "1");
  if (f.softOnly) p.set("soft", "1");
  if (f.hardOnly) p.set("hard", "1");
  if (f.query.trim()) p.set("q", f.query.trim());
  if (f.yearFrom != null) p.set("t0", String(f.yearFrom));
  if (f.yearTo != null) p.set("t1", String(f.yearTo));
  if (s.selectedId) p.set("sel", s.selectedId);
  const qs = p.toString();
  window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
}
