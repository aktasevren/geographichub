# Pilot Game — Backlog

**Slug**: `/maps/pilot-game`
**Status**: ✅ MVP live (random spawn, reverse-geocoded location, guess input, +1500 km east per correct, circumnavigate to win)

> 🎨 DESIGN.md compliance required on any redesign.

---

## 🚀 Priority

### P0 — Now
- [ ] **Difficulty modes**: Easy (country only) · Hard (country + capital/city) · Expert (enter exact country without hints)
- [ ] **Better ocean detection**: explicit ocean-regions polygons, not just "no country"
- [ ] **Country autocomplete** in guess input (dropdown of 199 countries)
- [ ] **Keyboard-friendly** — Enter submit, arrow keys in autocomplete
- [ ] **High-score localStorage** — best circumnavigation (fewest wrong + highest score)
- [ ] **Share PNG** — "I circled the Earth in 24 hops, beat me" viral card

### P1
- [ ] Alternative headings — random (not always east), north, polar circumnavigation
- [ ] **Flag-assist hint** — spend 3 points to see destination flag
- [ ] **Continent hint** — spend 1 point to see continent
- [ ] Timer mode — fastest circumnavigation
- [ ] Multi-round tournament mode
- [ ] Zoomed local map on spawn (Google-Maps-style tile at zoom 6)
- [ ] Capital / city name in correct-screen
- [ ] Sound effects (engine hum on correct, error beep on wrong)
- [ ] Daily challenge seed (same random seed for everyone that day)
- [ ] Achievements: "Polar flier", "Oceanic", "100 hops", "Perfect round"

### P2
- [ ] Multiplayer race (backend required)
- [ ] Global leaderboard
- [ ] "You were here" history: list every place you visited across runs
- [ ] i18n

---

## 🌐 SEO
- Query targets: "geography game", "country guessing game", "circumnavigate game", "where am I game"
- Main-page FAQ: "how to play", "how scoring works", "can I play on mobile"
- Share-PNG and social outreach are the primary growth drivers

## Technical
- [ ] Pre-compute country-centroid list for hinting
- [ ] Offline mode: bundle country polygons + skip reverse-geocode (slower but offline-first)
- [ ] Mobile controls: on-screen keyboard polish
