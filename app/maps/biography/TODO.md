# Biography Map — Backlog

**Slug**: `/maps/biography`
**Status**: ✅ MVP live (Wikidata search, SPARQL for birth/death/education/residence/work, globe pins with chronological arcs, timeline sidebar)

> 🎨 DESIGN.md compliance required.

---

## 🚀 Priority

### P0 — Now
- [ ] **Per-person landing pages** (`/maps/biography/albert-einstein`) — huge SEO; names are top searches. Generate statically for top 1000 public figures (Q-IDs from Wikidata "most sitelinks" query).
- [ ] **FAQ schema** on person pages ("Where was X born?", "Where did X die?", "Where did X study?")
- [ ] **Fallback geocoding** when Wikidata coord missing — try `P131` admin and Nominatim
- [ ] **Year tooltips** — show year floating near each pin, not only in sidebar
- [ ] **Timeline scrubber** — drag a year → only events up to that year visible
- [ ] **Related figures** — at bottom of each person's page ("You might also like: Curie, Bohr…")

### P1
- [ ] More event types: spouse (P26 + their birthplace), notable works (P800), conflicts/battles fought, monarchs reigning…
- [ ] **Career arc** — connect work events with travel arcs in chronological order, animate
- [ ] **Group mode** — compare 2-3 people's lives on one globe (Hemingway vs Fitzgerald)
- [ ] **"On this date"** — for each pin, show what happened in the world that year
- [ ] **Person of the day** — random figure rotation on homepage
- [ ] Wikipedia excerpt per event location
- [ ] Share PNG
- [ ] Dynamic OG image per person

### P2
- [ ] Collections: "Writers of the 20th century", "Scientists", "Musicians"
- [ ] Family-tree overlay
- [ ] Export .kml for Google Earth
- [ ] i18n

### P3
- [ ] User-contributed biographies (moderation needed)
- [ ] Fictional characters (Sherlock Holmes map)

---

## 🌐 SEO (massive potential)

Target queries:
- "where was X born"
- "where did X study"
- "where is X buried"
- "X life map"
- "life of X"

Programmatic: 1000 pre-rendered person pages = 1000 indexable pages.

## Technical

- [ ] Cache SPARQL responses in edge cache (KV/R2)
- [ ] Throttle Wikidata requests (they rate-limit generously but still)
- [ ] Handle places without coordinates (fall back to country centroid)
- [ ] Handle persons with >50 events (cluster, sample, paginate)
- [ ] Loading skeleton
- [ ] Error state when a person has no geocoded events
