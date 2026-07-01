import Fuse from "fuse.js";
import type { Law } from "../types";

export function makeFuse(laws: Law[]) {
  return new Fuse(laws, {
    keys: [
      { name: "title", weight: 0.5 },
      { name: "description", weight: 0.25 },
      { name: "entity", weight: 0.15 },
      { name: "tags", weight: 0.1 },
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
