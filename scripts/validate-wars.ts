import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { War, WarIndex } from "../lib/wars-types";

const DATA_DIR = join(process.cwd(), "public", "data", "wars");

const errors: string[] = [];

// Validate index
try {
  const idx = JSON.parse(readFileSync(join(DATA_DIR, "index.json"), "utf8"));
  WarIndex.parse(idx);
  console.log("✓ index.json valid");
} catch (e: any) {
  const issues = e.issues
    ? e.issues.map((i: any) => `${i.path.join(".")}: ${i.message}`).join("; ")
    : e.message || String(e);
  errors.push(`index.json: ${issues}`);
}

// Validate each war file
const files = readdirSync(DATA_DIR).filter(
  (f) => f.endsWith(".json") && f !== "index.json"
);

for (const f of files) {
  try {
    const data = JSON.parse(readFileSync(join(DATA_DIR, f), "utf8"));
    War.parse(data);
    console.log(`✓ ${f} valid (${data.events.length} events)`);
  } catch (e: any) {
    const issues = e.issues
      ? e.issues.map((i: any) => `${i.path.join(".")}: ${i.message}`).join("; ")
      : e.message || String(e);
    errors.push(`${f}: ${issues}`);
  }
}

if (errors.length) {
  console.error(`\n✗ ${errors.length} validation errors:\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`\n✓ All ${files.length + 1} files valid.`);
