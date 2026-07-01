import { AnimatePresence, motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import type { Law } from "../types";
import { GROUP_COLORS, PARENT_LABELS, SECTION_LABELS, STATUS_COLORS, COERCION_COLORS } from "../lib/palette";

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
    const items = others.filter((l) => l.empoweringSection === law.empoweringSection && l.lineageId !== law.lineageId);
    if (items.length) groups.push({ label: `Same power (${law.empoweringSection})`, items: items.slice(0, 10) });
  }
  if (law.parentStatute !== "Standalone") {
    const items = others.filter((l) => l.parentStatute === law.parentStatute && l.empoweringSection !== law.empoweringSection && l.lineageId !== law.lineageId);
    if (items.length) groups.push({ label: `Same family (${PARENT_LABELS[law.parentStatute]})`, items: items.slice(0, 10) });
  }
  return groups;
}

export default function DetailDrawer({ law, all, onClose, onSelect, reducedMotion }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {law && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/25" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0.001 : 0.2 }} onClick={onClose} />
          <motion.aside
            className="scroll-thin fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto border-l bg-paper drawer-shadow hairline"
            initial={{ x: reducedMotion ? 0 : "100%", opacity: reducedMotion ? 0 : 1 }} animate={{ x: 0, opacity: 1 }} exit={{ x: reducedMotion ? 0 : "100%", opacity: reducedMotion ? 0 : 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }} role="dialog" aria-modal="true" aria-label={law.title}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-paper px-6 py-4 hairline">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: GROUP_COLORS[law.group] }} />
                <span className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">{law.domain}</span>
              </div>
              <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-full border text-ink-soft hairline transition hover:bg-llama hover:text-paper">✕</button>
            </div>

            <div className="px-6 py-5">
              <div className="font-mono text-xs" style={{ color: "var(--marigold-deep)" }}>{law.dateDisplay}{law.approxDate && law.rawDate ? "" : ""}</div>
              <h2 className="mt-1 font-display text-2xl font-semibold leading-tight text-ink">{law.title}</h2>

              <div className="mt-4 flex flex-wrap gap-2">
                <Tag>{law.type}</Tag>
                <Tag color={STATUS_COLORS[law.status]}>{law.status}</Tag>
                <Tag color={law.hardLaw ? "var(--llama)" : "var(--marigold-deep)"}>{law.hardLaw ? "Hard law" : "Soft law"}</Tag>
                {law.empoweringSection && <Tag>{law.empoweringSection}</Tag>}
                {law.extraterritorial && <Tag color="#2f5d8a">Extraterritorial</Tag>}
                {law.contested && <Tag color="#9c2f45">Contested</Tag>}
              </div>

              <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{law.description}</p>

              {/* coercion meter */}
              {law.penaltyRegime && law.penaltyRegime !== "Under parent Act" && (
                <div className="mt-5">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Coercion</span>
                    <span className="text-[12px] text-ink-soft">{law.coercionLabel}</span>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= law.coercionRank ? COERCION_COLORS[law.coercionRank] : "var(--rule)" }} />
                    ))}
                  </div>
                  {law.maxPenalty && law.maxPenalty !== "See parent Act" && <p className="mt-1.5 text-[12px] text-ink-soft"><span className="text-ink-faint">Headline ceiling: </span>{law.maxPenalty}</p>}
                </div>
              )}

              <dl className="mt-5 grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                <Meta k="Parent statute" v={PARENT_LABELS[law.parentStatute] || law.parentStatute} />
                {law.empoweringSection && <Meta k="Empowering section" v={SECTION_LABELS[law.empoweringSection] || law.empoweringSection} />}
                <Meta k="Administering body" v={law.adminBody} />
                <Meta k="Binding force" v={law.bindingForce} />
                <Meta k="Territorial reach" v={law.territorial} />
                {law.legalBasis && <Meta k="Legal basis" v={law.legalBasis} />}
                {law.entity && <Meta k="Named entity" v={law.entity} />}
                {law.rawDate && <Meta k="Date (as recorded)" v={law.rawDate} mono />}
              </dl>

              {law.complianceFlags.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">Compliance burden</h3>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {law.complianceFlags.map((f) => (
                      <span key={f} className="rounded-full border px-2 py-0.5 font-mono text-[10px] text-ink-soft hairline" style={{ background: "rgba(241,162,34,0.12)" }}>{f}</span>
                    ))}
                  </div>
                  {law.compliance && <p className="text-[13px] leading-relaxed text-ink-soft">{law.compliance}</p>}
                </div>
              )}

              {law.judicialStatus && (
                <div className="mt-5 rounded-lg border-l-2 p-3" style={{ borderColor: "#9c2f45", background: "rgba(156,47,69,0.06)" }}>
                  <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#9c2f45" }}>Judicial status</span>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink">{law.judicialStatus}</p>
                </div>
              )}

              {law.intlRegimes.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">International linkage</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {law.intlRegimes.map((r) => (
                      <span key={r} className="rounded-full border px-2 py-0.5 text-[11px] text-ink-soft hairline" style={{ background: "rgba(47,93,138,0.1)" }}>{r}</span>
                    ))}
                  </div>
                </div>
              )}

              {law.sourceUrl && (
                <a href={law.sourceUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px] text-ink-soft hairline transition hover:border-marigold hover:text-ink">
                  Primary source: {law.source} <span aria-hidden>↗</span>
                </a>
              )}
              {!law.sourceUrl && law.source && <p className="mt-5 font-mono text-[11px] text-ink-faint">Source: {law.source}</p>}

              {related(law, all).map((g) => (
                <div key={g.label} className="mt-6">
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">{g.label} · {g.items.length}</h3>
                  <ul className="flex flex-col gap-1">
                    {g.items.map((r) => (
                      <li key={r.id}>
                        <button onClick={() => onSelect(r.id)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-ink-soft transition hover:bg-[rgba(241,162,34,0.14)] hover:text-ink">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: GROUP_COLORS[r.group] }} />
                          <span className="flex-1 truncate">{r.title}</span>
                          <span className="font-mono text-[10px] text-ink-faint">{r.year ?? "—"}</span>
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

function Tag({ children, color }: { children: ReactNode; color?: string }) {
  return <span className="rounded-full border px-2 py-0.5 font-mono text-[10px] hairline" style={{ color: color || "var(--ink-soft)", borderColor: color || undefined }}>{children}</span>;
}
