import type { Group, Lens } from "../types";

/** 9 super-domain colours, anchored by Llama (#620d3c) + Marigold (#f1a222). */
export const GROUP_COLORS: Record<Group, string> = {
  "Core IT & Cyber": "#620d3c", // Llama plum
  "Digital Identity": "#f1a222", // Marigold
  "Telecom & Media": "#2f5d8a", // deep blue
  "Data & Privacy": "#6a4c93", // violet
  "Finance & Fintech": "#1f7a70", // teal
  "Frontier Tech": "#c65a1e", // burnt orange
  "Strategic & Deep-Tech": "#9c2f45", // rosewood
  "Industrial & Clean-Tech": "#6b7a3f", // olive
  "E-Governance": "#4a7c59", // green
};

export const GROUP_ORDER: Group[] = [
  "Core IT & Cyber",
  "Digital Identity",
  "Telecom & Media",
  "Data & Privacy",
  "Finance & Fintech",
  "Frontier Tech",
  "Strategic & Deep-Tech",
  "Industrial & Clean-Tech",
  "E-Governance",
];

/** Node radius by instrument weight. */
export function radiusForType(type: string): number {
  if (type === "Act") return 11;
  if (type === "Amendment Act") return 9;
  if (type === "Regulations" || type === "Rules") return 7.5;
  if (type === "Policy / Framework" || type === "Scheme" || type === "Strategy" || type === "Programme") return 7;
  if (type === "Guidelines" || type === "Directive" || type === "Directions" || type === "Advisory" || type === "Recommendation")
    return 6;
  if (type === "Bill (Draft)") return 6.5;
  return 5; // Notification / Order / Control List
}

export const LENSES: { id: Lens; label: string; blurb: string }[] = [
  { id: "timeline", label: "Timeline", blurb: "Every instrument placed by date, in lanes by domain." },
  { id: "group", label: "Domain", blurb: "Grouped into nine domains, from cyber to space, critical minerals and clean tech." },
  { id: "family", label: "Family", blurb: "Grouped by the parent statute each instrument sits under." },
  { id: "power", label: "Power", blurb: "Grouped by the empowering section of the parent Act." },
  { id: "type", label: "Instrument", blurb: "Grouped by kind — Acts, rules, notifications, policies, schemes." },
  { id: "status", label: "Status", blurb: "Grouped by whether each is in force, superseded or draft." },
  { id: "binding", label: "Hard vs soft", blurb: "Hard law (binding statutes and rules) vs soft law (policies, missions, guidelines)." },
];

export const SECTION_LABELS: Record<string, string> = {
  "s.70": "s.70 · Protected systems",
  "s.70B": "s.70B · CERT-In",
  "s.79A": "s.79A · Examiner of evidence",
  "s.69A": "s.69A · Blocking",
  "s.69B": "s.69B · Monitoring",
  "s.69": "s.69 · Interception",
  "s.46": "s.46 · Adjudication",
  "s.88": "s.88 · Advisory",
  "s.7": "s.7 · Aadhaar",
  none: "No specific section",
};

export const PARENT_LABELS: Record<string, string> = {
  "IT Act 2000": "IT Act, 2000",
  "Aadhaar Act 2016": "Aadhaar Act, 2016",
  "Telecom Act 2023": "Telecom Act, 2023",
  "Telegraph Act 1885": "Telegraph Act, 1885",
  "TRAI Act 1997": "TRAI Act, 1997",
  "DPDP Act 2023": "DPDP Act, 2023",
  "MMDR Act 1957": "MMDR Act, 1957",
  "PSS Act 2007": "PSS Act, 2007",
  Standalone: "Standalone",
};

export const STATUS_COLORS: Record<string, string> = {
  "In force": "#4a7c59",
  "In force (phased)": "#6a9c4a",
  Consolidated: "#2f5d8a",
  "Superseded / Repealed": "#9c2f45",
  "Draft / Proposed": "#d9860a",
};

export const COERCION_COLORS = ["#c9b8a8", "#e0a95a", "#d9702a", "#9c2f45"]; // 0..3
