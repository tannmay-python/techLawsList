import type { Lens, View } from "../types";
import { META, LAWS } from "../data";
import type { Filters } from "../lib/filters";
import { GROUP_COLORS, GROUP_ORDER } from "../lib/palette";
import { StatTile, VelocityBars } from "./charts";
import InsightCards from "./InsightCards";

interface Props {
  apply: (view: View, lens: Lens | undefined, patch: Partial<Filters>) => void;
  onPlay: () => void;
  goAtlas: () => void;
}

export default function Overview({ apply, onPlay, goAtlas }: Props) {
  const latest = [...LAWS].filter((l) => l.year).sort((a, b) => (b.dateISO ?? "").localeCompare(a.dateISO ?? "")).slice(0, 5);
  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-5 py-8">
        {/* hero */}
        <div className="rise">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--marigold-deep)" }}>A digital repository of India's tech laws</span>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold leading-[1.08] text-ink md:text-5xl">
            India's technology laws, in one place.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            {META.total} central-government instruments — statutes, rules, notifications, policies and missions — across India's digital, cyber, telecom, data, identity, frontier-technology and clean-tech domains, from 1885 to 2025. Search them, filter them, and open any one for the full record and its official source.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={goAtlas} className="rounded-full px-4 py-2 text-sm font-semibold text-paper transition hover:opacity-90" style={{ background: "var(--llama)" }}>Open the Atlas →</button>
            <button onClick={() => apply("explore", undefined, {})} className="rounded-full border px-4 py-2 text-sm font-semibold text-ink hairline transition hover:border-marigold">Browse the full list</button>
          </div>
        </div>

        {/* stat tiles */}
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <StatTile value={META.total} label="Instruments" sub={`${META.minYear}–${META.maxYear}`} />
          <StatTile value={META.sections} label="Sections" sub="across the corpus" />
          <StatTile value={META.groups.length} label="Domains" sub="cyber → space" />
          <StatTile value={`${Math.round((META.hardLaw / META.total) * 100)}%`} label="Hard law" sub={`${META.softLaw} soft-law`} />
          <StatTile value={META.s70count} label="× s.70" sub="protected systems" />
          <StatTile value={META.contested} label="Contested" sub="in the courts" />
        </div>

        {/* velocity strip */}
        <section className="mt-6 rounded-xl border bg-card p-4 card-shadow hairline">
          <div className="mb-2 flex items-end justify-between">
            <div>
              <h3 className="font-display text-[15px] font-semibold text-ink">Instruments by year, 1885–2025</h3>
              <p className="text-[11px] text-ink-faint">how many were enacted each year</p>
            </div>
            <button onClick={goAtlas} className="font-mono text-[11px] transition hover:underline" style={{ color: "var(--llama)" }}>open the atlas →</button>
          </div>
          <VelocityBars data={META.byYear.filter((d) => d.year <= 2025)} height={96} />
          <div className="mt-1 flex justify-between font-mono text-[10px] text-ink-faint"><span>1885</span><span>1950</span><span>1990</span><span>2016</span><span>2025</span></div>
        </section>

        {/* domain legend */}
        <section className="mt-6">
          <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Browse by domain</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GROUP_ORDER.map((g) => {
              const n = META.groups.find((x) => x.key === g)?.count ?? 0;
              return (
                <button key={g} onClick={() => apply("atlas", "group", { groups: [g] })} className="flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-left card-shadow transition hover:border-marigold hairline">
                  <span className="h-8 w-1.5 shrink-0 rounded-full" style={{ background: GROUP_COLORS[g] }} />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-ink">{g}</span>
                    <span className="font-mono text-[10px] text-ink-faint">{n} instruments</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* guided insights */}
        <section className="mt-8">
          <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Starting points — click to jump in</h3>
          <InsightCards apply={apply} onPlay={onPlay} columns />
        </section>

        {/* latest */}
        <section className="mt-8 mb-4">
          <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Most recent instruments</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((l) => (
              <button key={l.id} onClick={() => apply("explore", undefined, { query: l.title.slice(0, 24) })} className="flex items-start gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-left card-shadow transition hover:border-marigold hairline">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: GROUP_COLORS[l.group] }} />
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium leading-snug text-ink">{l.title}</span>
                  <span className="font-mono text-[10px] text-ink-faint">{l.dateDisplay} · {l.type}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <footer className="mt-8 border-t py-6 hairline">
          <p className="max-w-3xl text-[12px] leading-relaxed text-ink-faint">
            Central-government instruments only; state laws excluded by design. Coded facets are a structured first pass — reliable for filtering and pattern-spotting, to be spot-checked before citation. Descriptive fields drawn from primary/official material. Last updated 1 July 2026.
          </p>
        </footer>
      </div>
    </div>
  );
}
