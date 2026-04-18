# War Map Noir Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a cinematic black-and-white "turning-point wars" experience at `/maps/wars` — 10 curated wars, numbered markers, bottom-sheet event drawer with prev/next pagination, period flags, rich stats.

**Architecture:** Two Claude subagents run in sequence → parallel: (1) history agent proposes + writes 10 wars of rich JSON, (2) design agent produces `components/wars-noir/` and a dev-only mockup route. Developer then migrates the `lib/wars-types.ts` schema (adds Zod), splits the 561-line `WarMapClient` into 8 focused files, wires the bottom sheet + keyboard nav, re-skins the selection page.

**Tech Stack:** Next.js 15 (App Router, RSC), React 19, `react-globe.gl`, Three.js, Tailwind 3, TypeScript 5.6, Zod (new), Fraunces/Inter/JetBrains Mono fonts (already loaded via `app/layout.tsx`).

**Spec:** `docs/superpowers/specs/2026-04-18-war-map-noir-upgrade-design.md`

---

## File Structure

### Create

```
components/wars-noir/KindIcon.tsx              # 9 stroke SVG icons for event kinds
components/wars-noir/NumberedMarker.tsx        # numbered medallion + kind icon + gold ring
components/wars-noir/FlagStrip.tsx             # grayscale flag strip with hover color reveal
components/wars-noir/BottomSheet.tsx           # generic alt-açılan sheet (primitive)
components/wars-noir/WarCard.tsx               # selection page tile
components/wars-noir/theme.ts                  # token helpers (cn, getKindColor...)
lib/wars-noir-theme.css                        # CSS variables (scoped to [data-map="wars"])

app/maps/wars/_mockup/page.tsx                 # dev-only mockup route
app/maps/wars/[slug]/WarGlobe.tsx              # globe + markers + camera controls
app/maps/wars/[slug]/WarTimelineStrip.tsx      # mobile horizontal timeline chips
app/maps/wars/[slug]/WarTimelineSidebar.tsx    # desktop left vertical timeline
app/maps/wars/[slug]/WarSidesHero.tsx          # top banner: sides + flags + stats + opening
app/maps/wars/[slug]/WarBottomSheet.tsx        # orchestrator — wraps BottomSheet primitive
app/maps/wars/[slug]/EventHero.tsx             # sheet header: date, title, sides
app/maps/wars/[slug]/EventStats.tsx            # forces/casualties/commanders table
app/maps/wars/[slug]/EventStory.tsx            # serif drop-cap body
app/maps/wars/[slug]/EventPhoto.tsx            # B&W ken-burns Wikipedia image
app/maps/wars/[slug]/EventNav.tsx              # prev/next buttons

public/data/wars/<slug>.json                   # 10 war JSON files (history agent)
public/data/wars/index.json                    # updated index (history agent)

docs/superpowers/specs/10-wars-shortlist.md    # history agent Phase 0.1 output

scripts/validate-wars.ts                       # CLI — parses all JSON through Zod, exits non-zero on failure
```

### Modify

```
lib/wars-types.ts                              # new schema (War, WarSide, WarEvent) + Zod
lib/wars.ts                                    # loader validates against Zod at runtime
app/maps/wars/[slug]/WarMapClient.tsx          # slim orchestrator (~150 lines)
app/maps/wars/WarsIndexClient.tsx              # noir skin + WarCard
package.json                                   # add zod; add "validate:wars" script
tailwind.config.ts                             # no change (tokens live in CSS)
app/globals.css                                # add @import for wars-noir-theme.css
```

### Delete

None. (Existing `public/data/wars/*.json` get overwritten in place by history agent.)

---

## Verification gates (no test framework in repo)

This repo has no Jest/Vitest/Playwright. Verification for each coding task is one or more of:

- **Type-check:** `npx tsc --noEmit` — must exit 0
- **Lint:** `npm run lint` — must exit 0
- **Build:** `npm run build` — must exit 0
- **Schema validate:** `npx tsx scripts/validate-wars.ts` — must exit 0 (added in Task 5)
- **Manual smoke:** `npm run dev`, open the stated URL, check visible criteria
- **Lighthouse:** DevTools → Lighthouse → Performance ≥ 95, A11y ≥ 95 (Task 22)

Each task lists its exact verification commands and expected output.

---

## Pre-flight (once, before Task 1)

- [ ] **P1: Confirm git clean state**

```bash
cd /Users/evren/Desktop/claude-apps/maps
git status
```

Expected: `nothing to commit, working tree clean` or at most the design spec you just committed.

- [ ] **P2: Create feature branch**

```bash
git checkout -b wars-noir-upgrade
```

Expected: `Switched to a new branch 'wars-noir-upgrade'`.

- [ ] **P3: Install dev dependencies we will need**

```bash
cd /Users/evren/Desktop/claude-apps/maps
npm install --save zod
npm install --save-dev tsx
```

Expected: `zod` appears under `dependencies`, `tsx` under `devDependencies` in `package.json`.

- [ ] **P4: Verify build still passes on untouched code**

```bash
npm run build
```

Expected: `✓ Compiled successfully` (or similar) and non-zero number of routes listed.

- [ ] **P5: Commit baseline**

```bash
git add package.json package-lock.json
git commit -m "wars: add zod + tsx for upcoming war-map upgrade"
```

---

## Task 1 — History Agent Phase 0.1: Produce 10-war shortlist

**Files:**
- Create: `docs/superpowers/specs/10-wars-shortlist.md` (by agent)

- [ ] **Step 1: Dispatch history subagent**

Use the `Agent` tool (general-purpose) with the following prompt (verbatim):

> You are a military historian. Your task is to propose 10 "turning-point wars" for a documentary-style interactive map at /maps/wars. A turning-point war is one that redrew maps, ended empires, toppled regimes, or changed global order.
>
> Criteria:
> - Cover diverse eras: at least one from each of {ancient, medieval, early-modern, 19th-century, 20th-century, 21st-century}.
> - Cover diverse regions: at least one from each of {Europe, Middle East, Asia, Americas, global} where possible.
> - Prefer wars with ≥20 notable events (battles/treaties/sieges/landings) that can be geocoded.
> - Include these existing 6 in the candidate pool; keep them if they qualify, drop any that don't: Turkish War of Independence, World War I, World War II, American Civil War, Napoleonic Wars, Russo-Ukrainian War.
>
> Output a markdown file at `docs/superpowers/specs/10-wars-shortlist.md` with this exact structure:
>
> ```markdown
> # 10 Turning-Point Wars — Shortlist
>
> ## 1. <Name> (<startYear>–<endYear>)
> - **slug:** <kebab-case-slug>
> - **era:** <era>
> - **region:** <region>
> - **why turning point:** <1-2 sentences, factual>
> - **expected event count:** <integer, ≥20>
>
> ## 2. ...
> ```
>
> After the 10 entries, add a short "## Balance notes" section explaining how the 10 cover era/region diversity.
>
> Do NOT write any war JSON yet. Only the shortlist markdown. Keep the file under 400 lines.

- [ ] **Step 2: Read the shortlist output**

```bash
cat /Users/evren/Desktop/claude-apps/maps/docs/superpowers/specs/10-wars-shortlist.md
```

Expected: 10 numbered entries, each with slug/era/region/why/count, plus balance notes.

- [ ] **Step 3: Commit the shortlist**

```bash
git add docs/superpowers/specs/10-wars-shortlist.md
git commit -m "wars: add 10 turning-point wars shortlist (history agent output)"
```

---

## Task 2 — Gate: user approves shortlist

- [ ] **Step 1: Present the shortlist to the user**

Print the contents of `10-wars-shortlist.md` to the chat and say:

> "History agent proposed these 10 wars. Onay verirsen tam veri üretimine geçiyorum. Değişiklik istiyorsan hangisi çıksın/girsin söyle."

- [ ] **Step 2: Wait for user approval or edits**

Do not proceed until user says go (or edits the list). If user edits, update the shortlist file accordingly and re-commit.

---

## Task 3 — History Agent Phase 0.2 (parallel with Task 4): Produce 10 war JSON files

