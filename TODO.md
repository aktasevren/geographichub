# GeographicHub — Site-wide Backlog

Cross-cutting work that isn't specific to one map.
Per-app backlogs live in `app/maps/<slug>/TODO.md`. See [ROADMAP.md](ROADMAP.md) for the app index.

> 🎨 **All design work must follow [DESIGN.md](DESIGN.md)** — the GeographicHub UX principles. Every new map and every redesign goes through that checklist before shipping.

---

## 🚀 Priority Order

### P0 — Now (launch readiness)

1. **Domain purchase** — `maphub.app` / `.io` / `.studio` (`.com` likely taken). Without this, SEO work is orphaned.
2. **Production deploy** — Vercel (Next.js fits out of the box). Point domain at it.
3. **`metadataBase` update** in `app/layout.tsx` to the real domain.
4. **Privacy Policy page** (`/privacy`) — AdSense and KVKK/GDPR require it.
5. **Cookie consent banner** — KVKK (Türkiye) + GDPR.
6. **About page** (`/about`) — short, one-paragraph, AdSense likes E-E-A-T signals.
7. **Contact page** (`/contact`) — mailto + form. Trust signal.
8. **Dynamic `sitemap.xml`** — auto-include every map route + dynamic landing pages.
9. **`robots.txt`** — explicit allow + sitemap reference.
10. **Favicon set** — 32 / 192 / 512 PNGs alongside existing `favicon.svg`.
11. **Google Search Console** — verify the domain, submit sitemap.
12. **Plausible or GA4** — at least know what people do on the site.

### ✅ Shipped this session

- `app/sitemap.ts` — dynamic sitemap, includes all maps + Taste Passport countries
- `app/robots.ts` — production-ready
- Site-wide JSON-LD (`WebSite` + `Organization`) in `app/layout.tsx`
- Per-map `layout.tsx` with metadata + `WebApplication` JSON-LD for ISS, Visa-Free, Taste Passport, Hidden Brands
- Homepage stat strip (4 maps · 199 passports · 80+ dishes · 18 names)
- "NEW" ribbon on Visa-Free tile (newest map)
- Hidden Brands: legend moved to permanent bottom strip (DESIGN.md compliance)

### P1 — Next (SEO foundation)

13. ~~**Per-page `generateMetadata()`**~~ — ✅ done via per-map layouts
14. **Dynamic OG image system** (`@vercel/og`) — reusable component per-app. Still P1.
15. ~~**JSON-LD structured data**~~ — ✅ base done; extend with `BreadcrumbList` on nested pages.
16. **Internal linking system** — related-maps block at the bottom of each map.
17. **Shared map-page shell component** — header, info-panel chrome, credit footer, extracted from ISS/taste-passport/hidden-brands duplication.
18. **Error boundary + offline state**.
19. **Lighthouse pass ≥ 95** on all pages (perf + a11y).

### P2 — Growth

20. **Blog / articles** section (`/blog/`) — evergreen long-tail.
21. **Newsletter signup** (Buttondown or Resend).
22. **"Was this useful?" thumbs** on each map (optional analytics pulse).
23. **Homepage filter + tags** (Live / 3D Globe / 2D Atlas / Gamified / Trivia).
24. **Search across maps**.
25. **i18n** (next-intl) — TR + EN. Turkish search terms are underserved on most GeographicHub topics.
26. **RSS** feed for new maps / updates.

### P3 — Monetization

27. **AdSense** account + `ads.txt` + strategic non-intrusive slots.
28. **Affiliate** integrations per relevant map (Amazon Associates, GetYourGuide, travel SIM).
29. **"Featured map of the week"**.

### P4 — Infra / Tech debt

30. Edge cache / KV layer in front of external APIs (preserve rate limits).
31. CI: type-check + build on PR.
32. Uptime monitoring (UptimeRobot).
33. Service Worker / PWA installable.

---

## 🌐 Cross-cutting SEO Strategy

