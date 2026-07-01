import { useMemo } from "react";
import type { Law, Lens } from "../types";
import { DOMAIN_COLORS, PARENT_LABELS, SECTION_LABELS } from "../lib/palette";

interface Props {
  laws: Law[]; // already filtered
  lens: Lens;
  onSelect: (id: string) => void;
}

function groupKey(l: Law, lens: Lens): string {
  switch (lens) {
    case "family":
      return PARENT_LABELS[l.parentStatute];
    case "power":
      return l.empoweringSection ? SECTION_LABELS[l.empoweringSection] : "No empowering section";
    case "instrument":
      return l.instrumentType;
    case "status":
      return l.status;
    default:
      return l.decade ?? "Undated";
  }
}

export default function MobileList({ laws, lens, onSelect }: Props) {
  const groups = useMemo(() => {
    const m = new Map<string, Law[]>();
    const sorted = [...laws].sort((a, b) => (a.dateISO ?? "z").localeCompare(b.dateISO ?? "z"));
    for (const l of sorted) {
      const k = groupKey(l, lens);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(l);
    }
    return [...m.entries()];
  }, [laws, lens]);

  return (
    <div className="scroll-thin h-full overflow-y-auto px-4 py-3">
      {groups.map(([key, items]) => (
        <section key={key} className="mb-5">
          <div className="sticky top-0 z-10 -mx-4 bg-[var(--paper)] px-4 py-1.5">
            <h2 className="font-display text-sm font-semibold text-ink">
              {key} <span className="font-mono text-[11px] text-ink-faint">· {items.length}</span>
            </h2>
          </div>
          <ul className="mt-1 flex flex-col gap-1">
            {items.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => onSelect(l.id)}
                  className="flex w-full items-start gap-2.5 rounded-lg border bg-[var(--paper-pure)] px-3 py-2 text-left shadow-card hairline"
                >
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: DOMAIN_COLORS[l.domain] }} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium leading-snug text-ink">{l.title}</span>
                    <span className="mt-0.5 block font-mono text-[10px] text-ink-faint">
                      {l.dateDisplay} · {l.instrumentType}
                      {l.empoweringSection ? ` · ${l.empoweringSection}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {groups.length === 0 && (
        <p className="py-10 text-center text-sm text-ink-faint">No instruments match your filters.</p>
      )}
    </div>
  );
}
