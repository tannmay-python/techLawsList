import type { ReactNode } from "react";

export function StatTile({ value, label, sub }: { value: ReactNode; label: string; sub?: string }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3 card-shadow hairline">
      <div className="font-display text-3xl font-semibold leading-none text-ink">{value}</div>
      <div className="mt-1.5 text-[12px] font-medium text-ink-soft">{label}</div>
      {sub && <div className="mt-0.5 font-mono text-[10px] text-ink-faint">{sub}</div>}
    </div>
  );
}

export function Panel({ title, note, children, right }: { title: string; note?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-4 card-shadow hairline">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[15px] font-semibold text-ink">{title}</h3>
          {note && <p className="mt-0.5 text-[11px] leading-snug text-ink-faint">{note}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

interface BarDatum { key: string; count: number; color?: string; }

export function BarList({ data, max, onPick, active }: { data: BarDatum[]; max?: number; onPick?: (k: string) => void; active?: string[] }) {
  const m = max ?? Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex flex-col gap-1.5">
      {data.map((d) => {
        const on = active?.includes(d.key);
        return (
          <button key={d.key} onClick={() => onPick?.(d.key)} disabled={!onPick} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-left" style={{ cursor: onPick ? "pointer" : "default" }}>
            <div className="min-w-0">
              <div className="mb-0.5 flex items-center justify-between gap-2">
                <span className="truncate text-[12px]" style={{ color: on ? "var(--ink)" : "var(--ink-soft)", fontWeight: on ? 600 : 400 }}>{d.key}</span>
                <span className="font-mono text-[10px] text-ink-faint">{d.count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--rule)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${(d.count / m) * 100}%`, background: d.color || "var(--llama)", opacity: on === false ? 0.55 : 1 }} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** Regulatory-velocity bars by year. */
export function VelocityBars({ data, height = 90 }: { data: { year: number; count: number }[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const w = 100 / data.length;
  return (
    <svg viewBox={`0 0 100 ${100}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const h = (d.count / max) * 92;
        const major = [2000, 2016, 2023].includes(d.year);
        return <rect key={d.year} x={i * w + w * 0.12} y={100 - h} width={w * 0.76} height={h} rx={0.4} fill={major ? "var(--marigold)" : "var(--llama)"} opacity={d.count ? (major ? 0.95 : 0.72) : 0} />;
      })}
    </svg>
  );
}

/** Horizontal proportion bar (e.g. hard vs soft). */
export function StackBar({ segments }: { segments: { label: string; count: number; color: string }[] }) {
  const total = segments.reduce((a, s) => a + s.count, 0) || 1;
  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-full">
        {segments.map((s) => <div key={s.label} style={{ width: `${(s.count / total) * 100}%`, background: s.color }} title={`${s.label}: ${s.count}`} />)}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 text-[11px] text-ink-soft">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />{s.label} <span className="font-mono text-ink-faint">{s.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
