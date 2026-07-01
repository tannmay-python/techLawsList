import type { Domain, InstrumentType, Lens } from "../types";

/**
 * Domain colours — anchored by the two brand colours (Llama plum + Marigold)
 * and rounded out with six muted, harmonious, colourblind-distinguishable
 * hues that read well on the pale-yellow paper ground.
 */
export const DOMAIN_COLORS: Record<Domain, string> = {
  "IT & Cyber Security": "#620d3c", // Llama plum (the giant)
  "Banking & Finance": "#1f6f6b", // teal
  Healthcare: "#b23a48", // rosewood
  Telecom: "#2b5a8c", // deep blue
  "Broadcasting & Media": "#9c5b2a", // terracotta
  "Data Protection & Privacy": "#6a4c93", // violet
  "Identity/Aadhaar": "#f1a222", // Marigold
  "E-governance": "#4a7c59", // green
};

export const DOMAIN_ORDER: Domain[] = [
  "IT & Cyber Security",
  "Data Protection & Privacy",
  "Identity/Aadhaar",
  "Banking & Finance",
  "Telecom",
  "Broadcasting & Media",
  "Healthcare",
  "E-governance",
];

// Node radius by instrument weight (Act > Rule/Regulation > Policy > Notification/Order)
export const INSTRUMENT_RADIUS: Record<InstrumentType, number> = {
  Act: 11,
  Rule: 7.5,
  Regulation: 7.5,
  "Policy/Framework": 6.5,
  Order: 5.5,
  Notification: 5,
};

export const LENSES: { id: Lens; label: string; blurb: string }[] = [
  { id: "timeline", label: "Timeline", blurb: "A century of near-silence, then the post-2016 explosion." },
  { id: "family", label: "Family", blurb: "Statutes as giants spawning rules, regulations and notifications." },
  { id: "power", label: "Power", blurb: "Dozens of notifications collapse into a handful of statutory levers." },
  { id: "instrument", label: "Instrument", blurb: "Act, Rule, Regulation, Notification, Policy, Order." },
  { id: "status", label: "Status", blurb: "In force, draft, superseded, consolidated." },
];

export const SECTION_LABELS: Record<string, string> = {
  "s.70": "s.70 · Protected systems",
  "s.79A": "s.79A · Examiner of evidence",
  "s.69A": "s.69A · Blocking",
  "s.69B": "s.69B · Monitoring",
  "s.46": "s.46 · Adjudication",
  "s.88": "s.88 · Advisory",
  "s.7": "s.7 · Aadhaar",
  none: "No empowering section",
};

export const PARENT_LABELS: Record<string, string> = {
  "IT Act 2000": "IT Act, 2000",
  "Aadhaar Act 2016": "Aadhaar Act, 2016",
  "Telecom Act 2023": "Telecom Act, 2023",
  "Telegraph Act 1885": "Telegraph Act, 1885",
  "TRAI Act 1997": "TRAI Act, 1997",
  Standalone: "Standalone",
};
