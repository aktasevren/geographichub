import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "public", "data", "wars");

type WarFile = {
  slug: string;
  sides: Array<{
    countries: Array<{
      name: string;
      flagUrl?: string;
      flagFallback?: "coat" | "emblem";
    }>;
  }>;
};

const UA =
  "GeographicHub/0.1 (https://maphub.example; contact@maphub.example) node-flag-checker";

// Extract a bare filename from a Wikimedia URL and URL-decode it.
function filenameFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const last = parts[parts.length - 1];
    // upload.wikimedia.org/.../thumb/<h1>/<h1h2>/<filename.svg>/<width>px-<filename.svg>.png
    // or upload.wikimedia.org/.../<h1>/<h1h2>/<filename.svg>
    // For thumb URLs the last segment is "800px-<filename>.png"; we want the
    // original filename, which is the penultimate path segment in that case.
    if (u.pathname.includes("/thumb/")) {
      const original = parts[parts.length - 2];
      if (original) return decodeURIComponent(original);
    }
    return decodeURIComponent(last);
  } catch {
    return null;
  }
}

function specialFilePath(filename: string): string {
  // Wikimedia's Special:FilePath always redirects to the canonical file.
  // Spaces become underscores; everything else is URI-encoded.
  const normalized = filename.replace(/ /g, "_");
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(normalized)}`;
}

async function follows(url: string): Promise<number> {
  try {
    const r = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": UA },
      redirect: "follow",
    });
    return r.status;
  } catch {
    return 0;
  }
}

async function main() {
  const files = readdirSync(DATA_DIR).filter(
    (f) => f.endsWith(".json") && f !== "index.json"
  );

  let totalChecked = 0;
  let totalRewritten = 0;
  let totalBroken = 0;
  const reports: string[] = [];

  for (const f of files) {
    const path = join(DATA_DIR, f);
    const data: WarFile = JSON.parse(readFileSync(path, "utf8"));
    let mutated = false;
    const broken: string[] = [];

    for (const side of data.sides) {
      for (const c of side.countries) {
        if (!c.flagUrl) continue;
        totalChecked++;
        const filename = filenameFromUrl(c.flagUrl);
        if (!filename) continue;

        const canonical = specialFilePath(filename);
        const status = await follows(canonical);

        if (status >= 200 && status < 400) {
          if (c.flagUrl !== canonical) {
            c.flagUrl = canonical;
            totalRewritten++;
            mutated = true;
          }
        } else {
          // Even Special:FilePath failed — the filename itself is wrong.
          totalBroken++;
          broken.push(`${c.name} [${status}] ${filename}`);
          delete c.flagUrl;
          c.flagFallback = "coat";
          mutated = true;
        }
      }
    }

    if (mutated) {
      writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
      console.log(
        `✎ ${f} — ${broken.length} broken → coat fallback, rest rewritten`
      );
    } else {
      console.log(`✓ ${f} — all flags ok (already canonical)`);
    }

    if (broken.length) {
      reports.push(`=== ${f} ===`);
      reports.push(...broken.map((b) => "  " + b));
    }
  }

  console.log(
    `\nTotal URLs checked: ${totalChecked}, rewritten: ${totalRewritten}, broken: ${totalBroken}\n`
  );
  for (const line of reports) console.log(line);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
