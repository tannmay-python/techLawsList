export type InstrumentType =
  | "Act"
  | "Rule"
  | "Regulation"
  | "Notification"
  | "Policy/Framework"
  | "Order";

export type Domain =
  | "IT & Cyber Security"
  | "Banking & Finance"
  | "Healthcare"
  | "Telecom"
  | "Broadcasting & Media"
  | "Data Protection & Privacy"
  | "Identity/Aadhaar"
  | "E-governance";

export type ParentStatute =
  | "IT Act 2000"
  | "Aadhaar Act 2016"
  | "Telecom Act 2023"
  | "Telegraph Act 1885"
  | "TRAI Act 1997"
  | "Standalone";

export type EmpoweringSection =
  | "s.70"
  | "s.79A"
  | "s.69A"
  | "s.69B"
  | "s.46"
  | "s.88"
  | "s.7"
  | null;

export type Status =
  | "In force"
  | "Draft/Proposed"
  | "Superseded/Rescinded"
  | "Consolidated";

export interface Law {
  id: string;
  title: string;
  description: string;
  dateISO: string | null;
  dateDisplay: string;
  rawDate: string | null;
  year: number | null;
  decade: string | null;
  instrumentType: InstrumentType;
  domain: Domain;
  parentStatute: ParentStatute;
  empoweringSection: EmpoweringSection;
  status: Status;
  entity: string | null;
  tags: string[];
  lineageId: string | null;
  gazetteNote: string | null;
}

export type Lens = "timeline" | "family" | "power" | "instrument" | "status";

export interface NodePos {
  id: string;
  x: number;
  y: number;
  r: number;
}
