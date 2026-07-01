import type { Law } from "../types";

const COLS: (keyof Law)[] = [
  "id", "title", "year", "dateDisplay", "type", "domain", "group",
  "parentStatute", "empoweringSection", "bindingForce", "status", "adminBody",
  "territorial", "penaltyRegime", "maxPenalty", "judicialStatus", "compliance",
  "international", "source", "description",
];

export function toCSV(laws: Law[]): string {
  const esc = (v: unknown) => {
    const s = v == null ? "" : Array.isArray(v) ? v.join("; ") : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = COLS.join(",");
  const rows = laws.map((l) => COLS.map((c) => esc(l[c])).join(","));
  return [head, ...rows].join("\n");
}

export function downloadCSV(laws: Law[], name = "india-tech-laws.csv") {
  const blob = new Blob([toCSV(laws)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
