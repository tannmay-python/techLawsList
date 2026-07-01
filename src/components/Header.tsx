interface Props {
  query: string;
  setQuery: (q: string) => void;
  openPalette: () => void;
  dark: boolean;
  toggleDark: () => void;
  count: number;
  total: number;
}

export default function Header({
  query, setQuery, openPalette, dark, toggleDark, count, total,
}: Props) {
  return (
    <header className="flex flex-col gap-3 border-b px-5 py-3 hairline lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-baseline gap-3">
        <h1 className="font-display text-xl font-semibold tracking-tight text-ink">
          Lex&nbsp;Digitalis
        </h1>
        <span className="hidden font-mono text-[11px] text-ink-faint sm:inline">
          India's Tech-Law Atlas · 1885–2025
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 lg:w-72">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, entities, tags…"
            aria-label="Search instruments"
            className="w-full rounded-full border bg-[var(--paper-pure)] px-4 py-1.5 text-sm text-ink placeholder:text-ink-faint hairline focus:outline-none focus:ring-2"
            style={{ ["--tw-ring-color" as any]: "var(--marigold)" }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={openPalette}
          className="hidden items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] text-ink-soft hairline transition hover:border-marigold hover:text-ink sm:flex"
          aria-label="Open command palette"
        >
          ⌘K
        </button>

        <span className="hidden font-mono text-[11px] text-ink-faint md:inline">
          {count}/{total}
        </span>

        <button
          onClick={toggleDark}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="grid h-8 w-8 place-items-center rounded-full border text-ink-soft hairline transition hover:text-ink"
        >
          {dark ? "☀" : "☾"}
        </button>
      </div>
    </header>
  );
}
