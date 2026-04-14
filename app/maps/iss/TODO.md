# ISS Tracker — Backlog

**Slug**: `/maps/iss`
**Status**: ✅ MVP live (live 3D globe, marker, telemetry panel, passes predictor, forward trajectory)

> 🎨 Any redesign must pass the [DESIGN.md](../../../DESIGN.md) checklist — permanent legend, icons+colors, clear primary action, empty/loading/error states, bottom-sheet on mobile.

### Design-consistency pass (P0)

- [ ] Add a **permanent status strip** at the bottom (connection state + last update + legend for marker vs trajectory).
- [ ] Onboarding nudge when passes panel is empty — "← Click 'Use my location' to see next passes over you."
- [ ] Empty/error states for TLE load failure and API timeouts.
- [ ] Mobile: collapse side panels into a bottom-sheet with tabs (Telemetry · Passes).
- [ ] Replace jargon: "Slant range" → "Straight-line distance from you"; "Azimuth" → "Compass direction".

---

## 🚀 Priority Order

### P0 — Now (next batch)

1. **Per-city landing pages** (`/maps/iss/istanbul`, `/maps/iss/london`, `/maps/iss/new-york`) — static-generated pre-rendered pass tables for top 50 cities. **This is the biggest SEO lever this app has.**
2. **FAQ schema on each page** — "How fast does the ISS travel?", "Can I see the ISS from my city?", "How often does the ISS pass over me?"
3. **Crew roster card** — live list of astronauts on board from `http://api.open-notify.org/astros.json` (or alternative). Visual + cultural interest.
4. **Distance from user's location** — km from visitor to ISS in real-time. Extends existing geolocation flow with one number that feels magical.
5. **Dynamic OG image** — `@vercel/og` generates live ISS position snapshot over Earth for the share preview.
6. **"How to spot the ISS" guide page** (`/maps/iss/how-to-spot`) — long-form evergreen content, targets beginner astronomy queries.
7. **Sun-terminator overlay on the globe** — day/night shadow curve. Visual wow + explains "sunlight" stat.

### P1 — Next

8. **.ics calendar download per pass** — "Add to Google/Apple Calendar" button. Utility + retention.
9. **Browser notification 10 min before a visible pass** (opt-in)
10. **Past ground track** — fading dotted trail of the last ~45 min
11. **Visibility filter on passes** — show only twilight passes that are actually visible to the naked eye
12. **Compass direction at rise / peak / set** — "rises NW, peaks S at 74°, sets SE"
13. **Save favorite locations** (localStorage) — home / work / travel quick-switch
14. **User's location pin on globe** — auto-drop after geolocation consent
15. **i18n: TR + EN** — Turkish long-tail "ISS ne zaman geçecek <şehir>" is untapped

### P2 — Later

16. Multi-satellite mode (Hubble, Tiangong, Starlink)
17. Apparent magnitude estimate per pass
18. Orbital elements panel (inclination, RAAN, apogee/perigee)
19. Historical altitude chart (last 30 days — reboosts visible)
20. Camera-follow mode
21. PWA / installable
22. Offline TLE-only fallback if API fails
23. Blog: "How we predict ISS passes"

### P3 — Someday

24. Email/SMS reminders (needs backend)
25. Friends compare "I've spotted the ISS 3 times" (accounts)
26. Docked spacecraft visualization (Crew Dragon, Soyuz, Progress)
27. Embedded NASA live stream

---

## 🌐 SEO Plan (dedicated)

### Information architecture
- `/maps/iss/` — main live tracker (index)
- `/maps/iss/<city-slug>/` — per-city landing, static pre-rendered with upcoming passes, FAQ, map embed
- `/maps/iss/how-to-spot/` — evergreen guide
- `/maps/iss/faq/` — FAQ hub page
- `/maps/iss/about-the-iss/` — what is the ISS (linkable reference)

