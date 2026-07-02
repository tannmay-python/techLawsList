import type { Lens, View } from "../types";
import type { Filters } from "./filters";

export interface Story {
  id: string;
  kicker: string;
  title: string;
  body: string;
  stat: string;
  view: View;
  lens?: Lens;
  patch: Partial<Filters>;
  cta: string;
}

export const STORIES: Story[] = [
  {
    id: "s70",
    kicker: "Protected systems",
    title: "The s.70 cluster",
    body: "One section of the IT Act is used again and again to declare banks and other bodies ‘protected systems’ — a large group of near-identical notifications.",
    stat: "33 × s.70",
    view: "atlas",
    lens: "power",
    patch: { sections: ["s.70"] },
    cta: "Open the s.70 cluster",
  },
  {
    id: "hard-soft",
    kicker: "Hard vs soft law",
    title: "What actually binds",
    body: "Hard law = binding statutes and the rules under them. Soft law = policies, missions, strategies and guidelines that guide but don't legally bind.",
    stat: "229 hard · 95 soft",
    view: "dashboard",
    patch: {},
    cta: "See the split",
  },
  {
    id: "frontier",
    kicker: "Frontier & strategic tech",
    title: "AI, space, biotech, minerals",
    body: "AI, quantum, space, semiconductors, biotech, nuclear and critical minerals together form the single largest domain in the repository — governed by a mix of binding rules and fast-moving policy.",
    stat: "67 instruments",
    view: "atlas",
    lens: "group",
    patch: { groups: ["Frontier Tech"] },
    cta: "Browse the frontier",
  },
  {
    id: "clean-tech",
    kicker: "The newest domain",
    title: "Clean tech and industrial policy",
    body: "Electric mobility, batteries, clean energy, advanced manufacturing and agritech — a domain that barely existed in India's tech-law rulebook a decade ago.",
    stat: "19 instruments",
    view: "atlas",
    lens: "group",
    patch: { groups: ["Industrial & Clean-Tech"] },
    cta: "See what's new",
  },
  {
    id: "turf",
    kicker: "Who administers",
    title: "The ministry map",
    body: "MeitY administers roughly a third of the entire rulebook; the rest scatters across DoT, UIDAI, Mines, Space, Atomic Energy, Commerce and Environment.",
    stat: "MeitY: 101 instruments",
    view: "dashboard",
    patch: {},
    cta: "See the ministries",
  },
  {
    id: "contested",
    kicker: "In the courts",
    title: "Instruments that were challenged",
    body: "A few instruments carry landmark litigation — s.66A struck down, Aadhaar upheld with limits, the IT Rules fact-check unit quashed, online gaming pending.",
    stat: "7 instruments",
    view: "explore",
    patch: { contested: true },
    cta: "See which ones",
  },
  {
    id: "extraterritorial",
    kicker: "Reach beyond India",
    title: "Extraterritorial instruments",
    body: "Twenty instruments apply beyond India's borders — the IT Act, the intermediary rules, the Telecom Act, the DPDP Act and several export-control regimes among them.",
    stat: "20 instruments",
    view: "explore",
    patch: { extraterritorial: true },
    cta: "See the list",
  },
  {
    id: "world",
    kicker: "Linked to global regimes",
    title: "Where Indian law meets treaties",
    body: "Sixty-five instruments connect to international frameworks — the ITU, the Outer Space Treaty, the CBD/Nagoya Protocol, IAEA safeguards, Wassenaar, NSG and MTCR.",
    stat: "65 instruments",
    view: "dashboard",
    patch: {},
    cta: "Trace the links",
  },
];
