export type Group =
  | "Core IT & Cyber"
  | "Digital Identity"
  | "Telecom & Media"
  | "Data & Privacy"
  | "Finance & Fintech"
  | "Frontier Tech"
  | "Strategic & Deep-Tech"
  | "Industrial & Clean-Tech"
  | "E-Governance";

export interface Law {
  id: string;
  title: string;
  description: string;
  section: string | null;
  dateISO: string | null;
  dateDisplay: string;
  rawDate: string | null;
  approxDate: boolean;
  year: number | null;
  decade: string | null;
  type: string;
  domain: string;
  group: Group;
  parentStatute: string;
  empoweringSection: string | null;
  bindingForce: string;
  hardLaw: boolean;
  status: string;
  adminBody: string;
  adminMinistry: string;
  legalBasis: string | null;
  territorial: string;
  extraterritorial: boolean;
  penaltyRegime: string;
  maxPenalty: string | null;
  coercionRank: number; // 0..3
  coercionLabel: string;
  judicialStatus: string | null;
  contested: boolean;
  compliance: string | null;
  complianceFlags: string[];
  international: string | null;
  intlRegimes: string[];
  source: string | null;
  sourceUrl: string | null;
  sourceExact: boolean;
  entity: string | null;
  lineageId: string | null;
}

export interface Meta {
  total: number;
  sections: number;
  domains: { key: string; count: number }[];
  groups: { key: string; count: number }[];
  types: { key: string; count: number }[];
  statuses: { key: string; count: number }[];
  binding: { key: string; count: number }[];
  ministries: { key: string; count: number }[];
  parents: { key: string; count: number }[];
  byYear: { year: number; count: number }[];
  extraterritorial: number;
  contested: number;
  hardLaw: number;
  softLaw: number;
  withIntl: number;
  s70count: number;
  minYear: number;
  maxYear: number;
}

export type View = "overview" | "atlas" | "dashboard" | "explore";
export type Lens = "timeline" | "group" | "family" | "power" | "type" | "status" | "binding";
