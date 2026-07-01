import { motion } from "framer-motion";
import type { Lens } from "../types";
import { LENSES } from "../lib/palette";

export default function LensSwitcher({
  lens,
  onChange,
}: {
  lens: Lens;
  onChange: (l: Lens) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div
        role="tablist"
        aria-label="Analytical lens"
        className="panel inline-flex flex-wrap gap-1 rounded-full border p-1 hairline"
      >
        {LENSES.map((l) => {
          const active = l.id === lens;
          return (
            <button
              key={l.id}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(l.id)}
              className="relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
              style={{ color: active ? "var(--paper)" : "var(--ink-soft)" }}
            >
              {active && (
                <motion.span
                  layoutId="lens-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "var(--llama)" }}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                />
              )}
              <span className="relative z-10">{l.label}</span>
            </button>
          );
        })}
      </div>
      <p className="pl-2 font-sans text-xs italic text-ink-faint">
        {LENSES.find((l) => l.id === lens)?.blurb}
      </p>
    </div>
  );
}
