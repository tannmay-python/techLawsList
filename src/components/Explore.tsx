import { useMemo, useState } from "react";
import type { Law } from "../types";
import { GROUP_COLORS, STATUS_COLORS } from "../lib/palette";
import { downloadCSV } from "../lib/format";

interface Props {
  laws: Law[]; // filtered
  total: number;
  onSelect: (id: string) => void;
}

type SortKey = "year" | "title" | "type" | "group" | "status" | "penaltyRegime";

function shortPenalty(p: string): string {
  if (!p || p === "Under parent Act") return "under parent Act";
  if (p.startsWith("None") || p === "n/a (draft)") return "none";
  return p;
}

export default function Explore({ laws, total, onSelect }: Props) {
  const [sort, setSort] = useState<SortKey>("year");
  const [dir, setDir] = useState<1 | -1>(-1);

  const rows = useMemo(() => {
    const s = [...laws].sort((a, b) => {
      let av: any = a[sort], bv: any = b[sort];
      if (sort === "year") { av = av ?? -1; bv = bv ?? -1; return (av - bv) * dir; }
      return String(av ?? "").localeCompare(String(bv ?? "")) * dir;
    });
    return s;
  }, [laws, sort, dir]);

  const th = (key: SortKey, label: string, cls = "") => (
    <th className={`sticky top-0 z-10 cursor-pointer select-none border-b bg-paper px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wide text-ink-soft hairline ${cls}`}
      onClick={() => { if (sort === key) setDir((d) => (d === 1 ? -1 : 1)); else { setSort(key); setDir(key === "title" ? 1 : -1); } }}>
      {label}{sort === key && <span className="ml-1 text-marigold" style={{ color: "var(--marigold-deep)" }}>{dir === 1 ? "▲" : "▼"}</span>}
    </th>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-5 py-2.5 hairline">
        <h2 className="font-display text-[15px] font-semibold text-ink">Repository <span className="font-mono text-[11px] font-normal text-ink-faint">· {rows.length} of {total}</span></h2>
        <button onClick={() => downloadCSV(rows)} className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-ink-soft hairline transition hover:border-marigold hover:text-ink">↓ CSV</button>
      </div>
      <div className="scroll-thin flex-1 overflow-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {th("title", "Instrument", "min-w-[280px]")}
              {th("year", "Year")}
              {th("type", "Type")}
              {th("group", "Domain")}
              {th("status", "Status")}
              <th className="sticky top-0 z-10 border-b bg-paper px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wide text-ink-soft hairline">Body</th>
              {th("penaltyRegime", "Penalty")}
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} onClick={() => onSelect(l.id)} className="cursor-pointer border-b transition hover:bg-[rgba(241,162,34,0.1)] hairline">
                <td className="px-3 py-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: GROUP_COLORS[l.group] }} />
                    <span className="font-medium text-ink">{l.title}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-[12px] text-ink-soft">{l.year ?? "—"}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[12px] text-ink-soft">{l.type}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[12px] text-ink-soft">{l.domain}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: STATUS_COLORS[l.status] || "var(--ink-soft)", background: `${(STATUS_COLORS[l.status] || "#999")}18` }}>{l.status}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-ink-soft">{l.adminMinistry}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[12px] text-ink-soft">{shortPenalty(l.penaltyRegime)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="px-3 py-10 text-center text-ink-faint">No instruments match your filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
