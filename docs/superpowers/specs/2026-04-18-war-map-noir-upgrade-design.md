# War Map — Noir Upgrade Design Spec

**Slug:** `2026-04-18-war-map-noir-upgrade`
**Scope:** `/maps/wars` + `/maps/wars/[slug]`
**Status:** spec (pre-implementation)
**Goals:** 10 turning-point wars, cinematic black-and-white redesign, richer per-event storytelling, flag-based belligerents, numbered markers, bottom-sheet event drawer with prev/next pagination.

---

## 1. Motivation

The existing war map is functional but feels like a generic timeline tool. Emoji-based markers, right-side drawer, and decorative (not dramatic) visuals undersell the historical weight of the content. We want visitors to feel they are reading a documentary — black-and-white, heavy typography, grain, gold accents reserved for numbers and active state.

Content-wise, we commit to a curated set of 10 turning-point wars (wars that redrew maps, ended empires, or changed global order) rather than a broad catalogue. Each war carries richer data: belligerent flags, commanders, casualties, dramatic opening text, and a 200–400-word story per event.

## 2. User-facing decisions (frozen)

| Decision | Choice |
|---|---|
| Agent model | **Claude subagents** spawned in parallel (history + design) before implementation |
| 10-war list ownership | **History agent** proposes with rationale; user approves list |
| Visual aggressiveness | **C — Noir documentary (controlled)** |
| Data depth | **B — Rich stats** (military dead, civilian dead, wounded, POW, commanders, participants, forces per event, casualties per event) |
| Flag treatment | **D — Hybrid** (period-accurate flag grayscaled, with country/coalition name + commander names; hover reveals color; fallback to abstract gold coat) |
| Existing wars | **A — Rewritten from scratch** by history agent using new schema |
| Phasing | **Approach 3** — History first (list → approval → data), then Design + data-schema work in parallel, then implementation |

## 3. Data schema

### 3.1 `War` type

```ts
type War = {
  slug: string;
  name: string; nameTr?: string;
  startYear: number; endYear: number;
  era: WarEra; region: WarRegion; tags?: string[];
  blurb: string; blurbTr?: string;           // ≤300 chars, card use

  sides: WarSide[];                           // 2–3 sides
  casualties: {
    militaryDead: number;
    civilianDead?: number;
    wounded?: number;
    pow?: number;
    source: string;                           // cited origin of totals
  };
  participantCount?: number;                  // total combatants across sides (approx)

  opening: string; openingTr: string;         // 2–3 dramatic cinematic sentences
  outcome: string; outcomeTr: string;         // who won, what changed (1 paragraph)
  turningPointReason: string;                 // why this war is a pivot (1 paragraph)
  turningPointReasonTr: string;

  events: WarEvent[];
};

type WarSide = {
  id: "A" | "B" | "C";
  label: string; labelTr: string;             // e.g. "Entente Powers"
  countries: {
    name: string; nameTr: string;
    flagUrl?: string;                         // Wikimedia Commons SVG, period-accurate
    flagFallback?: "coat" | "emblem";
  }[];
  commanders: string[];                       // 1–4 leading figures
  result: "victor" | "defeated" | "withdrew" | "dissolved";
};
```

### 3.2 `WarEvent` type

```ts
type WarEvent = {
  id: string;
  name: string; nameTr?: string;
  lat: number; lng: number;
  date: string; dateEnd?: string;             // fuzzy YYYY/YYYY-MM/YYYY-MM-DD
  kind: WarEventKind;                         // battle|siege|treaty|...
  side: WarEventSide;                         // victory-a|defeat|...
  order: number;                              // 1,2,3 — explicit marker number

  summary: string; summaryTr?: string;        // ≤180 chars — timeline row
  story: string; storyTr: string;             // 200–400 words — bottom sheet body

  forces?:     { sideA: number; sideB: number };
  casualties?: { sideA: number; sideB: number };
  commanders?: { sideA: string[]; sideB: string[] };

  wikipediaEn?: string; wikipediaTr?: string;
  imageCredit?: string;
};
```

### 3.3 Validation

- Zod schema in `lib/wars-types.ts`
- Build-time validation of every `public/data/wars/*.json`
- `npm run build` fails on invalid data (forces history-agent output correctness)

