import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { War, type WarIndexEntry } from "../lib/wars-types";

const DATA_DIR = join(process.cwd(), "public", "data", "wars");

// Curated slug order — so the selection page renders chronologically per era
const SLUG_ORDER = [
  "second-punic-war",
  "mongol-conquests",
  "thirty-years-war",
  "napoleonic-wars",
  "american-civil-war",
  "world-war-i",
  "turkish-war-of-independence",
  "world-war-ii",
  "gulf-and-iraq-wars",
  "russo-ukrainian-war",
];

const files = readdirSync(DATA_DIR).filter(
  (f) => f.endsWith(".json") && f !== "index.json"
);

const entries: WarIndexEntry[] = [];

for (const f of files) {
  const raw = JSON.parse(readFileSync(join(DATA_DIR, f), "utf8"));
  const w = War.parse(raw);
  const sideAFlag = w.sides[0]?.countries[0]?.flagUrl;
  const sideBFlag = w.sides[1]?.countries[0]?.flagUrl;
  entries.push({
    slug: w.slug,
    name: w.name,
    nameTr: w.nameTr,
    startYear: w.startYear,
    endYear: w.endYear,
    eventCount: w.events.length,
    blurb: w.blurb,
    blurbTr: w.blurbTr,
    era: w.era,
    region: w.region,
    tags: w.tags,
    sideAFlagUrl: sideAFlag,
    sideBFlagUrl: sideBFlag,
    militaryDead: w.casualties.militaryDead,
  });
}

// Order by curated slug list; unknown slugs at the end alphabetically
entries.sort((a, b) => {
  const ai = SLUG_ORDER.indexOf(a.slug);
  const bi = SLUG_ORDER.indexOf(b.slug);
  if (ai === -1 && bi === -1) return a.slug.localeCompare(b.slug);
  if (ai === -1) return 1;
  if (bi === -1) return -1;
  return ai - bi;
});

const out = { wars: entries };
writeFileSync(
  join(DATA_DIR, "index.json"),
  JSON.stringify(out, null, 2) + "\n"
);

console.log(`✓ Wrote index.json with ${entries.length} wars`);
for (const e of entries) {
  console.log(
    `  - ${e.slug}: ${e.eventCount} events, ${e.militaryDead?.toLocaleString() ?? "?"} military dead`
  );
}
