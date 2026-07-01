import { AnimatePresence, motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import type { Law } from "../types";
import { DOMAIN_COLORS, PARENT_LABELS, SECTION_LABELS } from "../lib/palette";

interface Props {
  law: Law | null;
  all: Law[];
  onClose: () => void;
  onSelect: (id: string) => void;
  reducedMotion: boolean;
}

function related(law: Law, all: Law[]): { label: string; items: Law[] }[] {
  const others = all.filter((l) => l.id !== law.id);
  const groups: { label: string; items: Law[] }[] = [];
  if (law.lineageId) {
    const items = others.filter((l) => l.lineageId === law.lineageId);
    if (items.length) groups.push({ label: "Same lineage / amendment chain", items });
  }
  if (law.empoweringSection) {
    const items = others.filter(
      (l) => l.empoweringSection === law.empoweringSection && l.lineageId !== law.lineageId
    );
    if (items.length)
      groups.push({ label: `Same power (${law.empoweringSection})`, items: items.slice(0, 12) });
  }
  if (law.parentStatute !== "Standalone") {
    const items = others.filter(
      (l) => l.parentStatute === law.parentStatute && l.empoweringSection !== law.empoweringSection
    );
    if (items.length)
      groups.push({ label: `Same family (${PARENT_LABELS[law.parentStatute]})`, items: items.slice(0, 12) });
  }
  return groups;
}

const STATUS_TINT: Record<string, string> = {
  "In force": "#4a7c59",
  Consolidated: "#2b5a8c",
  "Superseded/Rescinded": "#b23a48",
  "Draft/Proposed": "#d9860a",
};

export default function DetailDrawer({ law, all, onClose, onSelect, reducedMotion }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {law && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.001 : 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            className="scroll-thin fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto border-l bg-[var(--paper)] shadow-drawer hairline"
            initial={{ x: reducedMotion ? 0 : "100%", opacity: reducedMotion ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: reducedMotion ? 0 : "100%", opacity: reducedMotion ? 0 : 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-label={law.title}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-[var(--paper)] px-6 py-4 hairline">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: DOMAIN_COLORS[law.domain] }} />
                <span className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                  {law.domain}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-7 w-7 place-items-center rounded-full border text-ink-soft hairline transition hover:bg-llama hover:text-paper"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="font-mono text-xs text-marigold-deep" style={{ color: "var(--marigold)" }}>
                {law.dateDisplay}
              </div>
              <h2 className="mt-1 font-display text-2xl font-semibold leading-tight text-ink">
                {law.title}
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                <Tag>{law.instrumentType}</Tag>
                <Tag color={STATUS_TINT[law.status]}>{law.status}</Tag>
                {law.empoweringSection && <Tag>{law.empoweringSection}</Tag>}
                {law.tags.map((t) => (
                  <Tag key={t} subtle>
                    {t}
                  </Tag>
                ))}
              </div>

              <dl className="mt-5 grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                <Meta k="Parent statute" v={PARENT_LABELS[law.parentStatute]} />
                {law.empoweringSection && (
                  <Meta k="Empowering section" v={SECTION_LABELS[law.empoweringSection] || law.empoweringSection} />
                )}
                {law.entity && <Meta k="Named entity" v={law.entity} />}
                {law.rawDate && <Meta k="As stated in sheet" v={law.rawDate} mono />}
              </dl>

              {law.gazetteNote && (
                <div className="mt-4 rounded-lg border border-dashed p-3 text-xs leading-relaxed text-ink-soft hairline">
                  <span className="font-semibold text-ink">Gazette note. </span>
                  {law.gazetteNote}
                </div>
              )}

              <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{law.description}</p>

              {related(law, all).map((g) => (
                <div key={g.label} className="mt-6">
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                    {g.label} · {g.items.length}
                  </h3>
                  <ul className="flex flex-col gap-1">
                    {g.items.map((r) => (
                      <li key={r.id}>
                        <button
                          onClick={() => onSelect(r.id)}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-ink-soft transition hover:bg-[rgba(241,162,34,0.14)] hover:text-ink"
                        >
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: DOMAIN_COLORS[r.domain] }}
                          />
                          <span className="flex-1 truncate">{r.title}</span>
                          <span className="font-mono text-[10px] text-ink-faint">
                            {r.year ?? "—"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Meta({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <>
      <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">{k}</dt>
      <dd className={mono ? "font-mono text-[13px] text-ink" : "text-ink"}>{v}</dd>
    </>
  );
}

function Tag({
  children,
  subtle,
  color,
}: {
  children: ReactNode;
  subtle?: boolean;
  color?: string;
}) {
  return (
    <span
      className="rounded-full border px-2 py-0.5 font-mono text-[10px] hairline"
      style={{
        color: color || (subtle ? "var(--ink-faint)" : "var(--ink-soft)"),
        borderColor: color ? color : undefined,
      }}
    >
      {children}
    </span>
  );
}
