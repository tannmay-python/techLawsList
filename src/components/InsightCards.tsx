import { STORIES } from "../lib/stories";
import type { Lens, View } from "../types";
import type { Filters } from "../lib/filters";

interface Props {
  apply: (view: View, lens: Lens | undefined, patch: Partial<Filters>) => void;
  onPlay: () => void;
  columns?: boolean;
}

export default function InsightCards({ apply, onPlay, columns }: Props) {
  return (
    <div className={columns ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" : "scroll-thin -mx-1 flex gap-3 overflow-x-auto px-1 pb-1"}>
      {STORIES.map((s) => (
        <button
          key={s.id}
          onClick={() => { apply(s.view, s.lens, s.patch); if (s.id === "big-bang") onPlay(); }}
          className={`group flex flex-col rounded-xl border bg-card p-4 text-left card-shadow transition hover:-translate-y-0.5 hover:border-marigold hairline ${columns ? "" : "w-[250px] shrink-0"}`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--marigold-deep)" }}>{s.kicker}</span>
          </div>
          <span className="mt-1.5 font-display text-[16px] font-semibold leading-snug text-ink">{s.title}</span>
          <span className="mt-1.5 flex-1 text-[12px] leading-relaxed text-ink-soft">{s.body}</span>
          <div className="mt-3 flex items-center justify-between">
            <span className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold" style={{ background: "rgba(98,13,60,0.08)", color: "var(--llama)" }}>{s.stat}</span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium transition group-hover:gap-1.5" style={{ color: "var(--llama)" }}>{s.cta} <span aria-hidden>→</span></span>
          </div>
        </button>
      ))}
    </div>
  );
}