### 3.4 JSON size budget

~30–50 KB per war file (6–10 files → <500 KB total). Acceptable for MVP; no lazy-load required.

---

## 4. Noir design system

Scope: `/maps/wars/**`. Other maps unaffected.

### 4.1 Color tokens

```css
--war-ink:      #0a0a0a;   /* primary background */
--war-ink-2:    #141414;   /* panels/cards */
--war-ink-3:    #1f1f1f;   /* hover/active surface */
--war-paper:    #e8e3d6;   /* primary text */
--war-paper-2:  #b5b0a3;   /* secondary text */
--war-paper-3:  #6b665a;   /* meta/muted */
--war-rule:     #2a2720;   /* hairlines, borders */
--war-gold:     #c9a961;   /* single accent — active/date/number only */
--war-gold-dim: #7a663a;   /* inactive gold */
--war-blood:    #5c1a1a;   /* casualty numbers only */
```

**Color rule:** Gold is reserved for (a) active UI state, (b) dates/years, (c) numeric stats. Blood-red is reserved for casualty counts. Everything else is grayscale.

### 4.2 Typography

- Serif: **Fraunces**, 300 weight, italic for emphasis — war titles, event titles, story drop-caps
- Mono: **JetBrains Mono**, uppercase, `tracking-[0.25em]` — dates, meta, labels, counts
- Sans: **Inter**, 14–15 px, line-height 1.65 — story body

### 4.3 Iconography

Stroke-only SVG, `stroke="currentColor"`, 1.2 lw, 9 icons replacing emoji:

- `battle` — crossed swords
- `siege` — castle tower silhouette
- `congress` — three columns
- `treaty` — scroll + seal
- `occupation` — square with X
- `liberation` — broken chain link
- `armistice` — two shaking hands silhouette
- `landing` — anchor
- `event` — filled circle

### 4.4 Marker pattern

Numbered medallion + pin:

```
   ╭─────╮
   │  03 │   ← mono gold number
   ╰──┬──╯
      │      ← hairline drop
      ●      ← small kind icon
```

- Border: gold when active, `--war-gold-dim` idle
- Size: `32px → 56px` scaled by `casualties.military` (log-scaled)
- Active: gold pulse ring (1.6s ease-out, infinite)

### 4.5 Flag treatment

```css
.war-flag {
  filter: grayscale(100%) contrast(1.08) brightness(0.92);
  border: 1px solid var(--war-rule);
  aspect-ratio: 3 / 2; width: 48px;
}
.war-flag:hover { filter: none; transition: filter 0.3s; }
```

Fallback when `flagFallback: "coat"` — gold stroke SVG with country monogram.

### 4.6 Atmosphere

- Globe background: `#0a0a0a`; atmosphere color `--war-gold` alpha 0.18
- Country polygon cap: `rgba(232,227,214,0.04)`; stroke `rgba(232,227,214,0.35)`
- Film grain overlay: static SVG `feTurbulence` @ 3 % opacity (not animated — battery)
- Vignette: radial `rgba(0,0,0,0.5)` at edges

### 4.7 Photo treatment

Wikipedia thumbnails:
```css
.war-photo { filter: grayscale(100%) contrast(1.2) brightness(0.95); }
```

Optional ken-burns on bottom-sheet open: 6 s, `scale(1) → scale(1.04)`, `ease-out`.

---

## 5. Component architecture

Current monolith (`WarMapClient.tsx`, 561 lines) is split into focused components (orchestrator + 5 children + 5 sheet sub-children).

```
app/maps/wars/[slug]/
  page.tsx                        # server, metadata + JSON-LD
  WarMapClient.tsx                # ~150 lines orchestrator (state)
    ├── WarGlobe.tsx              # globe + markers + zoom
    ├── WarTimelineStrip.tsx      # top horizontal timeline (mobile)
    ├── WarTimelineSidebar.tsx    # left vertical list (desktop)
    ├── WarSidesHero.tsx          # top banner: flags + commanders + stats
    └── WarBottomSheet.tsx        # sliding-up event detail + prev/next
          ├── EventHero.tsx
          ├── EventStats.tsx
          ├── EventStory.tsx
          ├── EventPhoto.tsx
          └── EventNav.tsx

components/wars-noir/              # design agent deliverables
  KindIcon.tsx
  NumberedMarker.tsx
  FlagStrip.tsx
  BottomSheet.tsx
  WarCard.tsx                      # selection page tile
  theme.ts                         # token helpers
```

