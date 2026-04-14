# Visa-Free Atlas — Backlog

**Slug**: `/maps/visa-free`
**Status**: ✅ MVP live — redesigned for clarity (hero stat card, icon-badged statuses, permanent bottom legend, onboarding nudge)

Data source: [passport-index-dataset](https://github.com/ilyankou/passport-index-dataset) (MIT, sourced from Wikipedia CC BY-SA).

> 🎨 Design complies with [DESIGN.md](../../../DESIGN.md) — set the visual language for the rest of GeographicHub.

---

## 🚀 Priority Order

### P0 — Now

1. **Per-passport landing pages** (`/maps/visa-free/turkey`, `/maps/visa-free/germany`, …) — static-generated SEO pages for all 199 passports. This is the single biggest SEO lever — exact queries like "countries Turkey citizens can visit without visa" have massive volume.
2. **FAQ schema per passport page** — "How many countries can X passport visit visa-free?", "Do Y citizens need a visa for Z?"
3. **Dynamic OG image per passport** — shows passport color + top stat ("Turkish passport: 120 visa-free destinations") for social shares.
4. **Legend strip at the bottom of globe** — currently only on sidebar; add permanent color strip to help users parse the map at a glance.
5. **Auto-detect user's passport** (optional, from IP/geolocation; default to their likely home country with a prominent "change passport" CTA).
6. **Recent data freshness stamp** — "Data updated YYYY-MM-DD" near the footer, pulled from the dataset's last-modified date.
7. **Trademark/attribution page updates** — add Wikipedia + passport-index-dataset to the shared `/legal/data-sources` page.

### P1 — Next

8. **Passport comparison mode** — pick 2 passports, see destinations where they differ (spouse from one country, you from another = practical use case).
9. **"Which passports let me into country X visa-free?"** — inverse lookup panel. Pick destination → get the list of passports that don't need a visa.
10. **Rankings** — sortable table "Passport power ranking" based on visa-free count. Alternative view to the map.
11. **Stay-length filter** — "Show only destinations where I can stay 90+ days."
12. **Save 'my passport'** to localStorage so it persists across visits.
13. **Region filter** — toggle showing only one continent (Europe, Asia, etc.) to reduce clutter.
14. **Share card PNG** — "My passport opens 120 borders. What about yours?" → big viral potential.

### P2 — Later

15. **Add visa-on-arrival days** where dataset provides (currently only "visa on arrival", sometimes with day count).
16. **Special routes & agreements** — EU freedom of movement, CA-MX USMCA, GCC, EAC, MERCOSUR — layered overlay showing bloc membership in addition to visa rules.
17. **Dual citizenship calculator** — combine 2 passports → union of visa-free destinations (digital-nomad audience).
18. **Travel cost layer** — Skyscanner / Kiwi affiliate for flight cost to the top visa-free destinations.
19. **Historical view** — how your passport's power has changed over years (if archived snapshots available from Wikipedia).
20. **Visa-application difficulty score** — approximate difficulty/cost of actually getting the required visa (external research).
21. **i18n TR/EN** (plus ES, DE, FR, AR later — huge multilingual long-tail).

### P3 — Someday

22. Crowdsource corrections form (user-reported discrepancies, moderated).
23. Embassy links + nearest embassy suggestion per user location.
24. "Best visa-free beaches for X passport" editorial spinoffs.
25. Integration with Taste Passport: "Visa-free destinations with signature cuisine."
26. Digital-nomad visa layer (Barbados, Portugal, Estonia, etc.).

---

## 🌐 SEO Plan (dedicated)

### Information architecture
- `/maps/visa-free/` — interactive globe + passport picker
- `/maps/visa-free/<passport-slug>/` — per-passport landing (199 pages)
- `/maps/visa-free/ranking/` — passport-strength ranking table
- `/maps/visa-free/compare/<a>-vs-<b>/` (P1) — comparison page
- `/maps/visa-free/destination/<iso>/` (P1) — "who can visit X visa-free?"

### Target queries (massive evergreen volume)
- "visa-free countries for <passport> passport"
- "how many countries can <passport> visit without visa"
- "do <X> citizens need a visa for <Y>"
- "<passport> visa-free list"
- "strongest passport in the world" / "passport power ranking"
- "<country> eVisa / visa on arrival countries"
- "schengen visa-free <passport>" (regional drilldowns)

### On-page SEO
- Per-passport `<title>`: "Turkish Passport Visa-Free Countries (2026) — Where Can Turkish Citizens Travel? · GeographicHub"
- Above-the-fold answer: big number + "X visa-free, Y visa-on-arrival, Z eVisa"
- Visible HTML table of destinations (indexable)
- H1 matches the question format
- Content sections: "Visa-free", "Visa on arrival", "eVisa", "Visa required", "Entry refused"
- Internal links: to comparison pages, to inverse "who can visit X" pages

### Structured data (JSON-LD)
- `WebApplication` on main globe page
- `FAQPage` on every passport page
- `ItemList` of destinations per passport (with `TouristDestination` items)
- `BreadcrumbList`

### Technical SEO
- Pre-render all 199 passport pages at build time
- `sitemap.xml` includes all passport and destination routes
- Canonicals (avoid `?passport=TUR` duplication)
- OG + Twitter card per page (dynamic)
- Hreflang for supported languages
- LCP < 2s on landing pages (defer globe; hero = static stat card)

### Content marketing
- "Which passports got stronger in 2025?" (annual data-story)
- "The 10 worst passports in the world" (controversial, high share rate — handle carefully)
- "Dual citizenship that opens the most borders" (TR + DE, CA + UK, etc.)
- Pitch to: digital-nomad communities, r/solotravel, r/travel, r/IWantOut, Nomad List forums
- Backlink magnets: embedded passport-strength widget for travel blogs

### Growth loops
- Share-card PNG ("My passport opens N borders") → social virality
- Per-passport pages compound long-tail SEO monthly
- Comparison tool → dual-audience interest (couples, dual-citizens)

---

## Data Quality

- [ ] Monthly auto-pull from upstream dataset — embed a CI/action to refresh
- [ ] Show data-as-of date on every page
- [ ] Flag known ambiguities (Kosovo, Taiwan, Palestine recognition dependencies)
- [ ] Cross-check with IATA Timatic when possible (one-off audit)
- [ ] Handle special-status territories (Hong Kong, Puerto Rico, Gibraltar, FRO, GRL)

---

## UX Polish

- [ ] Bottom legend strip (P0)
- [ ] Auto-detect user passport (P0)
- [ ] Save passport to localStorage (P1)
- [ ] Region filter toggle (P1)
- [ ] Rankings table view (P1)
- [ ] Stay-length filter (P1)
- [ ] Inverse lookup (P1)
- [ ] Comparison mode (P1)
- [ ] Share-card PNG (P1)
- [ ] Mobile: panels collapse into bottom sheet
- [ ] Light theme option

---

## Monetization

- [ ] Flight-booking affiliate (Skyscanner, Kiwi) on destination details
- [ ] Travel-insurance affiliate (SafetyWing for nomads)
- [ ] eSIM affiliate (Airalo) for visa-free destinations
- [ ] AdSense — travel niche high CPM
- [ ] Premium: email alerts when visa-free status changes for your passport

---

## Legal / Risk

- [ ] Strong disclaimer: "Always verify with the destination's embassy before booking." (already in footer)
- [ ] Data accuracy liability: editorial reference, not legal advice
- [ ] Handle politically sensitive recognition cases (Taiwan, Kosovo, Palestine) consistently
- [ ] Attribution for passport-index-dataset (MIT) + Wikipedia (CC BY-SA) prominently displayed

---

## Technical

- [ ] Pre-bundle Natural Earth GeoJSON locally (remove CDN dep)
- [ ] Auto-update workflow: GitHub Action pulls latest CSV weekly
- [ ] Offline mode
- [ ] Pre-compute per-passport JSON (faster landing pages)
- [ ] Caching headers on static exports
