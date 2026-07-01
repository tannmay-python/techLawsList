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
    id: "big-bang",
    kicker: "The big bang",
    title: "A century of silence, then an explosion",
    body: "From the 1885 Telegraph Act, tech law trickled for over a century. After 2016 it detonated — the large majority of 213 instruments arrive in the last decade.",
    stat: "129 instruments since 2016",
    view: "atlas",
    lens: "timeline",
    patch: {},
    cta: "Play the timeline",
  },
  {
    id: "s70",
    kicker: "Few powers, many exercises",
    title: "The same move, institution by institution",
    body: "One statutory lever — s.70 of the IT Act — is pulled again and again to declare bank after bank a ‘protected system’. Thirty-three near-identical notifications.",
    stat: "33 × s.70",
    view: "atlas",
    lens: "power",
    patch: { sections: ["s.70"] },
    cta: "Isolate the s.70 cluster",
  },
  {
    id: "hard-soft",
    kicker: "The texture of the rulebook",
    title: "Hard law rules — but frontier tech runs on soft law",
    body: "179 instruments bind; 34 are soft-law policies, missions and strategies. Almost all of AI, quantum, space and semiconductors is governed by soft law, not statute.",
    stat: "34 soft-law instruments",
    view: "dashboard",
    patch: {},
    cta: "See the hard-vs-soft split",
  },
  {
    id: "frontier",
    kicker: "The new frontier",
    title: "AI, space, biotech, minerals arrive at once",
    body: "A distinct 2021–2025 wave governs frontier and strategic technologies — mostly by policy and mission rather than binding law, and often before the tech is mature.",
    stat: "25 frontier instruments",
    view: "atlas",
    lens: "group",
    patch: { groups: ["Frontier Tech"] },
    cta: "Explore the frontier",
  },
  {
    id: "turf",
    kicker: "Who holds the pen",
    title: "MeitY’s dominion, and the ministry map",
    body: "One ministry writes most of India’s digital rulebook, while frontier domains scatter across Mines, Space, Atomic Energy, Commerce and Environment.",
    stat: "MeitY: the largest turf",
    view: "dashboard",
    patch: {},
    cta: "Map the ministries",
  },
  {
    id: "contested",
    kicker: "Contested ground",
    title: "The laws that went to court",
    body: "A handful of instruments carry landmark litigation — s.66A struck down, Aadhaar upheld with limits, the IT Rules’ fact-check unit quashed, online gaming pending.",
    stat: "6 contested instruments",
    view: "explore",
    patch: { contested: true },
    cta: "Read the contestation map",
  },
  {
    id: "extraterritorial",
    kicker: "Reach beyond the border",
    title: "Laws that follow the data out of India",
    body: "Fourteen instruments claim extraterritorial reach — the IT Act, the intermediary rules, the Telecom Act and the DPDP Act among them.",
    stat: "14 extraterritorial",
    view: "explore",
    patch: { extraterritorial: true },
    cta: "See the extraterritorial set",
  },
  {
    id: "world",
    kicker: "India and the world",
    title: "Where domestic law meets global regimes",
    body: "Eighteen instruments hook into international frameworks — ITU, the Outer Space Treaty, the CBD/Nagoya Protocol, IAEA safeguards, Wassenaar, NSG and MTCR.",
    stat: "18 linked to global regimes",
    view: "dashboard",
    patch: {},
    cta: "Trace the linkages",
  },
];
