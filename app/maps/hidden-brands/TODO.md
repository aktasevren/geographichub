# Hidden Brands — Backlog

**Slug**: `/maps/hidden-brands`
**Status**: ✅ MVP live (5 brands, 3D globe, brand selector, legend, click-country details)

> 🎨 Any redesign must pass the [DESIGN.md](../../../DESIGN.md) checklist — permanent legend, icons+colors, clear primary action, empty/loading/error states, bottom-sheet on mobile.

### Design-consistency pass (P0)

- [ ] Move legend to a **permanent bottom strip** (currently in right sidebar only).
- [ ] Onboarding nudge when no country clicked: "← Pick a brand, then tap any country to reveal its local name."
- [ ] Show tiny logo thumbnail next to each legend name (ties to the P0 logos feature).
- [ ] Empty state if user clicks a country with no data: "Not sold here / data missing — help us fill the gaps (link to submit form)."
- [ ] Mobile: sidebars collapse into bottom-sheet tabs (Brands · Details).

---

## 🚀 Priority Order

### P0 — Now (next batch)

1. **Brand logos on the map and legend** — people recognize brands by logo, not text. Attach each regional variant's logo (Wikimedia Commons fair-use) next to the name in the legend, and show the logo in the country hover tooltip and click card. This is the single most important UX upgrade.
2. **Per-brand landing pages** (`/maps/hidden-brands/heartbrand`) — dedicated SEO pages with full story, FAQ schema, and static pre-render. Answers "Is Algida the same as Wall's?" directly.
3. **Per-brand FAQ schema.org** on each landing page — exact-match to Google's PAA ("People Also Ask") boxes.
4. **Add the Mars / Milky Way naming inversion** — most shocking example in the genre, huge viral hook.
5. **Add Mr. Clean family** (Mr. Proper / Don Limpio / Maestro Limpio / Meister Proper / Mastro Lindo) — 6+ names, household-name level recognition.
6. **Add Snickers ← Marathon (1990 rebrand)** with year + reason — introduces the historical/timeline dimension.
7. **OG image per brand** — dynamic `@vercel/og` map snapshot with brand's logo palette, used in social shares and search previews.
8. **Trademark disclaimer page** (`/legal/trademarks`) — one-page editorial/fair-use statement; links from footer.

### P1 — Next

9. **Country-centric view** (`/maps/hidden-brands/country/tr`) — "In Turkey, these global brands go by these names." Per-country landing page listing all brands → massive long-tail SEO.
10. **Share-card PNG export** — "In my country, these 12 brands have secret identities. Try yours: maphub/hidden-brands" → social virality.
11. **Packaging photo per variant** — Wikimedia Commons has many; add a small photo chip next to legend item.
12. **"Why renamed?" story card per brand** — one paragraph explaining the trademark dispute, cultural reason, or legal history. Essential for editorial depth + SEO body copy.
13. **Mobile layout polish** — side panels collapse into bottom drawer below 768 px.
14. **Zoom-to-country when legend item clicked** — camera animates to first country of that name.

### P2 — Later

15. Quiz mode — "Which country calls Lay's by this name?"
16. 2D flat-map toggle (alternate to globe view)
17. Comparison mode: pick 2 countries, see every brand that differs
18. Timeline mode: Marathon → Snickers (1990), Opal Fruits → Starburst (1998) — year-by-year
19. Crowdsource "Submit a brand" form (moderated)
20. Embed widget for marketing blogs (with backlink)
21. Light theme

### P3 — Someday

22. Per-brand dedicated long-form page with full history
23. Category umbrella pages ("All Unilever ice creams", "All PepsiCo chips")
24. API access for researchers / journalists

---

## 🌐 SEO Plan (dedicated)

### Information architecture
- `/maps/hidden-brands/` — main globe + index
- `/maps/hidden-brands/<brand-slug>/` — per-brand landing (title, story, names table, FAQ, embedded globe filtered)
- `/maps/hidden-brands/country/<iso>/` — per-country landing (all brands with their local names in that country)
- `/maps/hidden-brands/compare/<a>-vs-<b>/` (P2) — brand comparison

### Target queries (exact-match user search patterns)
- "is algida the same as wall's" / "what is algida called in england"
- "why is burger king called hungry jack's in australia"
- "is axe and lynx the same"
- "what is lay's called in uk" / "walkers lay's difference"
- "opel vs vauxhall"
- "was snickers called marathon"
- "what is mr clean called in spain" / "mr proper countries"
- "ice cream brands same as wall's"
- "<brand> name in <country>" — programmatic long-tail

### On-page SEO
- Unique `<title>` per page pattern: "Is {X} the same as {Y}? The Hidden Brands Atlas"
- Meta description pattern: under 160 chars, includes both brand names and key fact
- H1 matches the PAA question format
- One focus keyword per page, LSI terms in body
- Internal linking: brand landing ↔ country landing ↔ globe (contextual links, not footer dumps)
- Breadcrumb structured data

### Structured data (JSON-LD)
- `WebApplication` on globe page
- `Article` + `FAQPage` on per-brand pages
- `Brand` / `Organization` with `sameAs` → Wikipedia + official brand URLs
- `ImageObject` with proper author/license fields for every logo (CC attribution chain)