**Files:**
- Overwrite: `public/data/wars/turkish-independence.json` and 5 others, plus 4 new slugs
- Overwrite: `public/data/wars/index.json`

- [ ] **Step 1: Dispatch history subagent with full-data brief (run_in_background=true)**

Use `Agent` tool (general-purpose, `run_in_background: true`) with this prompt:

> You are a military historian writing data for a cinematic map. The approved shortlist is in `docs/superpowers/specs/10-wars-shortlist.md`. Read it.
>
> For each of the 10 wars, produce one file at `public/data/wars/<slug>.json` conforming to this TypeScript schema (will be Zod-validated):
>
> ```ts
> type War = {
>   slug: string;
>   name: string; nameTr?: string;
>   startYear: number; endYear: number;
>   era: "ancient"|"medieval"|"early-modern"|"19th-century"|"20th-century"|"21st-century";
>   region: "europe"|"middle-east"|"asia"|"africa"|"americas"|"global";
>   tags?: string[];
>   blurb: string; blurbTr?: string;  // ≤300 chars
>   sides: Array<{
>     id: "A"|"B"|"C";
>     label: string; labelTr: string;
>     countries: Array<{
>       name: string; nameTr: string;
>       flagUrl?: string;        // Wikimedia Commons URL (period-accurate)
>       flagFallback?: "coat"|"emblem";
>     }>;
>     commanders: string[];      // 1–4 names
>     result: "victor"|"defeated"|"withdrew"|"dissolved";
>   }>;
>   casualties: {
>     militaryDead: number;
>     civilianDead?: number;
>     wounded?: number;
>     pow?: number;
>     source: string;            // cite origin of figures
>   };
>   participantCount?: number;
>   opening: string; openingTr: string;               // 2–3 dramatic sentences
>   outcome: string; outcomeTr: string;               // 1 paragraph
>   turningPointReason: string; turningPointReasonTr: string;  // 1 paragraph
>   events: Array<{
>     id: string;
>     name: string; nameTr?: string;
>     lat: number; lng: number;
>     date: string;              // YYYY, YYYY-MM, or YYYY-MM-DD
>     dateEnd?: string;
>     kind: "battle"|"siege"|"congress"|"treaty"|"occupation"|"liberation"|"armistice"|"landing"|"event";
>     side: "victory-a"|"victory-b"|"draw"|"political"|"occupation"|"armistice"|"treaty";
>     order: number;             // 1-based, chronological
>     summary: string; summaryTr?: string;            // ≤180 chars
>     story: string; storyTr: string;                 // 200–400 words, cinematic tone
>     forces?:     { sideA: number; sideB: number };
>     casualties?: { sideA: number; sideB: number };
>     commanders?: { sideA: string[]; sideB: string[] };
>     wikipediaEn?: string; wikipediaTr?: string;
>     imageCredit?: string;
>   }>;
> };
> ```
>
> Rules:
> - ≥20 events per war (≥30 for WWI, WWII).
> - Every `flagUrl` must be a Wikimedia Commons URL you have verified in your research context (prefer `upload.wikimedia.org/wikipedia/commons/...`). Use period-accurate flags (e.g., 1861 CSA flag, 1919 Ottoman, 1943 Nazi Germany). If no period flag is verifiable, set `flagFallback: "coat"` and omit `flagUrl`.
> - `casualties.source` must cite an origin ("Britannica", "Clodfelter 2017", "Wikipedia consensus 2024", etc.).
> - Story: 200–400 words, cinematic documentary tone, no embellishment beyond consensus history.
> - Bilingual: all `*Tr` fields in Turkish, all non-Tr fields in English.
> - `order` is 1-based and matches chronological order of `date`.
>
> Also overwrite `public/data/wars/index.json`. It contains `{ "wars": [ { slug, name, nameTr, startYear, endYear, eventCount, blurb, blurbTr, era, region, tags, sideAFlagUrl, sideBFlagUrl, militaryDead } ] }` for all 10 wars. `sideAFlagUrl` / `sideBFlagUrl` are the first-country flag URLs from `sides[0]` / `sides[1]`; `militaryDead` mirrors `casualties.militaryDead`. These three extra fields power the selection-page `WarCard`. Do not include full events array — just summary fields.
>
> Return a summary: the 10 slugs produced, any wars where flag URLs could not be verified, any wars where casualty figures are contested (so I can note them).

- [ ] **Step 2: While Task 3 runs, proceed to Task 4 (design agent dispatch)**

The history agent produces data; the design agent produces components. They are independent. Do not wait.

- [ ] **Step 3 (later, when history agent reports done): Spot-check 2 files**

```bash
cat /Users/evren/Desktop/claude-apps/maps/public/data/wars/turkish-independence.json | head -80
cat /Users/evren/Desktop/claude-apps/maps/public/data/wars/world-war-2.json | head -80
```

Expected: valid JSON starting with `{"slug":"..."}`, populated `sides`, `casualties`, `events` arrays.

- [ ] **Step 4: Commit data**

```bash
git add public/data/wars/
git commit -m "wars: 10 turning-point wars JSON (history agent output)"
```

---

## Task 4 — Design Agent (parallel with Task 3): Noir components + mockup

**Files:**
- Create: `lib/wars-noir-theme.css`
- Create: `components/wars-noir/{KindIcon,NumberedMarker,FlagStrip,BottomSheet,WarCard,theme}.{tsx,ts}`
- Create: `app/maps/wars/_mockup/page.tsx`
- Modify: `app/globals.css` (import wars-noir-theme.css)

- [ ] **Step 1: Dispatch design subagent (run_in_background=true)**

Use `Agent` tool (general-purpose, `run_in_background: true`) with this prompt:

> You are a frontend designer producing a cinematic black-and-white design system for a war map documentary UI. The full spec is in `docs/superpowers/specs/2026-04-18-war-map-noir-upgrade-design.md` (§4 Design System, §5 Component architecture). Read §4 and §5 in full before writing code.
>
> Your deliverables (exact file paths):
>
> 1. `lib/wars-noir-theme.css` — all CSS variables from spec §4.1, scoped to `[data-map="wars"] { ... }` so other maps are not affected.
>
> 2. `components/wars-noir/KindIcon.tsx` — default export a React component `<KindIcon kind={WarEventKind} size={number} />`. Render stroke-only SVG for the 9 kinds listed in spec §4.3. `stroke="currentColor"`, `strokeWidth={1.2}`, `fill="none"`. No external icon library.
>
> 3. `components/wars-noir/NumberedMarker.tsx` — `<NumberedMarker order={number} kind={WarEventKind} active={boolean} casualtyScale={number} />`. Renders the medallion from §4.4: gold mono number on dark circle, hairline connector, small `<KindIcon>` below. Size interpolated from `casualtyScale` (0..1) between 32 px and 56 px. Active state gets a pulsing gold ring (CSS keyframes).
>
> 4. `components/wars-noir/FlagStrip.tsx` — `<FlagStrip side={WarSide} align="left"|"right" />`. Renders grayscale flag(s) + country name(s) + commander list. CSS per spec §4.5. On hover of the flag group, flags fade to full color over 300 ms. If `flagFallback === "coat"`, render a gold stroke SVG coat with country monogram (first 2 letters uppercase) instead.
>
> 5. `components/wars-noir/BottomSheet.tsx` — `<BottomSheet open={boolean} onClose={()=>void} heightVh={number} children={ReactNode} />`. Generic primitive. Slide-up animation 280 ms ease-out spring-ish (`cubic-bezier(0.22, 1, 0.36, 1)` is fine). Drag handle at top (44 px hit zone). `ESC` key closes it (internally via effect). Swipe-down on mobile triggers `onClose`. Height defaults to 45 vh desktop / 72 vh mobile; accept override.
>
> 6. `components/wars-noir/WarCard.tsx` — `<WarCard war={WarIndexEntry} />`. Selection-page tile per spec §6: grayscale side-A vs side-B flags (if available in the index), `§ YEAR–YEAR · N EVENTS` mono meta line, Fraunces italic title, gold military-dead count ("~40 MILLION DEAD" style), `OPEN MAP →` CTA. Use `next/link` to `/maps/wars/<slug>`.
>
> 7. `components/wars-noir/theme.ts` — helper export `wn(...classNames)` that concatenates class names (simple tailwind-merge substitute; use `clsx` pattern by hand).
>
> 8. `app/globals.css` — add `@import "../lib/wars-noir-theme.css";` at the top (after the existing tailwind directives).
>
> 9. `app/maps/wars/_mockup/page.tsx` — a dev-only Next.js page at `/maps/wars/_mockup`. Mark it `export const dynamic = "force-static"` and add this to the bottom: `export const metadata = { robots: "noindex, nofollow" }`. Render the five wars-noir components side-by-side with hand-written mock data (create a constant `MOCK_WAR` matching the schema). Show: one `<NumberedMarker>` set of 3, one `<FlagStrip>` pair, one `<BottomSheet open>` containing placeholder children, one `<WarCard>`. Wrap the whole page in `<div data-map="wars" class="min-h-screen">` so the CSS variables apply. Make it look presentable — this is the surface the user will review.
>
> Rules:
> - No new npm dependencies (no framer-motion, no headlessui, no radix). Raw React + CSS only.
> - Use the `WarEventKind` / `WarSide` / `War` types from `lib/wars-types.ts` — but those types are being migrated in Task 5. For now, inline minimal local types in the component files that reference only fields you need; the developer will collapse them into the shared types in Task 7.
> - Every component accepts and forwards `className`.
> - No inline hex colors — use CSS variables via `var(--war-gold)` etc. Exception: SVG stroke may use `currentColor`.
> - `npm run build` must exit 0 after your changes. Run it yourself before reporting done.
>
> Return a summary: file paths created, any decisions where you deviated from the spec (with reason).

