import type { Law } from "../types";

export interface Filters {
  domains: string[];
  instruments: string[];
  statuses: string[];
  decades: string[];
  sections: string[];
  query: string;
  // time brush (timeline lens), inclusive year bounds
  yearFrom: number | null;
  yearTo: number | null;
}

export const emptyFilters: Filters = {
  domains: [],
  instruments: [],
  statuses: [],
  decades: [],
  sections: [],
  query: "",
  yearFrom: null,
  yearTo: null,
};

export function hasAnyFilter(f: Filters): boolean {
  return (
    f.domains.length > 0 ||
    f.instruments.length > 0 ||
    f.statuses.length > 0 ||
    f.decades.length > 0 ||
    f.sections.length > 0 ||
    f.query.trim().length > 0 ||
    f.yearFrom != null ||
    f.yearTo != null
  );
}

/** Does a law pass the facet filters (everything except free-text search)? */
export function matchesFacets(l: Law, f: Filters): boolean {
  if (f.domains.length && !f.domains.includes(l.domain)) return false;
  if (f.instruments.length && !f.instruments.includes(l.instrumentType)) return false;
  if (f.statuses.length && !f.statuses.includes(l.status)) return false;
  if (f.decades.length && (!l.decade || !f.decades.includes(l.decade))) return false;
  if (f.sections.length) {
    const sec = l.empoweringSection ?? "none";
    if (!f.sections.includes(sec)) return false;
  }
  if (f.yearFrom != null || f.yearTo != null) {
    if (l.year == null) return false;
    if (f.yearFrom != null && l.year < f.yearFrom) return false;
    if (f.yearTo != null && l.year > f.yearTo) return false;
  }
  return true;
}