### Technical SEO
- `sitemap.xml` includes brand + country routes (auto-generated from data)
- `robots.txt` explicit allow
- Static pre-render all landing pages (Next.js `generateStaticParams`)
- OG + Twitter card images per page
- Hreflang TR/EN once i18n ships
- Lighthouse ≥ 95 on landing pages
- Core Web Vitals: LCP < 2s (logos need lazy loading with blurhash)
- Canonical URLs to avoid duplication between `/heartbrand/` and `?brand=heartbrand`

### Content/content-marketing
- Seed article on GeographicHub blog: "We mapped every brand that secretly has a different name in your country"
- Pitch to: Marketing Brew, AdWeek, The Hustle, Reddit r/TodayILearned, r/MapPorn, Hacker News "Show HN"
- Evergreen reference positioning — become the canonical "what is X called in Y" source
- Guest-post angles: advertising trade press

### Growth loops
- Share-card export (P1) → social → organic impressions → Google signals
- Widget embed (P2) → backlinks
- "Submit a brand" (P2) → contributor loop → content

---

## Brand Expansion Wishlist (target: 30+)

### Food & snacks
- [ ] Mars ↔ Milky Way (name inversion across US/UK) ← **P0**
- [ ] Milky Way (US) ↔ Mars (UK) — same inversion, other direction
- [ ] Snickers ← Marathon (UK, until 1990) ← **P0**
- [ ] Starburst ← Opal Fruits (UK, until 1998)
- [ ] Twix ← Raider (parts of Europe until 1991)
- [ ] M&M's ← Treets (old European name)
- [ ] Dove chocolate ↔ Galaxy (UK, Ireland, Middle East)
- [ ] Carte d'Or / Viennetta — Heartbrand sub-brands
- [ ] Milo (Nestlé) — formulation variants per country

### Personal care & household
- [ ] Mr. Clean family ← **P0**
- [ ] Oil of Olay ← Oil of Ulay / Oil of Ulan (pre-2000)
- [ ] Rexona ↔ Sure / Degree / Shield
- [ ] Cif ↔ Jif / Vim / Viss
- [ ] Persil — same name, two different products (Unilever UK vs Henkel Europe — legal split!)
- [ ] Always ↔ Whisper (parts of Asia)
- [ ] Gain / Tide / Ariel — P&G laundry map

### Tech & services
- [ ] Google Pay ↔ Tez (India original) ↔ GPay
- [ ] KFC ↔ PFK (Quebec, historical)
- [ ] Domino's menu variations

### Cars
- [ ] Daewoo → Chevrolet post-acquisition mapping
- [ ] Nissan Sunny ↔ Sentra ↔ Almera
- [ ] Toyota Hilux ↔ Tacoma
- [ ] Honda ↔ Acura (NA split)
- [ ] Holden (AU, defunct) — historical

### Drinks
- [ ] Diet Coke ↔ Coca-Cola Light
- [ ] Coca-Cola Zero Sugar — formulation variants
- [ ] Budweiser (US) vs Budvar (CZ) — **trademark dispute!**

### Media
- [ ] Harry Potter: Philosopher's ↔ Sorcerer's Stone

---

## Data Quality

- [ ] Cross-verify every name/country pair with Wikipedia + brand's official site
- [ ] **Year of change** for historical rebrands — introduces timeline axis
- [ ] Separate **sub-brand** vs **full rebrand** (Kwality Wall's is a sub-brand of Wall's, not a rebrand)
- [ ] Track **discontinued regional names** for historical depth
- [ ] **Disputed-trademark** flag per brand
- [ ] Store image license metadata per logo (author / license / source URL)

---

## Visuals & UX

- [ ] Logos in legend, tooltip, and click card ← **P0**
- [ ] Logo strip at the bottom of the info card — "all 18 variants side-by-side"
- [ ] Packaging photo chips
- [ ] Zoom-to-country animation
- [ ] Mobile layout refactor (bottom drawer)
- [ ] Globe ↔ 2D map toggle
- [ ] Light theme
- [ ] Country chips above globe for quick jump
- [ ] Keyboard: `1`–`9` switch brand, `/` focus search, `esc` clear click

---

## Engagement / Virality

- [ ] **Share card PNG** — auto-generate "In my country, these N brands have hidden names"
- [ ] Quiz mode
- [ ] Timeline scrubber for historical rebrands
- [ ] "Submit a brand" form
- [ ] Embed widget with backlink

---

## Storytelling / Editorial

- [ ] One-paragraph origin story per brand
- [ ] Dedicated section for trademark dispute stories (Hungry Jack's, Budweiser, Axe/Lynx)
- [ ] Per-brand long-form page with full history

---

## Monetization

- [ ] Amazon Associates affiliate where natural (ice cream, snacks, shaving)
- [ ] Novelty "import the foreign name" angle
- [ ] AdSense — high-intent brand queries

---

## Legal / Risk

- [ ] `/legal/trademarks` page ← **P0**
- [ ] Strengthen footer disclaimer with specific fair-use rationale
- [ ] If any brand objects, have color-block-only fallback ready
- [ ] Factual / encyclopedic tone only — never imply endorsement

---

## Technical

- [ ] Pre-bundle Natural Earth GeoJSON locally (remove external CDN dep)
- [ ] Convert to lower-res TopoJSON for speed
- [ ] Cache brand data in localStorage
- [ ] Offline mode
