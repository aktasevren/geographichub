# War Map — Backlog

**Slug**: `/maps/wars`, `/maps/wars/[slug]`
**Status**: ✅ MVP live (Turkish War of Independence, 17 curated events)

> 🎨 DESIGN.md compliance required — permanent legend, icons+colors, primary action (Play timeline).

---

## 🚀 Priority

### P0 — Now
- [ ] Add **World War II** seed (≥25 events: Normandy, Stalingrad, Iwo Jima, Pearl Harbor, Berlin, Hiroshima, etc.)
- [ ] Add **American Civil War** seed (≥20 events)
- [ ] Add **Russo-Ukrainian War** (≥15 events, recent + well-sourced)
- [ ] **Wikidata SPARQL ingestion script** — build-time, writes `<slug>.generated.json`, curated overrides win on conflict
- [ ] **Timeline year scrubber** — drag year cursor, future events fade
- [ ] Image thumbnail in drawer (Wikipedia REST summary → `thumbnail.source`)
- [ ] Per-war dynamic OG image
- [ ] Per-war FAQ schema (already starts — extend)

### P1 — Next
- [ ] Search over all wars on /maps/wars (autocomplete)
- [ ] Filter by kind within a war (battles only, treaties only)
- [ ] **Casualties layer** — pin size ∝ casualty count (where data available)
- [ ] **Who won?** overlay — color regions by ultimate territorial result
- [ ] Related figures: link War Map ↔ Biography Map (e.g., "Atatürk's role in this war")
- [ ] Bilingual toggle (EN/TR) in drawer and legend

### P2 — Later
- [ ] Territorial control animation over time (2-frame per year)
- [ ] Troop movement arrows with dates
- [ ] User-submitted corrections form (moderated)
- [ ] Print-friendly PDF "campaign booklet" per war
- [ ] Sub-campaign nesting (WWII → Pacific → island-hop)

### P3 — Someday
- [ ] User accounts + "favorite wars"
- [ ] Compare 2 wars side-by-side
- [ ] Audio narration per event
- [ ] VR mode

---

## 🌐 SEO

Target queries:
- "[war name] map"
- "[war name] battles timeline"
- "battles of the [war]"
- "kurtuluş savaşı harita" (TR)
- "where was battle of X fought"

Landing strategy: one server-rendered `/maps/wars/[slug]/` per war with full battle list in plain HTML + FAQ schema + Article schema.

## Data Sources

- **Curated JSON** — handcrafted, highest quality per headline war
- **Wikidata SPARQL** (build-time) — broad coverage, uses provided template
- **Wikipedia REST summary** — runtime lookup for images and longer descriptions
- **OSM Nominatim** — fallback geocoding for events with no coord (1 req/s, cache)

## License hygiene

- Tag every row with `source: curated | wikidata | wikipedia`
- Attribution footer on every page
- Never ingest items without a CC-compatible license

## Technical

- [ ] Zod validator for War/WarEvent shape
- [ ] Merge script: curated wins, generated fills gaps
- [ ] Image blurhash for thumbnails
- [ ] `needs_review` flag + admin list
- [ ] Unit tests on parseFuzzyDate edge cases (BC dates, year-only)
