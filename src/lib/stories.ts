import type { Lens } from "../types";
import type { Filters } from "./filters";

export interface Story {
  id: string;
  kicker: string;
  title: string;
  body: string;
  lens: Lens;
  patch: Partial<Filters>;
  cta: string;
}

export const STORIES: Story[] = [
  {
    id: "big-bang",
    kicker: "The big bang",
    title: "A century of silence, then an explosion",
    body: "From the Telegraph Act of 1885, tech law trickled. After the 2016 Aadhaar Act and the first protected-system wave, it detonated — most of these 149 instruments arrive after 2016.",
    lens: "timeline",
    patch: {},
    cta: "Play the timeline",
  },
  {
    id: "s70",
    kicker: "Few powers, many exercises",
    title: "The same move, bank by bank",
    body: "The Power lens collapses dozens of notifications into a handful of statutory levers — and lays bare that ~30 are the identical s.70 protected-system designation, repeated for one institution after another.",
    lens: "power",
    patch: { sections: ["s.70"] },
    cta: "Isolate the s.70 cluster",
  },
  {
    id: "telegraph-telecom",
    kicker: "A statute retires",
    title: "Telegraph (1885) → Telecom (2023)",
    body: "The 1885 Telegraph Act governed wires for 138 years before the 2023 Telecom Act consolidated and replaced it — dragging a 2024 wave of rules in its wake.",
    lens: "family",
    patch: { domains: ["Telecom"] },
    cta: "Show the telecom family",
  },
  {
    id: "aadhaar-cluster",
    kicker: "Genealogy",
    title: "Aadhaar's rulemaking cluster",
    body: "The 2016 Aadhaar Act spawned regulations, then a dense cluster of s.7 enrolment notifications and deadline extensions — a giant spawning rules spawning notifications.",
    lens: "family",
    patch: { domains: ["Identity/Aadhaar"] },
    cta: "Show the Aadhaar family",
  },
  {
    id: "amendment-chains",
    kicker: "Amendment chains",
    title: "The Right-of-Way lineage",
    body: "The Indian Telegraph Right-of-Way Rules, 2016 were amended in 2017, 2021, 2022 and 2023, consolidated twice, then superseded by the 2024 RoW Rules — a single lineage you can trace end to end.",
    lens: "instrument",
    patch: { query: "right of way" },
    cta: "Trace the RoW chain",
  },
];