### 5.1 Why split

- Each file becomes readable and individually testable.
- Design-agent deliverables live in `wars-noir/` — isolated namespace, easy to swap.
- `WarMapClient` is pure orchestration (state + callbacks).

### 5.2 UX flow

1. **Route mount** → server renders `page.tsx` with JSON-LD; client hydrates `WarMapClient`.
2. **`WarSidesHero`** paints above globe: period dates, grayscale flags per side, commanders, total-dead counter (gold), 2–3 sentence `opening`.
3. **`WarGlobe`** mounts. `pointOfView({ lat: order[0].lat, lng: order[0].lng, altitude: 1.4 }, 1200)` — focuses on marker 1.
4. **`WarTimelineSidebar`** lists events; first event highlighted.
5. User clicks marker or timeline row → `selectEvent(e)` → `WarBottomSheet` animates up (280 ms spring ease-out).
6. Inside sheet: `EventHero` (date + title + flag vs flag), `EventStats` (forces/casualties table, commanders), `EventStory` (200–400-word serif body with drop-cap), `EventPhoto` (B&W ken-burns), `EventNav` (← prev · next →).
7. Prev/next inside sheet → globe flies to new marker, photo/story cross-fades 120 ms, sheet stays open.
8. `ESC` closes sheet; `←/→` navigates; `space` toggles tour.
9. Bottom legend band is permanent (DESIGN.md compliance).

### 5.3 Mobile

- Bottom sheet: `72 vh` open state, drag-to-dismiss, 25 % peek state after dismiss.
- Top timeline collapses to horizontal scroll strip of numbered chips.
- Flags stack vertically in `WarSidesHero`.

---

## 6. Selection page redesign (`/maps/wars`)

Mevcut search + era/region filtresi korunur, noir skin + yeni kart tasarımı uygulanır.

- **Hero:** `SAVAŞIN KIRILIM NOKTALARI · 10 SAVAŞ · ~500 OLAY` (Fraunces italic)
- **Featured band:** haftanın öne çıkan savaşı (MVP: manual; P1: rotation)
- **Grid (`WarCard`):** grayscale side-A vs side-B flags, `§ YEAR–YEAR · N EVENTS`, serif italic title, gold military-dead count, `OPEN MAP →`
- **Empty state:** "No matching wars" with friendly nudge to clear filters

---

## 7. Agent briefs

### 7.1 History Agent brief

**File location:** `.claude/agents/war-historian.md` (if Approach C wanted later) — for this session, spawned inline via `Agent` tool.

**Mission:**
1. Propose 10 "turning-point wars" covering diverse eras (ancient, medieval, early-modern, 19th, 20th, 21st) and regions (Europe, Middle East, Asia, Americas, Africa, global). Criteria: redrew maps, ended empires, or changed global order. Output: `docs/superpowers/specs/10-wars-shortlist.md` with a rationale per war. **Stop for user approval.**
2. On approval, produce `public/data/wars/<slug>.json` for each of the 10, conforming to §3.1–§3.2. Minimum 20 events per war (≥30 for WWI/WWII scale). 200–400-word `story` per event, bilingual TR/EN. Period-accurate flag URLs from Wikimedia Commons (verified to resolve). Cited `casualties.source`. Update `public/data/wars/index.json`.

**Rules:**
- Rewrite existing 6 files; do not attempt to merge.
- Tag events with `source: curated` (hand-researched).
- Where historians disagree on casualty figures, use mid-range mainstream consensus; note the disagreement in `casualties.source`.
- Dramatic tone in `story`, factual tone in `outcome` and `turningPointReason`.

### 7.2 Design Agent brief

**Mission:**
1. Produce `lib/wars-noir-theme.css` with all §4.1 tokens.
2. Build `components/wars-noir/` — 6 components (§4.3–4.5 and §5).
3. Create `app/maps/wars/_mockup/page.tsx` — a development-only route (excluded from build/sitemap) that renders one example war with mock data to showcase every component in situ. This is the user-approval surface.
4. Mobile + desktop layouts working at 375 px and 1280 px.
5. No Figma — working code is the mockup.

