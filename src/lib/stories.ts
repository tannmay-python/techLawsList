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
    stat: "179 hard · 34 soft",
    view: "dashboard",
    patch: {},
    cta: "See the split",
  },
  {
    id: "frontier",
    kicker: "Frontier & strategic tech",
    title: "AI, space, biotech, minerals",
    body: "Newer domains — AI, quantum, space, semiconductors, biotech, nuclear, critical minerals — are governed largely by policy and mission rather than binding statute.",
    stat: "25 instruments",
    view: "atlas",
    lens: "group",
    patch: { groups: ["Frontier Tech"] },
    cta: "Browse the frontier",
  },
  {
    id: "turf",
    kicker: "Who administers",
    title: "The ministry map",
    body: "MeitY administers most of the digital rulebook; frontier domains sit with Mines, Space, Atomic Energy, Commerce and Environment.",
    stat: "MeitY leads",
    view: "dashboard",
    patch: {},
    cta: "See the ministries",
  },
  {
    id: "contested",
    kicker: "In the courts",
    title: "Instruments that were challenged",
    body: "A few instruments carry landmark litigation — s.66A struck down, Aadhaar upheld with limits, the IT Rules fact-check unit quashed, online gaming pending.",
    stat: "6 instruments",
    view: "explore",
    patch: { contested: true },
    cta: "See which ones",
  },
  {
    id: "extraterritorial",
    kicker: "Reach beyond India",
    title: "Extraterritorial instruments",
    body: "Fourteen instruments apply beyond India's borders — the IT Act, the intermediary rules, the Telecom Act and the DPDP Act among them.",
    stat: "14 instruments",
    view: "explore",
    patch: { extraterritorial: true },
    cta: "See the list",
  },
  {
    id: "world",
    kicker: "Linked to global regimes",
    title: "Where Indian law meets treaties",
    body: "Eighteen instruments connect to international frameworks — the ITU, the Outer Space Treaty, the CBD/Nagoya Protocol, IAEA safeguards, Wassenaar, NSG and MTCR.",
    stat: "18 instruments",
    view: "dashboard",
    patch: {},
    cta: "Trace the links",
  },
];