- [ ] **Step 2: Wait for both Task 3 (history) and Task 4 (design) to report done**

Both agents are background. Monitor via notifications. Do not proceed to Task 5 until both complete.

- [ ] **Step 3: Open the mockup and smoke-test**

```bash
cd /Users/evren/Desktop/claude-apps/maps
npm run dev
```

Open `http://localhost:3000/maps/wars/_mockup`. Verify:
- Page loads without 500.
- Noir dark background, gold numbers visible.
- Flag strip shows grayscale flags; hover reveals color.
- `NumberedMarker` shows gold medallion with number and kind icon.
- `BottomSheet` slides up on the page.
- `WarCard` renders with grayscale flags, gold dead count.

Stop dev server after inspection (`Ctrl+C`).

- [ ] **Step 4: Commit design components**

```bash
git add lib/wars-noir-theme.css components/wars-noir/ app/maps/wars/_mockup/ app/globals.css
git commit -m "wars: noir design system — components + dev mockup route"
```

---

## Task 5 — Migrate `lib/wars-types.ts` to new schema + Zod

**Files:**
- Modify: `lib/wars-types.ts`
- Create: `scripts/validate-wars.ts`
- Modify: `package.json` (add `"validate:wars"` script)

- [ ] **Step 1: Overwrite `lib/wars-types.ts` with the new schema**

Replace the entire file contents with:

```ts
import { z } from "zod";

// Zod schemas (runtime source of truth)

export const WarEventKind = z.enum([
  "battle", "siege", "congress", "treaty", "occupation",
  "liberation", "armistice", "landing", "event",
]);
export type WarEventKind = z.infer<typeof WarEventKind>;

export const WarEventSide = z.enum([
  "victory-a", "victory-b", "draw", "political",
  "occupation", "armistice", "treaty",
]);
export type WarEventSide = z.infer<typeof WarEventSide>;

export const WarEra = z.enum([
  "ancient", "medieval", "early-modern",
  "19th-century", "20th-century", "21st-century",
]);
export type WarEra = z.infer<typeof WarEra>;

export const WarRegion = z.enum([
  "europe", "middle-east", "asia", "africa", "americas", "global",
]);
export type WarRegion = z.infer<typeof WarRegion>;

export const WarSide = z.object({
  id: z.enum(["A", "B", "C"]),
  label: z.string().min(1),
  labelTr: z.string().min(1),
  countries: z.array(z.object({
    name: z.string().min(1),
    nameTr: z.string().min(1),
    flagUrl: z.string().url().optional(),
    flagFallback: z.enum(["coat", "emblem"]).optional(),
  })).min(1),
  commanders: z.array(z.string()).min(1).max(6),
  result: z.enum(["victor", "defeated", "withdrew", "dissolved"]),
});
export type WarSide = z.infer<typeof WarSide>;

export const WarEvent = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  nameTr: z.string().optional(),
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
  date: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/),
  dateEnd: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/).optional(),
  kind: WarEventKind,
  side: WarEventSide,
  order: z.number().int().positive(),
  summary: z.string().min(1).max(240),
  summaryTr: z.string().max(240).optional(),
  story: z.string().min(100),
  storyTr: z.string().min(100),
  forces: z.object({ sideA: z.number(), sideB: z.number() }).optional(),
  casualties: z.object({ sideA: z.number(), sideB: z.number() }).optional(),
  commanders: z.object({
    sideA: z.array(z.string()),
    sideB: z.array(z.string()),
  }).optional(),
  wikipediaEn: z.string().url().optional(),
  wikipediaTr: z.string().url().optional(),
  imageCredit: z.string().optional(),
});
export type WarEvent = z.infer<typeof WarEvent>;

export const War = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  nameTr: z.string().optional(),
  startYear: z.number().int(),
  endYear: z.number().int(),
  era: WarEra,
  region: WarRegion,
  tags: z.array(z.string()).optional(),
  blurb: z.string().min(1).max(320),
  blurbTr: z.string().max(320).optional(),
  sides: z.array(WarSide).min(2).max(3),
  casualties: z.object({
    militaryDead: z.number().int().nonnegative(),
    civilianDead: z.number().int().nonnegative().optional(),
    wounded: z.number().int().nonnegative().optional(),
    pow: z.number().int().nonnegative().optional(),
    source: z.string().min(1),
  }),
  participantCount: z.number().int().nonnegative().optional(),
  opening: z.string().min(10),
  openingTr: z.string().min(10),
  outcome: z.string().min(40),
  outcomeTr: z.string().min(40),
  turningPointReason: z.string().min(40),
  turningPointReasonTr: z.string().min(40),
  events: z.array(WarEvent).min(1),
});
export type War = z.infer<typeof War>;

export const WarIndexEntry = z.object({
  slug: z.string(),
  name: z.string(),
  nameTr: z.string().optional(),
  startYear: z.number().int(),
  endYear: z.number().int(),
  eventCount: z.number().int().nonnegative(),
  blurb: z.string(),
  blurbTr: z.string().optional(),
  era: WarEra.optional(),
  region: WarRegion.optional(),
  tags: z.array(z.string()).optional(),
  // Mirror side-A / side-B flags for selection-page WarCard
  sideAFlagUrl: z.string().url().optional(),
  sideBFlagUrl: z.string().url().optional(),
  militaryDead: z.number().int().nonnegative().optional(),
});
export type WarIndexEntry = z.infer<typeof WarIndexEntry>;

export const WarIndex = z.object({
  wars: z.array(WarIndexEntry),
});
export type WarIndex = z.infer<typeof WarIndex>;

// Label maps (UI-facing)

export const ERA_LABEL: Record<WarEra, { tr: string; en: string }> = {
  "ancient":       { tr: "Antik",           en: "Ancient" },
  "medieval":      { tr: "Orta Çağ",        en: "Medieval" },
  "early-modern":  { tr: "Erken Modern",    en: "Early Modern" },
  "19th-century":  { tr: "19. Yüzyıl",      en: "19th Century" },
  "20th-century":  { tr: "20. Yüzyıl",      en: "20th Century" },
  "21st-century":  { tr: "21. Yüzyıl",      en: "21st Century" },
};

export const REGION_LABEL: Record<WarRegion, { tr: string; en: string }> = {
  "europe":       { tr: "Avrupa",       en: "Europe" },
  "middle-east":  { tr: "Orta Doğu",    en: "Middle East" },
  "asia":         { tr: "Asya",         en: "Asia" },
  "africa":       { tr: "Afrika",       en: "Africa" },
  "americas":     { tr: "Amerika",      en: "Americas" },
  "global":       { tr: "Küresel",      en: "Global" },
};

// Kind metadata — labels only; colors/icons now live in wars-noir components
export const KIND_LABEL: Record<WarEventKind, { tr: string; en: string }> = {
  battle:     { tr: "Muharebe",    en: "Battle" },
  siege:      { tr: "Kuşatma",     en: "Siege" },
  congress:   { tr: "Kongre",      en: "Congress" },
  treaty:     { tr: "Antlaşma",    en: "Treaty" },
  occupation: { tr: "İşgal",       en: "Occupation" },
  liberation: { tr: "Kurtuluş",    en: "Liberation" },
  armistice:  { tr: "Mütareke",    en: "Armistice" },
  landing:    { tr: "Çıkarma",     en: "Landing" },
  event:      { tr: "Olay",        en: "Event" },
};

export const SIDE_LABEL: Record<WarEventSide, { tr: string; en: string }> = {
  "victory-a":  { tr: "Zafer",        en: "Victory" },
  "victory-b":  { tr: "Yenilgi",      en: "Defeat" },
  "draw":       { tr: "Kararsız",     en: "Indecisive" },
  "political":  { tr: "Siyasi",       en: "Political" },
  "occupation": { tr: "İşgal",        en: "Occupation" },
  "armistice":  { tr: "Mütareke",     en: "Armistice" },
  "treaty":     { tr: "Antlaşma",     en: "Treaty" },
};

export function kindLabel(k: WarEventKind, locale: "tr" | "en"): string {
  return KIND_LABEL[k][locale];
}

export function sideLabel(s: WarEventSide, locale: "tr" | "en"): string {
  return SIDE_LABEL[s][locale];
}

// Fuzzy date helpers (preserved from old file)
export function parseFuzzyDate(d: string): { year: number; month: number; day: number; t: number } {
  const m = d.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (!m) return { year: 0, month: 0, day: 0, t: 0 };
  const y = parseInt(m[1], 10);
  const mo = m[2] ? parseInt(m[2], 10) : 1;
  const da = m[3] ? parseInt(m[3], 10) : 1;
  return { year: y, month: mo, day: da, t: y * 10000 + mo * 100 + da };
}

export function formatFuzzyDate(d: string): string {
  const m = d.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (!m) return d;
  const y = m[1];
  const mo = m[2];
  const da = m[3];
  if (!mo) return y;
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mon = months[parseInt(mo, 10)] || mo;
  if (!da) return `${mon} ${y}`;
  return `${parseInt(da, 10)} ${mon} ${y}`;
}
```

