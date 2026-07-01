import Fuse from "fuse.js";
import type { Law } from "../types";

export function makeFuse(laws: Law[]) {
  return new Fuse(laws, {
    keys: [
      { name: "title", weight: 0.45 },
      { name: "description", weight: 0.2 },
      { name: "domain", weight: 0.1 },
      { name: "adminBody", weight: 0.1 },
      { name: "entity", weight: 0.08 },
      { name: "type", weight: 0.07 },
    ],
    threshold: 0.38,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
}

export function search(fuse: Fuse<Law>, query: string): Law[] {
  const q = query.trim();
  if (!q) return [];
  return fuse.search(q).map((r) => r.item);
}
