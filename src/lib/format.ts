import type { Law } from "../types";

export function toCSV(laws: Law[]): string {
  const cols: (keyof Law)[] = [
    "id", "title", "dateISO", "dateDisplay", "year", "decade",
    "instrumentType", "domain", "parentStatute", "empoweringSection",
    "status", "entity", "lineageId", "description",
  ];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = cols.join(",");
  const rows = laws.map((l) => cols.map((c) => esc(l[c])).join(","));
  return [head, ...rows].join("\n");
}

export function downloadCSV(laws: Law[], name = "lex-digitalis-filtered.csv") {
  const blob = new Blob([toCSV(laws)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
