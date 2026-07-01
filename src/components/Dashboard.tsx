import { useMemo } from "react";
import type { Law, Lens, View } from "../types";
import type { Filters } from "../lib/filters";
import { GROUP_COLORS, GROUP_ORDER, COERCION_COLORS } from "../lib/palette";
import { Panel, BarList, VelocityBars, StackBar } from "./charts";

interface Props {
  laws: Law[]; // filtered
  onSelect: (id: string) => void;
  pick: (view: View, lens: Lens | undefined, patch: Partial<Filters>) => void;
}

function tally<T extends string>(laws: Law[], key: (l: Law) => T | null): { key: string; count: number }[] {
  const m = new Map<string, number>();
  for (const l of laws) { const k = key(l); if (k) m.set(k, (m.get(k) || 0) + 1); }
  return [...m.entries()].map(([k, count]) => ({ key: k, count })).sort((a, b) => b.count - a.count);
}

export default function Dashboard({ laws, onSelect, pick }: Props) {
  const byYear = useMemo(() => {
    const m = new Map<number, number>();
    for (const l of laws) if (l.year) m.set(l.year, (m.get(l.year) || 0) + 1);
    const out = [];
    for (let y = 1885; y <= 2025; y++) out.push({ year: y, count: m.get(y) || 0 });
    return out;
  }, [laws]);

  const groups = useMemo(() => GROUP_ORDER.map((g) => ({ key: g, count: laws.filter((l) => l.group === g).length, color: GROUP_COLORS[g] })).filter((d) => d.count), [laws]);
  const ministries = useMemo(() => tally(laws, (l) => l.adminMinistry).slice(0, 10).map((d) => ({ ...d, color: "var(--llama)" })), [laws]);
  const types = useMemo(() => tally(laws, (l) => l.type).slice(0, 9).map((d) => ({ ...d, color: "var(--marigold-deep)" })), [laws]);
  const hard = laws.filter((l) => l.hardLaw).length;

  const coercion = useMemo(() => {
    const buckets = [0, 0, 0, 0];
    for (const l of laws) buckets[l.coercionRank]++;
    return buckets;
  }, [laws]);
  const coercionLabels = ["None / non-binding", "Civil", "Criminal", "Criminal + civil"];

  const contested = useMemo(() => laws.filter((l) => l.contested), [laws]);
  const extra = useMemo(() => laws.filter((l) => l.extraterritorial), [laws]);

  const regimes = useMemo(() => {
    const m = new Map<string, Law[]>();
    for (const l of laws) for (const r of l.intlRegimes) { if (!m.has(r)) m.set(r, []); m.get(r)!.push(l); }
    return [...m.entries()].map(([key, items]) => ({ key, items })).sort((a, b) => b.items.length - a.items.length);
  }, [laws]);

  const maxCo = Math.max(...coercion, 1);

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-5 py-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">The repository at a glance</h2>
          <span className="font-mono text-[11px] text-ink-faint">{laws.length} instruments in view</span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* velocity — full width */}
          <div className="lg:col-span-3">
            <Panel title="Instruments by year" note="How many instruments were enacted each year, 1885–2025.">
              <VelocityBars data={byYear} height={120} />
              <div className="mt-1 flex justify-between font-mono text-[10px] text-ink-faint"><span>1885</span><span>1950</span><span>1990</span><span>2016</span><span>2025</span></div>
            </Panel>
          </div>

          {/* hard vs soft */}
          <Panel title="Hard law vs soft law" note="Hard law = binding statutes and the rules under them. Soft law = policies, missions, strategies and guidelines that guide but don't legally bind.">
            <StackBar segments={[
              { label: "Hard law", count: hard, color: "var(--llama)" },
              { label: "Soft law", count: laws.length - hard, color: "var(--marigold)" },
            ]} />
            <div className="mt-3 flex gap-2">
              <button onClick={() => pick("atlas", "binding", { hardOnly: true })} className="rounded-full border px-2.5 py-1 font-mono text-[10px] text-ink-soft hairline transition hover:border-marigold">show hard law</button>
              <button onClick={() => pick("atlas", "binding", { softOnly: true })} className="rounded-full border px-2.5 py-1 font-mono text-[10px] text-ink-soft hairline transition hover:border-marigold">show soft law</button>
            </div>
          </Panel>

          {/* domain distribution */}
          <Panel title="Domain distribution" note="Click a domain to open it in the Atlas.">
            <BarList data={groups} onPick={(k) => pick("atlas", "group", { groups: [k] })} />
          </Panel>

          {/* penalty type */}
          <Panel title="Penalty type" note="The penalty each instrument carries, as recorded in the source.">
            <div className="flex flex-col gap-2">
              {coercion.map((c, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <div>
                    <div className="mb-0.5 flex justify-between text-[12px]"><span className="text-ink-soft">{coercionLabels[i]}</span><span className="font-mono text-[10px] text-ink-faint">{c}</span></div>
                    <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--rule)" }}><div className="h-full rounded-full" style={{ width: `${(c / maxCo) * 100}%`, background: COERCION_COLORS[i] }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* ministry turf */}
          <Panel title="Ministry turf map" note="Who writes the rules. MeitY dominates; frontier domains scatter.">
            <BarList data={ministries} onPick={(k) => pick("explore", undefined, { ministries: [k] })} />
          </Panel>

          {/* instrument mix */}
          <Panel title="Instrument mix" note="The corpus is mostly subordinate notifications and rules.">
            <BarList data={types} onPick={(k) => pick("explore", undefined, { types: [k] })} />
          </Panel>

          {/* extraterritorial */}
          <Panel title="Extraterritorial reach" note={`${extra.length} instruments follow data beyond the border.`} right={<span className="font-display text-2xl font-semibold text-ink">{extra.length}</span>}>
            <ul className="flex flex-col gap-1">
              {extra.slice(0, 7).map((l) => <LawRow key={l.id} l={l} onSelect={onSelect} />)}
            </ul>
          </Panel>

          {/* contestation */}
          <Panel title="Contestation map" note="Instruments carrying landmark litigation." right={<span className="font-display text-2xl font-semibold" style={{ color: "#9c2f45" }}>{contested.length}</span>}>
            <ul className="flex flex-col gap-2">
              {contested.map((l) => (
                <li key={l.id}>
                  <button onClick={() => onSelect(l.id)} className="w-full rounded-lg border-l-2 px-2.5 py-1.5 text-left transition hover:bg-[rgba(156,47,69,0.06)]" style={{ borderColor: "#9c2f45" }}>
                    <span className="block text-[12px] font-medium text-ink">{l.title}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-ink-soft">{l.judicialStatus}</span>
                  </button>
                </li>
              ))}
              {contested.length === 0 && <li className="text-[12px] text-ink-faint">None in the current filter.</li>}
            </ul>
          </Panel>

          {/* international linkage */}
          <div className="lg:col-span-3">
            <Panel title="India and the world" note="Domestic instruments hooked into international regimes — click a regime to see the linked instruments.">
              <div className="flex flex-wrap gap-2">
                {regimes.map((r) => (
                  <details key={r.key} className="rounded-lg border bg-paper px-3 py-2 hairline">
                    <summary className="cursor-pointer list-none text-[12px] font-medium text-ink">
                      <span className="mr-1.5 inline-block rounded-full px-1.5 py-0.5 font-mono text-[10px]" style={{ background: "rgba(47,93,138,0.12)", color: "#2f5d8a" }}>{r.items.length}</span>
                      {r.key}
                    </summary>
                    <ul className="mt-2 flex flex-col gap-1">
                      {r.items.map((l) => <LawRow key={l.id} l={l} onSelect={onSelect} />)}
                    </ul>
                  </details>
                ))}
                {regimes.length === 0 && <span className="text-[12px] text-ink-faint">No international linkages in the current filter.</span>}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

function LawRow({ l, onSelect }: { l: Law; onSelect: (id: string) => void }) {
  return (
    <li>
      <button onClick={() => onSelect(l.id)} className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-[12px] text-ink-soft transition hover:bg-[rgba(241,162,34,0.14)] hover:text-ink">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: GROUP_COLORS[l.group] }} />
        <span className="flex-1 truncate">{l.title}</span>
        <span className="font-mono text-[10px] text-ink-faint">{l.year ?? "—"}</span>
      </button>
    </li>
  );
}