- [ ] **Step 2: Create `scripts/validate-wars.ts`**

```ts
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
  errors.push(`index.json: ${e.message || e}`);
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
```

- [ ] **Step 3: Add script to `package.json`**

Open `package.json` and add this line inside `"scripts"`:

```json
"validate:wars": "tsx scripts/validate-wars.ts"
```

- [ ] **Step 4: Run the validator**

```bash
cd /Users/evren/Desktop/claude-apps/maps
npm run validate:wars
```

Expected: `✓ All 11 files valid.` (10 wars + index.json). If errors, the history agent's output did not conform — report them and re-dispatch the agent to fix.

- [ ] **Step 5: Run typecheck and build**

```bash
npx tsc --noEmit
npm run build
```

Expected: both exit 0. Note: `lib/wars.ts` still imports old names — that's fixed in Task 6.

If build fails due to missing exports in `lib/wars-types.ts`, those callers will be updated in Task 6. For now, confirm the failure message is only about that file.

- [ ] **Step 6: Commit**

```bash
git add lib/wars-types.ts scripts/validate-wars.ts package.json package-lock.json
git commit -m "wars: migrate types to Zod schema + validator script"
```

---

## Task 6 — Update `lib/wars.ts` loader to validate at runtime

**Files:**
- Modify: `lib/wars.ts`

- [ ] **Step 1: Overwrite `lib/wars.ts`**

Replace the entire file with:

```ts
import fs from "node:fs";
import path from "node:path";
import { War, WarIndex, type War as WarT, type WarIndexEntry } from "./wars-types";

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
```

- [ ] **Step 2: Typecheck and build**

```bash
npx tsc --noEmit
npm run build
```

Expected: both exit 0. If failures remain, they are in consumer components (`WarMapClient.tsx`, `WarsIndexClient.tsx`) that reference removed constants — list them; they get fixed in Task 7.

- [ ] **Step 3: Commit**

```bash
git add lib/wars.ts
git commit -m "wars: loader uses Zod runtime validation"
```

---

## Task 7 — Repoint existing `WarMapClient.tsx` and `WarsIndexClient.tsx` to new types (temporary shim)

Goal: keep the current UI working with the new schema before we split/redesign. This is a stopgap so the app builds.

**Files:**
- Modify: `app/maps/wars/[slug]/WarMapClient.tsx`
- Modify: `app/maps/wars/WarsIndexClient.tsx`

- [ ] **Step 1: Fix `WarMapClient.tsx` imports**

In `app/maps/wars/[slug]/WarMapClient.tsx`, the existing file imports `KIND_META` and `SIDE_META` from `@/lib/wars-types`. Those were removed. Replace the import block at the top with:

```ts
import {
  kindLabel,
  sideLabel,
  KIND_LABEL,
  type War,
  type WarEvent,
  formatFuzzyDate,
  parseFuzzyDate,
} from "@/lib/wars-types";
```

Then, everywhere the file references `KIND_META[e.kind].icon`, `.color`, etc., replace with temporary literal fallbacks so the build passes:

At the top of the component (inside the function body), add:

```ts
const KIND_FALLBACK: Record<string, { icon: string; color: string }> = {
  battle:     { icon: "⚔", color: "#dc2626" },
  siege:      { icon: "🏰", color: "#f97316" },
  congress:   { icon: "🏛", color: "#f59e0b" },
  treaty:     { icon: "🕊", color: "#06b6d4" },
  occupation: { icon: "🚩", color: "#a855f7" },
  liberation: { icon: "✨", color: "#22c55e" },
  armistice:  { icon: "✋", color: "#94a3b8" },
  landing:    { icon: "⚓", color: "#ec4899" },
  event:      { icon: "⭐", color: "#eab308" },
};
const SIDE_FALLBACK: Record<string, { color: string }> = {
  "victory-a":  { color: "#22c55e" },
  "victory-b":  { color: "#ef4444" },
  "draw":       { color: "#94a3b8" },
  "political":  { color: "#f59e0b" },
  "occupation": { color: "#a855f7" },
  "armistice":  { color: "#06b6d4" },
  "treaty":     { color: "#0ea5e9" },
};
```

Find-and-replace in that file:
- `KIND_META[` → `KIND_FALLBACK[`
- `SIDE_META[` → `SIDE_FALLBACK[`

Every reference to `KIND_FALLBACK[k].labelEn`/`.labelTr` → replace with `kindLabel(k, locale)`. Every reference to `SIDE_FALLBACK[s].labelEn`/`.labelTr` → replace with `sideLabel(s, locale)`.

- [ ] **Step 2: Fix `WarsIndexClient.tsx`**

`app/maps/wars/WarsIndexClient.tsx` already imports `ERA_LABEL`, `REGION_LABEL` and types — those are preserved in the new `wars-types.ts`. No change likely needed. Run typecheck to confirm.

- [ ] **Step 3: Typecheck + lint + build**

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Expected: all three exit 0.

- [ ] **Step 4: Smoke test**

```bash
npm run dev
```