**Rules:**
- No dependency additions without approval (stick to Next.js/Tailwind/React).
- Use CSS variables for every color; no inline hex (exception: icon SVG `stroke="currentColor"`).
- Stroke-only SVG icons hand-authored in-repo; no icon library imports.
- All components accept `className` and forwardRef where they render a root DOM element.

### 7.3 Concurrency

- **Sequential:** History shortlist → user approval → History full data. Blocks Phase 1.
- **Parallel:** Design agent runs concurrent with history-full-data generation and developer schema-migration work.

---

## 8. Phased roadmap

| Phase | Owner | Deliverable | Blocks |
|---|---|---|---|
| 0.1 | History agent | `10-wars-shortlist.md` with rationale | 0.2 |
| 0.a | User | Shortlist approval | 0.2 |
| 0.2 | History agent | 10 × war JSON + updated `index.json` | 1, 2 |
| 0.3 | Design agent | `wars-noir/` components + `_mockup` route | 2 |
| 0.b | User | Mockup approval | 2 |
| 1   | Dev (main) | Zod schema + `lib/wars-types.ts` update + validator | 2 |
| 2   | Dev (main) | `WarMapClient` refactor into 8 files; marker-1 focus; bottom sheet; prev/next; kbd nav | 3 |
| 3   | Dev (main) | Selection page noir re-skin + `WarCard` + featured band | 4 |
| 4   | Dev (main) | QA: mobile smoke, Lighthouse ≥ 95, keyboard, empty/loading/error states | — |

---

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| History agent cites wrong casualty figures | `casualties.source` field forces citation; human-review step before merge |
| Wikimedia flag URL 404s | Separate build-time flag-URL HEAD check (P1; outside Zod); fallback `coat` SVG renders regardless |
| Mobile bottom sheet gesture conflicts with globe drag | Sheet drag-handle is a defined 44 px zone; globe-drag disabled while sheet is > 25 % open |
| Noir theme bleeds into other maps | All tokens scoped under `[data-map="wars"]`; no global overrides |
| 400-word story overflows sheet on mobile | Sheet body scrolls internally; drop-cap and short paragraphs by style guide |
| Rewriting existing Turkish Independence loses curated quality | History agent given existing 17-event JSON as reference material in prompt; regeneration must be ≥ quality |

## 10. Testing plan

- **Data:** Zod validator + build-time flag URL HEAD check (P1).
- **Components:** Visual inspection via `_mockup` route (design-agent surface).
- **Integration:** Manual QA on `turkish-independence`, `world-war-2`, `russo-ukrainian-war` (three different event densities).
- **Device matrix:** iPhone SE (375 px), iPhone 14 (390 px), iPad (768 px), desktop (1280/1920 px).
- **Lighthouse:** Performance, Accessibility, Best Practices, SEO — all ≥ 95.
- **Keyboard:** Tab order; `←/→/ESC/space` shortcuts; focus ring visible.
- **Empty/error states:** broken slug → 404; missing image → no broken `<img>`; offline → graceful.

## 11. Out of scope (defer)

- Territorial-control animation over time (P2 in wars TODO).
- Troop-movement arrows (P2).
- User-submitted corrections (P2).
- Per-city landing pages / breakout pages per event (P2, after traffic signals).
- i18n beyond the existing TR/EN toggle.
- Dynamic OG per war (exists as P0 in TODO; outside this spec but tracked).

## 12. Success criteria

- All 10 wars render with: flags, commanders, casualties, 20+ events, 200–400-word per-event story.
- First-time visitor understands "this is 10 turning-point wars" within 3 seconds of landing on `/maps/wars`.
- Clicking any marker opens a bottom sheet in ≤ 300 ms with prev/next navigation.
- Noir aesthetic is consistent, no color leakage, grain subtle.
- Lighthouse Performance ≥ 95 on `/maps/wars/turkish-independence`.
- Mobile drag-to-dismiss on bottom sheet works without conflicting with globe gestures.

---

**End of spec.** Proceed to implementation plan via `writing-plans` skill.
