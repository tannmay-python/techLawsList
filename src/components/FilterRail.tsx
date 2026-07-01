import { useMemo, useState, type ReactNode } from "react";
import type { Law } from "../types";
import { GROUP_COLORS, GROUP_ORDER, SECTION_LABELS } from "../lib/palette";
import { hasAnyFilter, type Filters, type FacetKey } from "../lib/filters";
import { downloadCSV } from "../lib/format";

interface Props {
  laws: Law[];
  filtered: Law[];
  filters: Filters;
  toggle: (key: FacetKey, v: string) => void;
  toggleFlag: (key: "extraterritorial" | "contested" | "softOnly" | "hardOnly") => void;
  clear: () => void;
}

const TYPES = ["Act", "Amendment Act", "Rules", "Regulations", "Notification", "Order", "Policy / Framework", "Scheme", "Guidelines", "Bill (Draft)"];
const STATUSES = ["In force", "In force (phased)", "Consolidated", "Superseded / Repealed", "Draft / Proposed"];
const SECTIONS = ["s.70", "s.70B", "s.79A", "s.69A", "s.69B", "s.69", "s.46", "s.88", "s.7", "none"];
const DECADES = ["1880s", "1930s", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];

export default function FilterRail({ laws, filtered, filters, toggle, toggleFlag, clear }: Props) {
  const counts = useMemo(() => {
    const c: Record<string, Record<string, number>> = { group: {}, type: {}, status: {}, section: {}, decade: {}, ministry: {} };
    for (const l of laws) {
      c.group[l.group] = (c.group[l.group] || 0) + 1;
      c.type[l.type] = (c.type[l.type] || 0) + 1;
      c.status[l.status] = (c.status[l.status] || 0) + 1;
      c.section[l.empoweringSection ?? "none"] = (c.section[l.empoweringSection ?? "none"] || 0) + 1;
      if (l.decade) c.decade[l.decade] = (c.decade[l.decade] || 0) + 1;
      c.ministry[l.adminMinistry] = (c.ministry[l.adminMinistry] || 0) + 1;
    }
    return c;
  }, [laws]);

  const topMinistries = useMemo(
    () => Object.entries(counts.ministry).sort((a, b) => b[1] - a[1]).slice(0, 10),
    [counts]
  );
  const active = hasAnyFilter(filters);

  return (
    <aside className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3 hairline">
        <div>
          <div className="font-display text-sm font-semibold text-ink">Filters</div>
          <div className="font-mono text-[11px] text-ink-soft">{filtered.length} / {laws.length} shown</div>
        </div>
        {active && <button onClick={clear} className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-llama hairline transition hover:bg-llama hover:text-paper" style={{ color: "var(--llama)" }}>Reset</button>}
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto px-4 py-3">
        <Group title="Quick lenses">
          <div className="flex flex-wrap gap-1.5">
            <Toggle on={filters.hardOnly} label="Hard law" onClick={() => toggleFlag("hardOnly")} />
            <Toggle on={filters.softOnly} label="Soft law" onClick={() => toggleFlag("softOnly")} />
            <Toggle on={filters.contested} label="Contested" onClick={() => toggleFlag("contested")} />
            <Toggle on={filters.extraterritorial} label="Extraterritorial" onClick={() => toggleFlag("extraterritorial")} />
          </div>
        </Group>

        <Group title="Domain">
          {GROUP_ORDER.map((d) => (
            <Row key={d} label={d} count={counts.group[d] || 0} on={filters.groups.includes(d)} onClick={() => toggle("groups", d)} dot={GROUP_COLORS[d]} />
          ))}
        </Group>

        <Group title="Empowering section">
          {SECTIONS.filter((s) => counts.section[s]).map((s) => (
            <Row key={s} label={SECTION_LABELS[s] || s} count={counts.section[s] || 0} on={filters.sections.includes(s)} onClick={() => toggle("sections", s)} />
          ))}
        </Group>

        <Group title="Instrument type">
          {TYPES.filter((t) => counts.type[t]).map((t) => (
            <Row key={t} label={t} count={counts.type[t] || 0} on={filters.types.includes(t)} onClick={() => toggle("types", t)} />
          ))}
        </Group>

        <Group title="Administering ministry">
          {topMinistries.map(([m, n]) => (
            <Row key={m} label={m} count={n} on={filters.ministries.includes(m)} onClick={() => toggle("ministries", m)} />
          ))}
        </Group>

        <Group title="Status">
          {STATUSES.filter((s) => counts.status[s]).map((s) => (
            <Row key={s} label={s} count={counts.status[s] || 0} on={filters.statuses.includes(s)} onClick={() => toggle("statuses", s)} />
          ))}
        </Group>

        <Group title="Decade">
          <div className="flex flex-wrap gap-1.5">
            {DECADES.filter((d) => counts.decade[d]).map((d) => (
              <button key={d} onClick={() => toggle("decades", d)} className="rounded-full border px-2.5 py-1 font-mono text-[11px] transition hairline" style={{ background: filters.decades.includes(d) ? "var(--llama)" : "transparent", color: filters.decades.includes(d) ? "var(--paper)" : "var(--ink-soft)" }}>
                {d}<span className="ml-1 opacity-60">{counts.decade[d]}</span>
              </button>
            ))}
          </div>
        </Group>
      </div>

      <div className="border-t px-4 py-3 hairline">
        <button onClick={() => downloadCSV(filtered)} className="w-full rounded-lg border px-3 py-2 text-center font-mono text-[11px] uppercase tracking-wide text-ink-soft hairline transition hover:border-marigold hover:text-ink">↓ Export {filtered.length} rows to CSV</button>
      </div>
    </aside>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">{title}</h3>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={on} className="rounded-full border px-2.5 py-1 font-mono text-[10px] transition hairline" style={{ background: on ? "var(--marigold)" : "transparent", color: on ? "#3a2708" : "var(--ink-soft)", borderColor: on ? "var(--marigold)" : undefined, fontWeight: on ? 600 : 400 }}>{label}</button>
  );
}

function Row({ label, count, on, onClick, dot }: { label: string; count: number; on: boolean; onClick: () => void; dot?: string }) {
  return (
    <button onClick={onClick} aria-pressed={on} className="group flex items-center justify-between rounded-md px-2 py-1 text-left text-[13px] transition" style={{ background: on ? "rgba(241,162,34,0.16)" : "transparent" }}>
      <span className="flex items-center gap-2 truncate">
        {dot && <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: dot }} />}
        <span className="truncate" style={{ color: on ? "var(--ink)" : "var(--ink-soft)", fontWeight: on ? 600 : 400 }}>{label}</span>
      </span>
      <span className="ml-2 font-mono text-[10px] text-ink-faint">{count}</span>
    </button>
  );
}