Open `http://localhost:3000/maps/wars/turkish-independence`. Confirm: globe renders, markers (still emoji) render, timeline sidebar works. Nothing should be visually broken despite the schema migration. Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add app/maps/wars/
git commit -m "wars: shim existing WarMapClient to new types (pre-split)"
```

---

## Task 8 — Extract `WarGlobe.tsx`

**Files:**
- Create: `app/maps/wars/[slug]/WarGlobe.tsx`
- Modify: `app/maps/wars/[slug]/WarMapClient.tsx` (delegate globe to new file)

- [ ] **Step 1: Create `WarGlobe.tsx`**

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import NumberedMarker from "@/components/wars-noir/NumberedMarker";
import type { War, WarEvent } from "@/lib/wars-types";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const COUNTRIES_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

type Props = {
  events: WarEvent[];
  activeId: string | null;
  onSelect: (e: WarEvent) => void;
  width: number;
  height: number;
  /** multiplier for each event: cas[e.id] in 0..1 for size scale */
  casualtyScale: Record<string, number>;
};

export default function WarGlobe({
  events,
  activeId,
  onSelect,
  width,
  height,
  casualtyScale,
}: Props) {
  const globeRef = useRef<any>(null);
  const countriesRef = useRef<any[]>([]);

  useEffect(() => {
    fetch(COUNTRIES_URL)
      .then((r) => r.json())
      .then((d) => {
        countriesRef.current = d.features || [];
      })
      .catch(() => {});
  }, []);

  // Marker 1 focus on mount
  useEffect(() => {
    if (!globeRef.current || events.length === 0) return;
    const first = [...events].sort((a, b) => a.order - b.order)[0];
    globeRef.current.pointOfView(
      { lat: first.lat, lng: first.lng, altitude: 1.4 },
      1200
    );
  }, [events]);

  // Camera limits
  useEffect(() => {
    if (!globeRef.current) return;
    const c = globeRef.current.controls?.();
    if (c) {
      c.enableZoom = true;
      c.zoomSpeed = 1.2;
      c.minDistance = 160;
      c.maxDistance = 900;
      c.enableDamping = true;
    }
  }, [width]);

  // Fly to active event
  useEffect(() => {
    if (!activeId || !globeRef.current) return;
    const e = events.find((x) => x.id === activeId);
    if (!e) return;
    const current = globeRef.current.pointOfView();
    const alt = current && current.altitude < 1.2 ? current.altitude : 1.2;
    globeRef.current.pointOfView({ lat: e.lat, lng: e.lng, altitude: alt }, 800);
  }, [activeId, events]);

  const htmlElement = (d: any) => {
    const e: WarEvent = d._e;
    const el = document.createElement("div");
    el.style.transform = "translate(-50%, -50%)";
    el.style.pointerEvents = "auto";
    el.style.cursor = "pointer";
    el.addEventListener("click", () => onSelect(e));
    // Server-rendered marker HTML — avoid React mounts inside htmlElementsData
    // for performance; we hand-render markup that matches NumberedMarker's CSS.
    const active = activeId === e.id;
    const scale = 32 + (casualtyScale[e.id] || 0) * 24; // 32..56
    el.innerHTML = `
      <div style="position:relative;width:${scale}px;height:${scale}px;">
        ${active ? `<div class="war-marker-pulse"></div>` : ""}
        <div class="war-marker-medallion" style="width:${scale}px;height:${scale}px;">
          <span class="war-marker-num">${e.order}</span>
        </div>
      </div>
    `;
    return el;
  };

  const markers = events.map((e) => ({
    lat: e.lat,
    lng: e.lng,
    alt: 0.01,
    _e: e,
  }));

  return (
    <Globe
      ref={globeRef}
      width={width}
      height={height}
      backgroundColor="#0a0a0a"
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      atmosphereColor="#c9a961"
      atmosphereAltitude={0.18}
      polygonsData={countriesRef.current}
      polygonCapColor={() => "rgba(232,227,214,0.04)"}
      polygonSideColor={() => "rgba(0,0,0,0.4)"}
      polygonStrokeColor={() => "rgba(232,227,214,0.35)"}
      polygonAltitude={0.006}
      htmlElementsData={markers}
      htmlLat="lat"
      htmlLng="lng"
      htmlAltitude="alt"
      htmlElement={htmlElement}
      arcsData={[]}
    />
  );
}
```

Note: this renders markers via imperative DOM (not `<NumberedMarker>` React component) for globe-integration performance. The visual CSS classes `.war-marker-medallion`, `.war-marker-num`, `.war-marker-pulse` must be defined in `lib/wars-noir-theme.css` by the design agent (they may already be there). If not, add them now:

```css
[data-map="wars"] .war-marker-medallion {
  border-radius: 9999px;
  background: var(--war-ink-2);
  border: 2px solid var(--war-gold-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.55);
}
[data-map="wars"] .war-marker-num {
  font-family: var(--font-mono, monospace);
  color: var(--war-gold);
  font-size: 12px;
  letter-spacing: 0.05em;
}
[data-map="wars"] .war-marker-pulse {
  position: absolute;
  inset: -6px;
  border-radius: 9999px;
  border: 2px solid var(--war-gold);
  animation: warPulse 1.6s ease-out infinite;
}
@keyframes warPulse {
  0%   { transform: scale(0.8); opacity: 0.9; }
  100% { transform: scale(1.8); opacity: 0; }
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 3: Commit (leave WarMapClient still using inline globe — we swap in Task 12)**

```bash
git add app/maps/wars/[slug]/WarGlobe.tsx lib/wars-noir-theme.css
git commit -m "wars: extract WarGlobe component (not yet wired)"
```

---

## Task 9 — Build `WarTimelineSidebar.tsx` (desktop)

**Files:**
- Create: `app/maps/wars/[slug]/WarTimelineSidebar.tsx`

- [ ] **Step 1: Create component**

```tsx
"use client";

import { useLocale } from "@/components/LocaleProvider";
import KindIcon from "@/components/wars-noir/KindIcon";
import {
  formatFuzzyDate,
  kindLabel,
  type WarEvent,
} from "@/lib/wars-types";

type Props = {
  events: WarEvent[];
  activeId: string | null;
  onSelect: (e: WarEvent) => void;
};

