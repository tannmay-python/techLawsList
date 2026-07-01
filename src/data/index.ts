import lawsRaw from "./laws.json";
import metaRaw from "./meta.json";
import type { Law, Meta } from "../types";

export const LAWS: Law[] = lawsRaw as Law[];
export const META: Meta = metaRaw as Meta;
export const MIN_YEAR = 1885;
export const MAX_YEAR = 2025;
