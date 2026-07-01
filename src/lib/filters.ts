import type { Law } from "../types";

export interface Filters {
  groups: string[];
  domains: string[];
  types: string[];
  statuses: string[];
  bindings: string[];
  ministries: string[];
  sections: string[];
  decades: string[];
  // toggles
  extraterritorial: boolean;
  contested: boolean;
  softOnly: boolean;
  hardOnly: boolean;
  query: string;
  yearFrom: number | null;
  yearTo: number | null;
}

export const emptyFilters: Filters = {
  groups: [], domains: [], types: [], statuses: [], bindings: [], ministries: [],
  sections: [], decades: [], extraterritorial: false, contested: false,
  softOnly: false, hardOnly: false, query: "", yearFrom: null, yearTo: null,
};

export type FacetKey =
  | "groups" | "domains" | "types" | "statuses" | "bindings" | "ministries"
  | "sections" | "decades";

export function hasAnyFilter(f: Filters): boolean {
  return (
    f.groups.length + f.domains.length + f.types.length + f.statuses.length +
    f.bindings.length + f.ministries.length + f.sections.length + f.decades.length > 0 ||
    f.extraterritorial || f.contested || f.softOnly || f.hardOnly ||
    f.query.trim().length > 0 || f.yearFrom != null || f.yearTo != null
  );
}

export function matchesFacets(l: Law, f: Filters): boolean {
  if (f.groups.length && !f.groups.includes(l.group)) return false;
  if (f.domains.length && !f.domains.includes(l.domain)) return false;
  if (f.types.length && !f.types.includes(l.type)) return false;
  if (f.statuses.length && !f.statuses.includes(l.status)) return false;
  if (f.bindings.length && !f.bindings.includes(l.bindingForce)) return false;
  if (f.ministries.length && !f.ministries.includes(l.adminMinistry)) return false;
  if (f.sections.length) {
    const s = l.empoweringSection ?? "none";
    if (!f.sections.includes(s)) return false;
  }
  if (f.decades.length && (!l.decade || !f.decades.includes(l.decade))) return false;
  if (f.extraterritorial && !l.extraterritorial) return false;
  if (f.contested && !l.contested) return false;
  if (f.softOnly && l.hardLaw) return false;
  if (f.hardOnly && !l.hardLaw) return false;
  if (f.yearFrom != null || f.yearTo != null) {
    if (l.year == null) return false;
    if (f.yearFrom != null && l.year < f.yearFrom) return false;
    if (f.yearTo != null && l.year > f.yearTo) return false;
  }
  return true;
}
