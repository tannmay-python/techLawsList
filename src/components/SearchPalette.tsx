import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Law, Lens } from "../types";
import { makeFuse, search } from "../lib/search";
import { LENSES, DOMAIN_COLORS } from "../lib/palette";

interface Cmd {
  id: string;
  kind: "instrument" | "lens" | "action";
  label: string;
  hint?: string;
  color?: string;
  run: () => void;
}

interface Props {
  open: boolean;
  laws: Law[];
  onClose: () => void;
  onSelect: (id: string) => void;
  setLens: (l: Lens) => void;
  clear: () => void;
  reducedMotion: boolean;
}

export default function SearchPalette({
  open, laws, onClose, onSelect, setLens, clear, reducedMotion,
}: Props) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fuse = useMemo(() => makeFuse(laws), [laws]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const results: Cmd[] = useMemo(() => {
    const lensCmds: Cmd[] = LENSES.map((l) => ({
      id: `lens-${l.id}`,
      kind: "lens",
      label: `Switch to ${l.label} lens`,
      hint: "lens",
      run: () => {
        setLens(l.id);
        onClose();
      },
    }));
    const actionCmds: Cmd[] = [
      { id: "clear", kind: "action", label: "Clear all filters", hint: "action", run: () => { clear(); onClose(); } },
    ];
    const instrCmds: Cmd[] = search(fuse, q)
      .slice(0, 30)
      .map((l) => ({
        id: l.id,
        kind: "instrument",
        label: l.title,
        hint: `${l.instrumentType} · ${l.dateDisplay}`,
        color: DOMAIN_COLORS[l.domain],
        run: () => {
          onSelect(l.id);
          onClose();
        },
      }));

    if (!q.trim()) {
      // default view: lenses + actions + a few notable instruments
      const featured = laws
        .filter((l) => l.instrumentType === "Act")
        .slice(0, 6)
        .map<Cmd>((l) => ({
          id: l.id,
          kind: "instrument",
          label: l.title,
          hint: `${l.instrumentType} · ${l.dateDisplay}`,
          color: DOMAIN_COLORS[l.domain],
          run: () => {
            onSelect(l.id);
            onClose();
          },
        }));
      return [...lensCmds, ...actionCmds, ...featured];
    }
    const ql = q.toLowerCase();
    const matchLens = lensCmds.filter((c) => c.label.toLowerCase().includes(ql));
    return [...instrCmds, ...matchLens];
  }, [q, fuse, laws, setLens, clear, onClose, onSelect]);

  useEffect(() => {
    if (active >= results.length) setActive(0);
  }, [results, active]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[active]?.run();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.001 : 0.15 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-xl overflow-hidden rounded-2xl border bg-[var(--paper)] shadow-drawer hairline"
            initial={{ y: reducedMotion ? 0 : -16, opacity: 0, scale: reducedMotion ? 1 : 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: reducedMotion ? 0 : -16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div className="flex items-center gap-3 border-b px-4 py-3 hairline">
              <span className="text-ink-faint">⌘K</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="Search 149 instruments, jump to a lens, or run a command…"
                className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>
            <ul className="scroll-thin max-h-[52vh] overflow-y-auto py-2">
              {results.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-ink-faint">No matches.</li>
              )}
              {results.map((c, i) => (
                <li key={c.id}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={c.run}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left"
                    style={{ background: i === active ? "rgba(241,162,34,0.16)" : "transparent" }}
                  >
                    {c.color ? (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                    ) : (
                      <span className="font-mono text-[10px] uppercase text-ink-faint">
                        {c.kind === "lens" ? "lens" : "cmd"}
                      </span>
                    )}
                    <span className="flex-1 truncate text-[14px] text-ink">{c.label}</span>
                    {c.hint && <span className="font-mono text-[10px] text-ink-faint">{c.hint}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
