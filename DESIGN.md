# GeographicHub — UX & Design Principles

The rules every map on GeographicHub follows. When in doubt, **clarity beats cleverness**.

---

## 1. Self-explanatory, always

A first-time visitor must understand what they're looking at in ≤ 3 seconds, with no hover, no click, no reading.

- **Legend is always visible** — never hidden behind a hover. If the map uses color to convey meaning, a legend strip stays on screen.
- **Colors are never alone** — every categorical color is paired with a short label and an icon. A color-blind user, a tiny-phone user, and a printed screenshot must all still make sense.
- **Every status gets a plain-language one-liner.** Not "VOA" alone — "Visa on arrival · get it at the airport."
- **Numbers come with their unit and context.** Not "120" — "120 destinations · no embassy visa needed."

## 2. One primary action above the fold

Each map has **one clear next step** when it opens: pick your passport, pick a country, tap a dish, press play. This action is visually dominant; everything else retreats.

- No competing CTAs in the hero.
- If nothing is selected yet, guide the user with a subtle pulse or arrow.
- Answer the user's implicit question (*"what do I do here?"*) without them having to ask.

## 3. Show, don't define

Prefer concrete examples over jargon.

- "ETA" → "Electronic pre-approval, 5-min online form."
- "Heartbrand" → "You call it Algida; elsewhere it's Wall's, Kibon, Good Humor."
- "PDO" → "Only made in this region — protected by law."

## 4. Consistent visual language across maps

When two GeographicHub maps use the same concept, they use the same visual.

- Green = allowed / tasted / completed.
- Red = forbidden / unavailable.
- Yellow/amber = caution / intermediate (VOA, pending).
- Blue/teal = informational / online (eVisa).
- Gradient strength = magnitude (e.g. visa-free days).
- Gray = no data / neutral / same-as.

Typography:
- `font-serif` (Fraunces) for headlines and map titles.
- `font-sans` (Inter) for body and UI controls.
- `font-mono` (JetBrains Mono), uppercase, tracking-wide for labels and meta.

## 5. Hover for depth, never for essentials

Hover can *enrich* but never *reveal* something the user needs to know.

- Key facts must be visible without hover.
- Mobile has no hover; design for tap-first.
- Panels collapse into bottom sheets on < 768 px.

## 6. Graceful empty states

Every map has a defined state for:
- First load (skeleton, ≤ 2 s LCP)
- Nothing selected yet (onboarding nudge)
- No data for the selection (honest fallback, never silent failure)
- Network error (retry affordance)

## 7. Friendly density

Information-dense is fine; cramped is not.

- Max 3 visible text hierarchies per panel.
- Whitespace between related groups at least 16 px.
- Lists beyond ~10 items scroll within their panel; page itself doesn't scroll.

## 8. Attribution without clutter

Every data source is credited, but footers are discreet.

- Single footer line listing the source names (not URLs) in small font-mono.
- Dedicated `/legal/data-sources` for the full license chain.

## 9. Shareable by default

Each map assumes someone will screenshot or link to it.

- OG image auto-generated per state (dynamic `@vercel/og`).
- URL encodes meaningful state (which passport, which country, which brand) where feasible.
- "Share" is a first-class action where the user has a personal state (Taste Passport stamps, visa-free count, hidden-brand reveal).

## 10. Honest about limits

A map is only as good as its data.

- Show the last-updated date prominently.
- Flag where coverage is thin or politically contested (Taiwan, Kosovo, Palestine…).
- A single universal disclaimer line: "Always verify with official sources before acting."

---

## Component checklist before shipping a map

- [ ] Fixed legend (no hover required)
- [ ] Icons + colors for all status categories
- [ ] Above-the-fold single primary action
- [ ] Onboarding hint if nothing selected
- [ ] Plain-language one-liner per status/category
- [ ] Mobile layout with bottom-sheet panels
- [ ] Empty / loading / error states defined
- [ ] Data source + last-updated stamp visible
- [ ] OG image generator wired
- [ ] Keyboard navigation works
- [ ] Color-blind spot check (Protanopia / Deuteranopia simulation)
- [ ] Lighthouse ≥ 95

---

If a map fails any of the above, it's not done — even if it technically works.