### Target queries (massive volume, all evergreen)
- "where is the iss right now" / "iss live location"
- "iss tracker" / "international space station tracker"
- "iss passing over <city>" / "when will iss pass over <city>"
- "how to see the iss" / "how to spot the iss"
- "iss speed" / "how fast does the iss travel"
- "iss altitude" / "how high is the iss"
- "iss orbital period"
- "is the iss visible tonight"

### On-page SEO
- Per-city `<title>`: "ISS Passes Over <City> — Live Tracker · GeographicHub"
- Meta: under 160 chars, includes city, next pass date/time, teaser
- H1 = user's exact question: "When will the ISS pass over Istanbul?"
- Above-the-fold: next pass time + magnitude + altitude in big type (answers query immediately)
- Body: explanation of ISS, how this city's passes work, link to how-to-spot guide
- Pass table = visible HTML (indexable), not only JS-rendered

### Structured data (JSON-LD)
- `WebApplication` on main tracker
- `FAQPage` on FAQ + every per-city page
- `Event` (repeating) for each upcoming pass — may surface in Google Events
- `Place` for each city page
- `Article` on how-to-spot guide

### Technical SEO
- `sitemap.xml` lists top 50 cities (auto-generated)
- Canonicals to prevent `?lat=&lon=` parameter duplication
- Hreflang TR/EN once i18n lands
- Pre-render per-city pages at build time, revalidate daily
- OG image: live position snapshot
- Lighthouse ≥ 95 on landing pages
- LCP < 2s on first paint (defer globe on landing pages; hero = static preview)

### Content marketing
- Blog: "How to spot the ISS with the naked eye" (evergreen)
- Blog: "We computed every ISS pass over 50 cities for the next 7 days" (data-story)
- Pitch to: r/space, r/spacex, Hacker News, astronomy subreddits
- Guest post: amateur astronomy blogs with backlinks

### Growth loops
- .ics calendar export → retained users → return traffic
- Browser notifications → re-engagement
- Per-city pages → long-tail compounding
- Crew roster photos → Pinterest images

---

## Engagement & Visuals

- [ ] Past ground track (P1)
- [ ] Sun terminator (P0)
- [ ] Camera follow (P2)
- [ ] Orbit count today counter
- [ ] "16 sunrises a day" counter
- [ ] Day/night state of the marker
- [ ] User's location pin (P1)
- [ ] Multi-sat extension (P2)

## Pass Prediction Upgrades

- [ ] Visibility filter — twilight passes only (P1)
- [ ] Rise/peak/set compass directions (P1)
- [ ] Apparent magnitude (P2)
- [ ] Favorite locations localStorage (P1)
- [ ] .ics calendar download (P1)
- [ ] Browser notifications 10 min pre-pass (P1)
- [ ] Share link with encoded location

## Educational / Contextual

- [ ] Crew roster (P0)
- [ ] Expedition number + mission patch
- [ ] Docked spacecraft
- [ ] "Did you know?" rotating tidbits
- [ ] Live view embed link
- [ ] Recent ISS news feed

## Data / Telemetry

- [ ] Distance from observer (P0)
- [ ] Slant range + elevation + azimuth from user
- [ ] Apogee / perigee
- [ ] Inclination + RAAN
- [ ] TLE epoch age warning (>3 days stale)
- [ ] 30-day altitude sparkline

## UX Polish

- [ ] Mobile layout rework (bottom sheet / tabs)
- [ ] Loading skeletons
- [ ] Offline / stale-data mode
- [ ] Keyboard shortcuts: `L` location, `R` reset, `F` follow
- [ ] Dark/light theme
- [ ] i18n TR/EN (P1)
- [ ] Accessibility pass

## Monetization-Friendly (post-AdSense)

- [ ] Astronomy-gear affiliate (telescopes, binoculars — Amazon Associates)
- [ ] How-to-photograph-the-ISS evergreen content

## Technical

- [ ] Exponential backoff on API failures
- [ ] Client-side TLE-only fallback when API down
- [ ] Service Worker / PWA (P2)
- [ ] Unit tests for pass computation (edge cases: poles, date-line)
