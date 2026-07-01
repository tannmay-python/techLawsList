import { useState } from "react";
import { STORIES } from "../lib/stories";
import type { Lens } from "../types";
import type { Filters } from "../lib/filters";

export default function StoryCards({
  apply,
  onPlay,
}: {
  apply: (lens: Lens, patch: Partial<Filters>) => void;
  onPlay: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mb-2 flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
          Story mode — click a finding to reframe the canvas
        </h2>
        <span className="font-mono text-[11px] text-ink-faint">{open ? "hide ▾" : "show ▸"}</span>
      </button>

      {open && (
        <div className="scroll-thin -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {STORIES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                apply(s.lens, s.patch);
                if (s.id === "big-bang") onPlay();
              }}
              className="group flex w-[230px] shrink-0 flex-col rounded-xl border bg-[var(--paper-pure)] p-3 text-left shadow-card transition hover:-translate-y-0.5 hover:border-marigold hairline"
            >
              <span className="font-mono text-[9px] uppercase tracking-widest"
                style={{ color: "var(--marigold)" }}>
                {s.kicker}
              </span>
              <span className="mt-1 font-display text-[15px] font-semibold leading-snug text-ink">
                {s.title}
              </span>
              <span className="mt-1.5 line-clamp-2 flex-1 text-[11px] leading-relaxed text-ink-soft">
                {s.body}
              </span>
              <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] font-medium transition group-hover:gap-2"
                style={{ color: "var(--llama)" }}>
                {s.cta}
                <span aria-hidden>→</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
