import fs from "node:fs";
import path from "node:path";
import {
  War,
  WarIndex,
  type War as WarT,
  type WarIndexEntry,
} from "./wars-types";

export function loadWarIndex(): WarIndexEntry[] {
  const p = path.join(process.cwd(), "public", "data", "wars", "index.json");
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  const parsed = WarIndex.parse(j);
  return parsed.wars;
}

export function loadWar(slug: string): WarT | null {
  const p = path.join(
    process.cwd(),
    "public",
    "data",
    "wars",
    `${slug}.json`
  );
  if (!fs.existsSync(p)) return null;
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  return War.parse(j);
}
