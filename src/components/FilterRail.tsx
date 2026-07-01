import { useMemo, type ReactNode } from "react";
import type { Law } from "../types";
import { DOMAIN_COLORS, DOMAIN_ORDER, SECTION_LABELS } from "../lib/palette";
import { hasAnyFilter, type Filters } from "../lib/filters";
import { downloadCSV } from "../lib/format";

interface Props {
  laws: Law[];
  filtered: Law[];
  filters: Filters;
  toggle: (key: "domains" | "instruments" | "statuses" | "decades" | "sections", v: string) => void;
  clear: () => void;
}

const INSTRUMENTS = ["Act", "Rule", "Regulation", "Notification", "Policy/Framework", "Order"];
const STATUSES = ["In force", "Consolidated", "Superseded/Rescinded", "Draft/Proposed"];
const DECADES = ["1880s", "1950s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];
const SECTIONS = ["s.70", "s.79A", "s.69A", "s.69B", "s.46", "s.88", "s.7", "none"];

export default function FilterRail({ laws, filtered, filters, toggle, clear }: Props) {
  const counts = useMemo(() => {
    const c = {
      domain: {} as Record<string, number>,
      instr: {} as Record<string, number>,
      status: {} as Record<string, number>,
      decade: {} as Record<string, number>,
      section: {} as Record<string, number>,
    };
    for (const l of laws) {
      c.domain[l.domain] = (c.domain[l.domain] || 0) + 1;
      c.instr[l.instrumentType] = (c.instr[l.instrumentType] || 0) + 1;
      c.status[l.status] = (c.status[l.status] || 0) + 1;
      if (l.decade) c.decade[l.decade] = (c.decade[l.decade] || 0) + 1;
      const s = l.empoweringSection ?? "none";
      c.section[s] = (c.section[s] || 0) + 1;
    }
    return c;
  }, [laws]);

  const active = hasAnyFilter(filters);

  return (
    <aside className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3 hairline">
        <div>
          <div className="font-display text-sm font-semibold text-ink">Filters</div>
          <div className="font-mono text-[11px] text-ink-soft">
            {filtered.length} / {laws.length} shown
          </div>
        </div>
        {active && (
          <button
            onClick={clear}
            className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-llama hairline transition hover:bg-llama hover:text-paper"
          >
            Reset
          </button>
        )}
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto px-4 py-3">
        <Group title="Domain">
          {DOMAIN_ORDER.map((d) => (
            <Row
              key={d}
              label={d}
              count={counts.domain[d] || 0}
              on={filters.domains.includes(d)}
              onClick={() => toggle("domains", d)}
              dot={DOMAIN_COLORS[d]}
            />
          ))}
        </Group>

        <Group title="Empowering section">
          {SECTIONS.map((s) => (
            <Row
              key={s}
              label={SECTION_LABELS[s] || s}
              count={counts.section[s] || 0}
              on={filters.sections.includes(s)}
              onClick={() => toggle("sections", s)}
            />
          ))}
        </Group>

        <Group title="Instrument">
          {INSTRUMENTS.map((i) => (
            <Row
              key={i}
              label={i}
              count={counts.instr[i] || 0}
              on={filters.instruments.includes(i)}
              onClick={() => toggle("instruments", i)}
            />
          ))}
        </Group>

        <Group title="Status">
          {STATUSES.map((s) => (
            <Row
              key={s}
              label={s}
              count={counts.status[s] || 0}
              on={filters.statuses.includes(s)}
              onClick={() => toggle("statuses", s)}
            />
          ))}
        </Group>

        <Group title="Decade">
          <div className="flex flex-wrap gap-1.5">
            {DECADES.map((d) => (
              <button
                key={d}
                onClick={() => toggle("decades", d)}
                className="rounded-full border px-2.5 py-1 font-mono text-[11px] transition hairline"
                style={{
                  background: filters.decades.includes(d) ? "var(--llama)" : "transparent",
                  color: filters.decades.includes(d) ? "var(--paper)" : "var(--ink-soft)",
                }}
              >
                {d}
                <span className="ml-1 opacity-60">{counts.decade[d] || 0}</span>
              </button>
            ))}
          </div>
        </Group>
      </div>

      <div className="border-t px-4 py-3 hairline">
        <button
          onClick={() => downloadCSV(filtered)}
          className="w-full rounded-lg border px-3 py-2 text-center font-mono text-[11px] uppercase tracking-wide text-ink-soft hairline transition hover:border-marigold hover:text-ink"
        >
          ↓ Export {filtered.length} rows to CSV
        </button>
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

function Row({
  label,
  count,
  on,
  onClick,
  dot,
}: {
  label: string;
  count: number;
  on: boolean;
  onClick: () => void;
  dot?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="group flex items-center justify-between rounded-md px-2 py-1 text-left text-[13px] transition"
      style={{ background: on ? "rgba(241,162,34,0.16)" : "transparent" }}
    >
      <span className="flex items-center gap-2 truncate">
        {dot && <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: dot }} />}
        <span
          className="truncate"
          style={{ color: on ? "var(--ink)" : "var(--ink-soft)", fontWeight: on ? 600 : 400 }}
        >
          {label}
        </span>
      </span>
      <span className="ml-2 font-mono text-[10px] text-ink-faint">{count}</span>
    </button>
  );
}
