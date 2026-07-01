import { motion } from "framer-motion";
import type { View } from "../types";

interface Props {
  view: View;
  setView: (v: View) => void;
  query: string;
  setQuery: (q: string) => void;
  openPalette: () => void;
  count: number;
  total: number;
}

const NAV: { id: View; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "atlas", label: "Atlas" },
  { id: "dashboard", label: "Dashboard" },
  { id: "explore", label: "Explore" },
];

export default function Header({ view, setView, query, setQuery, openPalette, count, total }: Props) {
  return (
    <header className="flex flex-col gap-3 border-b px-5 py-3 hairline lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-5">
        <button onClick={() => setView("overview")} className="flex items-baseline gap-2 text-left">
          <span className="font-display text-xl font-semibold tracking-tight text-ink">India's Tech Laws</span>
          <span className="hidden font-mono text-[11px] text-ink-faint sm:inline">1885–2025</span>
        </button>
        <nav role="tablist" aria-label="Views" className="flex items-center gap-0.5 rounded-full border p-0.5 hairline">
          {NAV.map((n) => {
            const active = n.id === view;
            return (
              <button key={n.id} role="tab" aria-selected={active} onClick={() => setView(n.id)} className="relative rounded-full px-3 py-1 text-[13px] font-medium transition-colors" style={{ color: active ? "var(--paper)" : "var(--ink-soft)" }}>
                {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full" style={{ background: "var(--llama)" }} transition={{ type: "spring", stiffness: 320, damping: 30 }} />}
                <span className="relative z-10">{n.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 lg:w-64">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search titles, bodies, domains…" aria-label="Search instruments" className="w-full rounded-full border bg-card px-4 py-1.5 text-sm text-ink placeholder:text-ink-faint hairline focus:outline-none focus:ring-2" style={{ ["--tw-ring-color" as any]: "var(--marigold)" }} />
          {query && <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink">✕</button>}
        </div>
        <button onClick={openPalette} className="hidden items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] text-ink-soft hairline transition hover:border-marigold hover:text-ink sm:flex" aria-label="Open command palette">⌘K</button>
        <span className="hidden font-mono text-[11px] text-ink-faint md:inline">{count}/{total}</span>
      </div>
    </header>
  );
}
