import fs from "node:fs";
import path from "node:path";
import type { War, WarIndexEntry } from "./wars-types";

export function loadWarIndex(): WarIndexEntry[] {
  const p = path.join(process.cwd(), "public", "data", "wars", "index.json");
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  return j.wars as WarIndexEntry[];
}

export function loadWar(slug: string): War | null {
  const p = path.join(
    process.cwd(),
    "public",
    "data",
    "wars",
    `${slug}.json`
  );
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8")) as War;
}