export default function WarTimelineSidebar({ events, activeId, onSelect }: Props) {
  const { locale } = useLocale();
  return (
    <aside
      data-map="wars"
      className="hidden md:flex flex-col absolute z-20 top-[70px] left-6 w-[330px] max-h-[calc(100vh-90px)] rounded-2xl border bg-[var(--war-ink-2)]/80 backdrop-blur-md"
      style={{ borderColor: "var(--war-rule)" }}
    >
      <div className="p-4 border-b" style={{ borderColor: "var(--war-rule)" }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em]"
             style={{ color: "var(--war-paper-3)" }}>
          § {events.length} {locale === "tr" ? "olay" : "events"}
        </div>
      </div>
      <ul className="flex-1 overflow-y-auto p-2 space-y-0.5 min-h-0">
        {events.map((e) => {
          const active = activeId === e.id;
          return (
            <li key={e.id}>
              <button
                onClick={() => onSelect(e)}
                className={`w-full text-left flex items-start gap-2.5 px-2 py-2 rounded transition ${
                  active ? "ring-1" : ""
                }`}
                style={{
                  background: active ? "var(--war-ink-3)" : "transparent",
                  // active ring via box-shadow to avoid inline ringColor
                  boxShadow: active ? "inset 0 0 0 1px var(--war-gold)" : "none",
                  color: "var(--war-paper)",
                }}
              >
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-mono flex-shrink-0 mt-0.5"
                  style={{
                    color: active ? "var(--war-gold)" : "var(--war-paper-2)",
                    border: `1px solid ${active ? "var(--war-gold)" : "var(--war-rule)"}`,
                  }}
                  aria-label={`#${e.order}`}
                >
                  {e.order}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] leading-tight">
                    {locale === "tr" && e.nameTr ? e.nameTr : e.name}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] mt-0.5 flex items-center gap-1.5"
                       style={{ color: "var(--war-paper-3)" }}>
                    <KindIcon kind={e.kind} size={11} />
                    {formatFuzzyDate(e.date)} · {kindLabel(e.kind, locale)}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add app/maps/wars/[slug]/WarTimelineSidebar.tsx
git commit -m "wars: add WarTimelineSidebar (desktop)"
```

---

## Task 10 — Build `WarTimelineStrip.tsx` (mobile)

**Files:**
- Create: `app/maps/wars/[slug]/WarTimelineStrip.tsx`

- [ ] **Step 1: Create component**

```tsx
"use client";

import type { WarEvent } from "@/lib/wars-types";

type Props = {
  events: WarEvent[];
  activeId: string | null;
  onSelect: (e: WarEvent) => void;
};

export default function WarTimelineStrip({ events, activeId, onSelect }: Props) {
  return (
    <div
      data-map="wars"
      className="md:hidden absolute top-[62px] left-0 right-0 z-20 overflow-x-auto px-3 py-2 flex gap-2"
      style={{ background: "linear-gradient(to bottom, var(--war-ink) 70%, transparent)" }}
    >
      {events.map((e) => {
        const active = activeId === e.id;
        return (
          <button
            key={e.id}
            onClick={() => onSelect(e)}
            className="flex-shrink-0 w-9 h-9 rounded-full font-mono text-[12px] grid place-items-center"
            style={{
              background: active ? "var(--war-gold)" : "var(--war-ink-2)",
              color: active ? "var(--war-ink)" : "var(--war-paper-2)",
              border: `1px solid ${active ? "var(--war-gold)" : "var(--war-rule)"}`,
            }}
            aria-label={`${e.order}: ${e.name}`}
          >
            {e.order}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add app/maps/wars/[slug]/WarTimelineStrip.tsx
git commit -m "wars: add WarTimelineStrip (mobile)"
```

---

## Task 11 — Build `WarSidesHero.tsx`

**Files:**
- Create: `app/maps/wars/[slug]/WarSidesHero.tsx`

- [ ] **Step 1: Create component**

```tsx
"use client";

import { useLocale } from "@/components/LocaleProvider";
import FlagStrip from "@/components/wars-noir/FlagStrip";
import type { War } from "@/lib/wars-types";

export default function WarSidesHero({ war }: { war: War }) {
  const { locale } = useLocale();
  const [sideA, sideB] = war.sides;
  const name = locale === "tr" && war.nameTr ? war.nameTr : war.name;
  const opening = locale === "tr" ? war.openingTr : war.opening;

  const fmt = (n: number) => new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US").format(n);

  return (
    <section
      data-map="wars"
      className="absolute z-30 top-[58px] left-0 right-0 px-4 md:px-8 pt-4 pb-4"
      style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0.92), rgba(10,10,10,0))" }}
    >
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0 md:max-w-[560px]">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--war-paper-3)" }}>
            § {war.startYear}–{war.endYear} · {war.events.length}{" "}
            {locale === "tr" ? "olay" : "events"}
          </div>
          <h1 className="font-serif font-light italic text-[24px] md:text-[34px] leading-[1.05] mt-1" style={{ color: "var(--war-paper)" }}>
            {name}
          </h1>
          <p className="font-sans text-[13px] leading-relaxed mt-2 md:max-w-[520px]" style={{ color: "var(--war-paper-2)" }}>
            {opening}
          </p>
        </div>

        <div className="flex items-start gap-5">
          {sideA && <FlagStrip side={sideA} align="left" />}
          <div className="font-serif italic text-[22px] pt-1" style={{ color: "var(--war-gold)" }}>
            vs
          </div>
          {sideB && <FlagStrip side={sideB} align="right" />}
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto mt-3 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--war-paper-3)" }}>
        <span>
          <span style={{ color: "var(--war-blood)" }}>{fmt(war.casualties.militaryDead)}</span>{" "}
          {locale === "tr" ? "asker ölü" : "military dead"}
        </span>
        {war.casualties.civilianDead != null && (
          <span>
            <span style={{ color: "var(--war-blood)" }}>{fmt(war.casualties.civilianDead)}</span>{" "}
            {locale === "tr" ? "sivil ölü" : "civilian dead"}
          </span>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add app/maps/wars/[slug]/WarSidesHero.tsx
git commit -m "wars: add WarSidesHero"
```

---

## Task 12 — Build bottom-sheet event drawer + sub-components

**Files:**
- Create: `app/maps/wars/[slug]/EventHero.tsx`
- Create: `app/maps/wars/[slug]/EventStats.tsx`
- Create: `app/maps/wars/[slug]/EventStory.tsx`
- Create: `app/maps/wars/[slug]/EventPhoto.tsx`
- Create: `app/maps/wars/[slug]/EventNav.tsx`
- Create: `app/maps/wars/[slug]/WarBottomSheet.tsx`

- [ ] **Step 1: `EventHero.tsx`**

```tsx
"use client";

import { useLocale } from "@/components/LocaleProvider";
import KindIcon from "@/components/wars-noir/KindIcon";
import {
  formatFuzzyDate,
  kindLabel,
  sideLabel,
  type WarEvent,
} from "@/lib/wars-types";

export default function EventHero({ event }: { event: WarEvent }) {
  const { locale } = useLocale();
  return (
    <header className="flex items-start gap-4 mb-4">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-[14px]"
        style={{
          border: "1px solid var(--war-gold)",
          color: "var(--war-gold)",
          background: "var(--war-ink)",
        }}
      >
        {event.order}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] flex items-center gap-2" style={{ color: "var(--war-paper-3)" }}>
          <KindIcon kind={event.kind} size={12} />
          {formatFuzzyDate(event.date)}
          {event.dateEnd && ` – ${formatFuzzyDate(event.dateEnd)}`}
          <span>· {kindLabel(event.kind, locale)} · {sideLabel(event.side, locale)}</span>
        </div>
        <h2 className="font-serif text-[22px] leading-tight mt-1" style={{ color: "var(--war-paper)" }}>
          {locale === "tr" && event.nameTr ? event.nameTr : event.name}
        </h2>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: `EventStats.tsx`**

```tsx
"use client";

import { Fragment } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { WarEvent } from "@/lib/wars-types";

export default function EventStats({ event }: { event: WarEvent }) {
  const { locale } = useLocale();
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US").format(n);

  if (!event.forces && !event.casualties && !event.commanders) return null;

  const rows = [
    event.forces && {
      label: locale === "tr" ? "Savaşan" : "Forces",
      a: fmt(event.forces.sideA),
      b: fmt(event.forces.sideB),
    },
    event.casualties && {
      label: locale === "tr" ? "Kayıp" : "Casualties",
      a: fmt(event.casualties.sideA),
      b: fmt(event.casualties.sideB),
      blood: true,
    },
    event.commanders && {
      label: locale === "tr" ? "Komutan" : "Commander",
      a: event.commanders.sideA.join(", "),
      b: event.commanders.sideB.join(", "),
    },
  ].filter(Boolean) as Array<{ label: string; a: string; b: string; blood?: boolean }>;

  return (
    <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-1.5 font-mono text-[11px] mb-4 pb-4 border-b" style={{ borderColor: "var(--war-rule)" }}>
      {rows.map((r) => (
        <Fragment key={r.label}>
          <div className="uppercase tracking-[0.2em]" style={{ color: "var(--war-paper-3)" }}>
            {r.label}
          </div>
          <div style={{ color: r.blood ? "var(--war-blood)" : "var(--war-paper)" }}>
            {r.a}
          </div>
          <div style={{ color: r.blood ? "var(--war-blood)" : "var(--war-paper)" }}>
            {r.b}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: `EventStory.tsx`**

```tsx
"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { WarEvent } from "@/lib/wars-types";

export default function EventStory({ event }: { event: WarEvent }) {
  const { locale } = useLocale();
  const text = locale === "tr" ? event.storyTr : event.story;
  if (!text) return null;

  // First letter drop-cap
  const first = text.charAt(0);
  const rest = text.slice(1);

  return (
    <p className="font-sans text-[14px] leading-[1.7]" style={{ color: "var(--war-paper)" }}>
      <span
        className="float-left font-serif italic mr-2 mt-1 leading-[0.85]"
        style={{ fontSize: "44px", color: "var(--war-gold)" }}
      >
        {first}
      </span>
      {rest}
    </p>
  );
}
```

- [ ] **Step 4: `EventPhoto.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import type { WarEvent } from "@/lib/wars-types";

function titleFromUrl(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/\/wiki\/([^?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export default function EventPhoto({ event }: { event: WarEvent }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    const title = titleFromUrl(event.wikipediaEn) || titleFromUrl(event.wikipediaTr);
    if (!title) return;
    const host = event.wikipediaEn ? "en.wikipedia.org" : "tr.wikipedia.org";
    fetch(`https://${host}/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (cancel || !d) return;
        const s = d?.thumbnail?.source || d?.originalimage?.source;
        if (s) setSrc(s);
      })
      .catch(() => {});
    return () => { cancel = true; };
  }, [event.id, event.wikipediaEn, event.wikipediaTr]);

  if (!src) return null;

  return (
    <div
      className="aspect-[16/9] overflow-hidden rounded-md mb-4 border"
      style={{ borderColor: "var(--war-rule)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={event.id}
        src={src}
        alt={event.name}
        className="w-full h-full object-cover"
        style={{
          filter: "grayscale(100%) contrast(1.2) brightness(0.95)",
          animation: "warKenBurns 6s ease-out forwards",
        }}
      />
      <style jsx>{`
        @keyframes warKenBurns {
          0% { transform: scale(1); }
          100% { transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 5: `EventNav.tsx`**

```tsx
"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { WarEvent } from "@/lib/wars-types";

type Props = {
  prev: WarEvent | null;
  next: WarEvent | null;
  onPrev: () => void;
  onNext: () => void;
};

export default function EventNav({ prev, next, onPrev, onNext }: Props) {
  const { locale } = useLocale();
  const name = (e: WarEvent) => (locale === "tr" && e.nameTr ? e.nameTr : e.name);
  return (
    <nav
      className="flex items-center justify-between gap-2 pb-2 mb-3 border-b font-mono text-[10px] uppercase tracking-[0.22em]"
      style={{ borderColor: "var(--war-rule)", color: "var(--war-paper-3)" }}
    >
      <button
        onClick={onPrev}
        disabled={!prev}
        className="flex items-center gap-2 disabled:opacity-30 hover:text-[var(--war-gold)] transition min-w-0 truncate"
        aria-label={locale === "tr" ? "Önceki olay" : "Previous event"}
      >
        <span>←</span>
        <span className="truncate">
          {prev ? name(prev) : locale === "tr" ? "yok" : "none"}
        </span>
      </button>
      <button
        onClick={onNext}
        disabled={!next}
        className="flex items-center gap-2 disabled:opacity-30 hover:text-[var(--war-gold)] transition min-w-0 truncate"
        aria-label={locale === "tr" ? "Sonraki olay" : "Next event"}
      >
        <span className="truncate">
          {next ? name(next) : locale === "tr" ? "yok" : "none"}
        </span>
        <span>→</span>
      </button>
    </nav>
  );
}
```

- [ ] **Step 6: `WarBottomSheet.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import BottomSheet from "@/components/wars-noir/BottomSheet";
import EventHero from "./EventHero";
import EventStats from "./EventStats";
import EventStory from "./EventStory";
import EventPhoto from "./EventPhoto";
import EventNav from "./EventNav";
import type { WarEvent } from "@/lib/wars-types";

type Props = {
  events: WarEvent[];
  activeId: string | null;
  onSelect: (e: WarEvent) => void;
  onClose: () => void;
};

export default function WarBottomSheet({ events, activeId, onSelect, onClose }: Props) {
  const idx = activeId ? events.findIndex((e) => e.id === activeId) : -1;
  const active = idx >= 0 ? events[idx] : null;
  const prev = idx > 0 ? events[idx - 1] : null;
  const next = idx >= 0 && idx < events.length - 1 ? events[idx + 1] : null;

  // Keyboard nav
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prev) onSelect(prev);
      if (e.key === "ArrowRight" && next) onSelect(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, prev, next, onSelect]);

  return (
    <BottomSheet open={!!active} onClose={onClose} heightVh={45}>
      {active && (
        <div data-map="wars" className="px-5 md:px-8 pb-6">
          <EventNav prev={prev} next={next} onPrev={() => prev && onSelect(prev)} onNext={() => next && onSelect(next)} />
          <EventHero event={active} />
          <EventPhoto event={active} />
          <EventStats event={active} />
          <EventStory event={active} />
        </div>
      )}
    </BottomSheet>
  );
}
```

- [ ] **Step 7: Build + commit**

```bash
npm run build
git add app/maps/wars/[slug]/{EventHero,EventStats,EventStory,EventPhoto,EventNav,WarBottomSheet}.tsx
git commit -m "wars: add bottom-sheet event drawer + 5 sub-components"
```

---

## Task 13 — Rewrite `WarMapClient.tsx` as thin orchestrator

**Files:**
- Rewrite: `app/maps/wars/[slug]/WarMapClient.tsx`

- [ ] **Step 1: Replace the entire file contents**

```tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteLogo from "@/components/SiteLogo";
import { LocaleToggle, useLocale } from "@/components/LocaleProvider";
import WarGlobe from "./WarGlobe";
import WarTimelineSidebar from "./WarTimelineSidebar";
import WarTimelineStrip from "./WarTimelineStrip";
import WarSidesHero from "./WarSidesHero";
import WarBottomSheet from "./WarBottomSheet";
import { parseFuzzyDate, type War, type WarEvent } from "@/lib/wars-types";

export default function WarMapClient({ war }: { war: War }) {
  const { t, locale } = useLocale();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const onR = () => setSize({ w: window.innerWidth, h: window.innerHeight - 64 });
    onR();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const events = useMemo(
    () =>
      [...war.events].sort(
        (a, b) =>
          a.order - b.order ||
          parseFuzzyDate(a.date).t - parseFuzzyDate(b.date).t
      ),
    [war.events]
  );

  // Casualty-scaled marker size (log-normalize in 0..1)
  const casualtyScale = useMemo(() => {
    const m: Record<string, number> = {};
    let max = 0;
    for (const e of events) {
      const c =
        (e.casualties?.sideA ?? 0) + (e.casualties?.sideB ?? 0);
      if (c > max) max = c;
    }
    const logMax = Math.log1p(max);
    for (const e of events) {
      const c =
        (e.casualties?.sideA ?? 0) + (e.casualties?.sideB ?? 0);
      m[e.id] = logMax > 0 ? Math.log1p(c) / logMax : 0;
    }
    return m;
  }, [events]);

  const handleSelect = (e: WarEvent) => setActiveId(e.id);

  return (
    <div
      data-map="wars"
      className="relative min-h-screen overflow-hidden"
      style={{ background: "var(--war-ink)", color: "var(--war-paper)" }}
    >
      <header className="absolute top-0 left-0 right-0 z-40"
              style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0.95), transparent)" }}>
        <div className="flex justify-between items-center px-4 md:px-8 py-3 md:py-4">
          <SiteLogo />
          <div className="flex items-center gap-4">
            <Link href="/maps/wars"
                  className="font-mono text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: "var(--war-paper-2)" }}>
              ← {locale === "tr" ? "Tüm savaşlar" : "All wars"}
            </Link>
            <LocaleToggle />
          </div>
        </div>
      </header>

      <WarSidesHero war={war} />

      {size.w > 0 && (
        <WarGlobe
          events={events}
          activeId={activeId}
          onSelect={handleSelect}
          width={size.w}
          height={size.h}
          casualtyScale={casualtyScale}
        />
      )}

      <WarTimelineSidebar events={events} activeId={activeId} onSelect={handleSelect} />
      <WarTimelineStrip events={events} activeId={activeId} onSelect={handleSelect} />

      <WarBottomSheet
        events={events}
        activeId={activeId}
        onSelect={handleSelect}
        onClose={() => setActiveId(null)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: exits 0. Any unused imports or leftover old functions will show up here.

- [ ] **Step 3: Full smoke on an existing war**

```bash
npm run dev
```

Open `http://localhost:3000/maps/wars/turkish-independence`. Verify:

- Noir dark background, gold accents.
- Hero at top shows war name, flags, commanders, dead count.
- Globe mounts and focuses on marker 1 (not average).
- Timeline sidebar visible on desktop; numbered tiles visible on mobile.
- Clicking a marker slides up the bottom sheet.
- Sheet shows event hero, stats, story (with gold drop-cap), photo.
- `←` / `→` keys navigate prev/next events with globe fly-to + cross-fade.
- `ESC` closes the sheet.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add app/maps/wars/[slug]/WarMapClient.tsx
git commit -m "wars: rewrite WarMapClient as thin orchestrator (split complete)"
```

---

## Task 14 — Redesign selection page (`/maps/wars`)

**Files:**
- Modify: `app/maps/wars/WarsIndexClient.tsx`

- [ ] **Step 1: Open `WarsIndexClient.tsx` and update**

Wrap the root element with `data-map="wars"` and replace Tailwind color classes with noir CSS variables. Replace the grid of inline `<Link>` cards with `<WarCard war={w} />` from `components/wars-noir/WarCard`.

Specifically:

At the top imports, add:

```ts
import WarCard from "@/components/wars-noir/WarCard";
```

Replace the outer wrapper div's className/style:

```tsx
<div
  data-map="wars"
  className="min-h-screen"
  style={{ background: "var(--war-ink)", color: "var(--war-paper)" }}
>
```

Replace the hero section's content:

```tsx
<h1 className="font-serif font-light italic text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight" style={{ color: "var(--war-paper)" }}>
  {locale === "tr" ? (
    <>Savaşın <span style={{ color: "var(--war-gold)" }}>kırılım noktaları</span></>
  ) : (
    <>The <span style={{ color: "var(--war-gold)" }}>turning points</span> of war</>
  )}
</h1>
<p className="mt-3 font-mono text-[11px] uppercase tracking-[0.25em]" style={{ color: "var(--war-paper-3)" }}>
  {wars.length} {locale === "tr" ? "savaş" : "wars"} · {wars.reduce((s, w) => s + w.eventCount, 0)} {locale === "tr" ? "olay" : "events"}
</p>
```

Inside each era group, replace the inline `<Link>` card with:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
  {list.map((w) => (
    <WarCard key={w.slug} war={w} />
  ))}
</div>
```

Update the search input's styles to noir:

```tsx
<input
  value={q}
  onChange={(e) => setQ(e.target.value)}
  placeholder={locale === "tr" ? "Savaş ara…" : "Search wars…"}
  className="w-full px-4 py-3 rounded-full bg-transparent text-[14px] focus:outline-none"
  style={{
    border: "1px solid var(--war-rule)",
    color: "var(--war-paper)",
  }}
/>
```

Update `Chip` component's active style to use `--war-gold`:

```tsx
<button
  onClick={onClick}
  className="px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.15em] transition"
  style={{
    background: active ? "var(--war-gold)" : "transparent",
    color: active ? "var(--war-ink)" : "var(--war-paper-2)",
    border: `1px solid ${active ? "var(--war-gold)" : "var(--war-rule)"}`,
  }}
>
  {children}
</button>
```

- [ ] **Step 2: Build + smoke**

```bash
npm run build
npm run dev
```

Open `http://localhost:3000/maps/wars`. Verify: noir dark background, gold "turning points" italic, 10 cards in grid, grayscale flags per card, gold dead count. Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add app/maps/wars/WarsIndexClient.tsx
git commit -m "wars: redesign selection page with noir palette + WarCard"
```

---

## Task 15 — Remove dev-only mockup route from production build

**Files:**
- Modify: `app/maps/wars/_mockup/page.tsx`

- [ ] **Step 1: Verify mockup is `noindex`**

Confirm the file exports this metadata (design agent should have set it):

```ts
export const metadata = { robots: "noindex, nofollow" };
```

- [ ] **Step 2: Exclude mockup from sitemap**

Open `app/sitemap.ts`. Confirm the wars section does not include `/maps/wars/_mockup`. If `_mockup` is accidentally included, filter it out.

- [ ] **Step 3: Build + commit (if changes)**

```bash
npm run build
```

If you modified `sitemap.ts`:

```bash
git add app/sitemap.ts
git commit -m "wars: exclude _mockup route from sitemap"
```

---

## Task 16 — QA sweep

- [ ] **Step 1: Typecheck + lint + build + validate**

```bash
cd /Users/evren/Desktop/claude-apps/maps
npx tsc --noEmit
npm run lint
npm run build
npm run validate:wars
```

All four must exit 0.

- [ ] **Step 2: Manual smoke matrix**

Run `npm run dev`. Click through:

- [ ] `/maps/wars` — 10 cards, filters work, featured band (if added)
- [ ] `/maps/wars/turkish-independence` — hero, globe, sidebar, sheet
- [ ] `/maps/wars/world-war-2` — large event count (30+) renders without lag
- [ ] `/maps/wars/russo-ukrainian-war` — newer war, contested casualty figures show
- [ ] `/maps/wars/<new-slug-4>` — pick one of the 4 new wars
- [ ] Marker 1 is active on mount (gold ring pulsing)
- [ ] Arrow-key nav works; ESC closes; tour mode still runs (if preserved)
- [ ] Mobile viewport (Chrome DevTools, iPhone SE 375 px): hero stacks, timeline strip horizontal, sheet drags to dismiss
- [ ] Flag hover reveals color over 300 ms
- [ ] Story drop-cap visible in gold

- [ ] **Step 3: Lighthouse on `/maps/wars/turkish-independence`**

Chrome DevTools → Lighthouse → Performance, Accessibility, Best Practices, SEO. Target ≥ 95 on all four.

If Performance < 95: check LCP. Most likely fix is removing animations from first paint (defer grain overlay, delay ken-burns). If Accessibility < 95: missing aria labels on buttons. Patch and re-run.

- [ ] **Step 4: Final commit (any fixes)**

```bash
git add -A
git commit -m "wars: QA fixes — <describe what changed>"
```

---

## Task 17 — Open PR

- [ ] **Step 1: Push branch**

```bash
git push -u origin wars-noir-upgrade
```

- [ ] **Step 2: Create PR**

```bash
gh pr create --title "War Map: noir upgrade + 10 turning-point wars" --body "$(cat <<'EOF'
## Summary

- Rewrites `/maps/wars` and `/maps/wars/[slug]` with a cinematic black-and-white documentary aesthetic.
- Replaces 6 existing wars + adds 4 new ones = 10 turning-point wars (history agent output).
- Rich schema: period flags, commanders, casualties, 200–400-word per-event story, bilingual.
- Numbered markers, bottom-sheet event drawer, prev/next pagination, keyboard nav.
- Splits 561-line `WarMapClient` into 8 focused components.
- Adds Zod schema validator (`npm run validate:wars`).

## Spec

`docs/superpowers/specs/2026-04-18-war-map-noir-upgrade-design.md`

## Test plan

- [ ] `npm run validate:wars` passes
- [ ] `npm run build` passes
- [ ] Lighthouse ≥ 95 on `/maps/wars/turkish-independence`
- [ ] Manual smoke on 5 war pages (TR independence, WWI, WWII, Russo-Ukrainian, one new)
- [ ] Mobile viewport tested at 375 px
- [ ] Keyboard nav: arrows, ESC
- [ ] Flag hover color reveal
- [ ] Globe focus on marker 1 on mount

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Report PR URL to user**

---

## Self-review (done by plan author)

1. **Spec coverage:**
   - §3 Data schema → Task 5 (Zod types)
   - §4 Noir design system → Task 4 (design agent)
   - §5.1 Component split → Tasks 8–13
   - §5.2 UX flow (marker-1 focus, keyboard, bottom sheet, prev/next) → Tasks 8, 12, 13
   - §6 Selection page → Task 14
   - §7.1 History agent → Tasks 1–3
   - §7.2 Design agent → Task 4
   - §7.3 Concurrency → Tasks 3/4 dispatched with `run_in_background: true`
   - §9 Risks — flag URL validator → deferred (P1 in war TODO); casualty-source citation enforced by Zod; scope bleed prevented by `[data-map="wars"]` scoping in Task 4
   - §10 Testing → Task 16
   - §12 Success criteria → all verified in Task 16 smoke
   - Gaps: none identified.

2. **Placeholder scan:** searched for TBD / TODO / "implement later" / "add error handling" — none found.

3. **Type consistency:** `WarEvent.order`, `WarEvent.side`, `War.sides`, `War.casualties` used consistently across Tasks 5/8/9/11/12/13. `activeId: string | null` and `onSelect: (e: WarEvent) => void` used consistently across all consumer components.

---

**End of plan.**
