import raw from "./laws.json";
import type { Law } from "../types";

export const LAWS: Law[] = raw as Law[];

export const YEARS = LAWS.map((l) => l.year).filter((y): y is number => y != null);
export const MIN_YEAR = 1885;
export const MAX_YEAR = 2025;