### Philosophy
GeographicHub's moat is **depth + breadth**: many interactive maps + per-item landing pages = enormous long-tail surface. We aim for the answer position on very specific queries ("ISS passes over Istanbul", "signature dishes of Vietnam", "is Algida the same as Wall's") where generic blogs lose.

### Baseline every page gets
- Unique title under 60 chars with primary keyword + GeographicHub suffix
- Meta description under 160 chars
- Canonical tag
- OG image (dynamic)
- Schema.org where applicable
- Single H1 matching user intent
- Internal links to 2+ related maps/sections

### Programmatic SEO (the real engine)
- ISS → per-city landing pages (~50)
- Taste Passport → per-country (~40) + per-dish (~500)
- Hidden Brands → per-brand (~30) + per-country (~50)
- Target: 500+ indexable landing pages by end of first expansion round

### Technical baseline
- Static pre-rendering everywhere possible (Next.js `generateStaticParams`)
- `sitemap.xml` regenerated on build
- Proper HTTP status codes (404 for unknown slugs)
- Structured redirects instead of soft 404s
- No unnecessary query-param routes (use path segments)

### Outreach / backlinks
- Show HN for each new map (one at a time)
- Subreddit posting where on-topic (r/space, r/food, r/MapPorn, r/TodayILearned, r/dataisbeautiful)
- Pitch to niche newsletters per topic (Marketing Brew for brands, Atlas Obscura for food)
- Embed widgets with backlink requirements (future)

---

## Legal / Compliance

- [ ] Privacy Policy (P0)
- [ ] Cookie consent (P0)
- [ ] Trademark / fair-use disclaimer (for Hidden Brands)
- [ ] Data attribution page (`/legal/data-sources`) listing every upstream license
- [ ] AdSense terms compliance (no prohibited content)

## Homepage Design

- [ ] **Card-specific animated motifs polish** — tune timing/size of ISS orbit spin, taste stamps, brand blobs, visa flight arcs (P1)
- [ ] **Hover parallax** — subtle mouse-follow depth on each tile (P2)
- [ ] **Live mini-previews** — ISS tile shows current ISS lat/lng, Visa-Free tile shows "47 new visa-free destinations added this year" (P2)
- [ ] **Bento layout iterations** — try 2×3 with 1 featured tile, test engagement (P2)
- [ ] **Hero redesign** — rotating quote-of-the-day or "today's feature" above map grid (P2)
- [ ] **Filter / tag chips** above grid: Live · 3D Globe · Gamified · Trivia · Travel (P1)
- [ ] **Search across maps** (P2)
- [ ] **"What's new"** ribbon on the newest map tile — auto-flag based on publish date (P1)
- [ ] **Featured-map-of-the-week** hero band (P2)
- [ ] **Homepage stat strip** — "4 maps · X dishes catalogued · Y passports indexed · Z brands mapped" living counter (P1)
- [ ] **Mobile-first tile polish** — motifs rescale appropriately, long blurbs truncate gracefully (P1)
- [ ] **Dark / light theme toggle** header-level (P2)
- [ ] **Keyboard-accessible tile navigation** — focus ring, enter to open (P1)
- [ ] **Loading states for images** (motifs are inline SVG so not an issue, but for future photo tiles) (P2)
- [ ] **Scroll-triggered motif animations** — tiles "wake up" as they come into view (P2)

## Content & Discovery

- [ ] Tag/filter system on homepage (P2)
- [ ] Search across maps (P2)
- [ ] Featured map of the week (P3)
- [ ] RSS feed (P2)

## Shared UI / Tech

- [ ] Map-page shell component (P1)
- [ ] Shared loading / error components (P1)
- [ ] Theme tokens consolidation (already partial)
- [ ] i18n (P2)
- [ ] A11y audit

## Infra

- [ ] Edge cache / KV layer (P4)
- [ ] CI (P4)
- [ ] Uptime monitoring (P4)
- [ ] PWA (P4)

---

## Launch-checklist quick view (P0 compressed)

1. Domain
2. Deploy
3. Privacy + cookie banner
4. sitemap + robots
5. Search Console + analytics

Everything else is a nice-to-have until these five are done.
