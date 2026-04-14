# Taste Passport — Backlog

**Slug**: `/maps/taste-passport`
**Status**: ✅ MVP live (8 countries, ~80 dishes, localStorage progress, Wikipedia image/description fetch)

> 🎨 Any redesign must pass the [DESIGN.md](../../../DESIGN.md) checklist — plain labels, icons+colors, clear primary action, empty/loading/error states, bottom-sheet on mobile.

### Design-consistency pass (P0)

- [ ] **Status icons** on dish cards (✓ tasted / ★ want / ○ not yet) — icons always visible, not just color.
- [ ] Country page: sticky progress bar at top with percentage + tasted/total + "everyday only" toggle chip.
- [ ] Onboarding on country page: "Tap a dish to mark it — your progress saves on this device."
- [ ] Empty state for dish image failure (Wikimedia miss) — silhouette placeholder, not blank gray.
- [ ] Mobile: bigger tap targets on status buttons; swipe gestures (already in TODO).
- [ ] Plain-language: replace "Tasted" color-only with "Tasted ✓" label-with-icon.

---

## 🚀 Priority Order

### P0 — Now (next batch)

1. **Tag existing 80 dishes** with `iconic` / `everyday` / `street` / `dessert` / `drink` — foundation for every later feature.
2. **Add 8–10 "everyday" dishes per existing country** per the chef-research section below → 80 → 160 dishes without adding countries. Biggest authenticity upgrade.
3. **Shrink cards, denser grid** — 4 columns desktop / 2 columns mobile, square thumbnails. Easier to scan, more Pinterest-like.
4. **"Everyday only" filter chip** — the authenticity switch. Flip it and the map becomes what locals actually eat.
5. **Per-country SEO landing pages** — `/maps/taste-passport/<slug>/` upgraded with static-generated metadata, FAQ, OG images. (Route already exists, needs SEO treatment.)
6. **Dish detail modal** (replaces full-page nav) — big image, long story, status buttons, keyboard shortcuts `T`/`W`/`N`.
7. **Dynamic OG image per country** — shows flag + "X signature dishes of Y" — used for social shares and search previews.

### P1 — Next

8. **Add 5 new countries**: Greece, Vietnam, Georgia, Lebanon, Peru (chosen for strong everyday-food cultures and geographic gap filling).
9. **Shareable passport image** — downloadable PNG "I've tasted X dishes from Y countries" for virality.
10. **Per-dish SEO pages** (`/maps/taste-passport/<country>/<dish>/`) — long description + history + regional variants + recipe schema. Huge long-tail.
11. **Dish metadata enrichment**: `region`, `mainIngredient`, `vegetarian`/`vegan`/`halal`/`glutenFree`, `typicalMeal`, `disputedOriginWith`.
12. **Diet filter chips**: vegetarian / vegan / halal / gluten-free.
13. **Hand-picked Wikimedia Commons images** per dish (replace auto-fetch with curated ones, metadata stored in JSON).
14. **Personal dashboard page** — world map colored by completion (light → dark by %).
15. **"Disputed origin" badge** on hummus/baklava/dolma/pilaf/pho/ceviche etc.

### P2 — Later

16. 15–20 more countries (Europe + Asia + Middle East + Africa + Americas)
17. Regional sub-cuisine split for India, Italy, China (by region cards)
18. Achievement badges (Mediterranean Master, 100 Tastes, Street Food Warrior…)
19. Streak counter
20. Daily "Chef's Pick" dish of the day
21. Pronunciation audio (native speaker clips)
22. "Make it at home" recipe links (Wikibooks / external)
23. i18n TR/EN
24. Blog articles "10 must-try dishes in X"

### P3 — Someday

25. Account + cross-device sync (Supabase / D1)
26. Friends leaderboard + compare passports
27. Embedded "watch it being made" video (YouTube CC)
28. Chef / local-writer contributor system
29. Sponsored "featured country" (disclosed)

---

## 🌐 SEO Plan (dedicated)

### Information architecture
- `/maps/taste-passport/` — country index + global progress
- `/maps/taste-passport/<country-slug>/` — country page (exists, needs metadata upgrade)
- `/maps/taste-passport/<country>/<dish-slug>/` (P1) — per-dish long-form page
- `/maps/taste-passport/guides/<country>/everyday/` (P2) — "What locals actually eat in X"
- `/maps/taste-passport/dashboard/` — personal passport (P1)

### Target queries (evergreen travel + food)
- "signature dishes of <country>" / "famous food in <country>"
- "what to eat in <country>" / "must-try food in <country>"
- "traditional <country> food"
- "what is <dish>" / "origin of <dish>"
- "is <dish> <country_a> or <country_b>" (disputed origins)
- "vegetarian food in <country>"
- "<country> breakfast food" / "<country> street food"
- "<dish> recipe"

### On-page SEO
- Country `<title>`: "10 Signature Dishes of Japan — What to Eat (and What Locals Actually Eat) · Taste Passport"
- Meta: includes country + emotional hook + number
- H1 matches the question-format query
- Each dish section has its own anchor with `id=<dish-slug>` for jump-to links
- Dish pages: rich intro + regional context + pronunciation + where to eat authentically
- Internal linking: country ↔ dish ↔ similar dishes elsewhere ↔ "disputed origin" partner countries

### Structured data (JSON-LD)
- `WebApplication` on index
- `TouristDestination` or `Country` on country pages
- `FoodEstablishment`/`MenuItem` for dishes (approximation)
- `Recipe` on dish pages when a recipe section is included
- `FAQPage` on country pages ("What's the national dish of X?", "Is X dish vegetarian?")
- `BreadcrumbList` on all nested pages

### Technical SEO
- Static pre-render every country and dish page (`generateStaticParams`)
- `sitemap.xml` with all countries + dishes
- OG image per country and per dish (dynamic `@vercel/og`)
- Hreflang TR/EN at minimum (dish names in both)
- Canonicals
- Lighthouse ≥ 95 on static pages
- LCP < 2s — defer image loading, blurhash placeholders
- Schema-valid Recipe markup for rich snippets in Google

### Content marketing
- Evergreen blog:
  - "What locals actually eat in Japan (that tourists miss)"
  - "Every country's most underrated national dish"
  - "10 dishes that started a border dispute"
- Pitches: Atlas Obscura, Eater, Condé Nast Traveler, r/food, r/AskCulinary, r/travel
- Pinterest — food photos are Pinterest gold; create branded boards per country
- Instagram/TikTok shorts: "One dish from every continent" — hook to site

### Growth loops
- Shareable passport PNG → social impressions → organic site visits
- Dish completion prompts: "Tell a friend" modal after marking 10 dishes
- Return visitor streaks → daily habit → email capture (P2)
- Recipe schema → recipe-rich-snippet in Google → click-through

---

## 🎯 Editorial Principle: Local-first, not Tourist-first

**The single most important content rule.** Most "famous" dishes are tourist-driven; locals rarely eat them weekly. A true Taste Passport must reflect what people actually cook at home alongside the iconic.

Tag every dish with one or more of:
- `iconic` — what foreigners know (Haggis, Pad Thai, Carbonara, Sushi)
- `everyday` — what locals actually eat daily/weekly (Khao Man Gai, Kuru Fasulye, Curry Rice, Dal)
- `special-occasion` — weddings, holidays, festivals (Chiles en Nogada, Cranachan)
- `street-food` — daily informal
- `regional` — tied to one province/city, not the whole country

The UI's "Everyday only" filter is the **authenticity switch**. Visitors using it see what their host family might actually serve them.

---

## 🔬 Chef-level Research: Missing "Everyday" Dishes

(Per current 8 countries — to be added in P0.)

### 🇹🇷 Turkey
Kuru Fasulye · Mercimek Çorbası · Pilav · Dolma/Sarma · Börek (su, sigara, kol) · Gözleme · Çiğ Köfte · Kokoreç · Türk Kahvaltısı (as concept) · Ayran · Tas Kebabı / Karnıyarık · Pişmaniye/Lokum/Helva

### 🇮🇹 Italy
Pasta al Pomodoro · Cacio e Pepe · Pasta e Fagioli · Minestrone · Focaccia · Pasta alla Norma (Sicily) · Orecchiette con Cime di Rapa (Puglia) · Pesto Genovese · Cotoletta Milanese · Bistecca Fiorentina · Panzanella · Saltimbocca · Cannoli

### 🇯🇵 Japan (daily eats, not sushi)
Karē Raisu · Gyūdon · Onigiri · Tonkatsu · Katsudon · Oyakodon · Oden · Soba / Udon · Tamago sando · Natto gohan · Hambāgu · Chawanmushi

### 🇲🇽 Mexico
Chilaquiles · Tacos de Guisado · Sopes / Huaraches / Gorditas / Tlayudas · Tortas (ahogada / pambazo) · Aguachile · Cochinita Pibil · Barbacoa · Mole Verde / Negro / Amarillo · Tostadas · Atole / Champurrado / Tejate · Pan Dulce

### 🇮🇳 India (home meals — 90%)
Dal · Rajma Chawal · Khichdi · Poha · Upma · Idli + Sambar + Coconut Chutney · Aloo Paratha · Thali (concept) · Masala Chai · Vada Pav · Misal Pav · Pav Bhaji · Chaat family (bhel, sev, dahi, aloo tikki) · Hyderabadi vs Kolkata Biryani · Goan / Bengali / Keralan Fish Curry · Dhokla · Pongal

### 🇹🇭 Thailand (daily local eats)
Pad Kra Pao · Khao Man Gai · Khao Kha Moo · Khao Soi (Chiang Mai) · Kuay Teow Nam/Hang · Laab / Nam Tok / Kai Yang (Isaan) · Gaeng Keow Wan (authentic) · Gaeng Massaman with roti · Jok · Kanom Krok · Gaeng Jued

### 🇫🇷 France
Jambon-Beurre · Steak Frites · Pot-au-Feu · Blanquette de Veau · Cassoulet · Confit de Canard · Raclette / Tartiflette / Fondue · Gratin Dauphinois · Salade Niçoise · Pain au Chocolat · Tarte Tatin · Boudin Noir · Plateau de Fromages · Croque Monsieur / Madame

### 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland
Fish and Chips · Full Scottish Breakfast · Mince and Tatties · Lorne Sausage · Chicken Tikka Masala (Glasgow) · Porridge · Smoked Salmon · Whisky (drink) · Clootie Dumpling · Bridie (Forfar)

---

## 🗺 Country Expansion Wishlist (target: 40+)

**Europe** (12): Greece · Spain · Portugal · Germany · England · Ireland · Poland · Russia · Hungary · Czech · Austria · Sweden · Norway · Belgium · Netherlands

**Asia** (12): Vietnam · China (or split: Sichuan / Cantonese / Shanghainese / Northern) · S. Korea · Taiwan · Hong Kong · Singapore · Malaysia · Indonesia · Philippines · Sri Lanka · Pakistan · Bangladesh · Nepal · Myanmar

**Middle East** (6): Lebanon · Syria · Iran · Israel/Palestine · UAE/Gulf · Jordan

**Africa** (5): Morocco · Egypt · Ethiopia · Nigeria · Senegal · Tunisia · South Africa

**Americas** (7): Peru · Brazil · Argentina · Colombia · Cuba · Jamaica · USA-regional (Southern / Tex-Mex / Cajun / Italian-American / BBQ / Soul Food) · Canada

**Oceania** (2): Australia · New Zealand

**Caucasus / Central Asia** (4): Georgia (khachapuri, khinkali — deserves spotlight) · Armenia · Azerbaijan · Uzbekistan (plov)

---

## 🎨 UX: Easier to Use · Denser · Smaller Visuals

- [ ] Smaller square thumbnails, 4-col desktop / 2-col mobile (P0)
- [ ] Dish card tap → modal (not page navigation) with big image + long description (P0)
- [ ] Status buttons icon-only on cards; expanded to text in modal
- [ ] Sticky progress bar at top of country page while scrolling
- [ ] "Everyday only" toggle chip (P0)
- [ ] Category chips: `iconic` / `everyday` / `street` / `dessert` / `drink`
- [ ] Keyboard shortcuts `T` / `W` / `N` inside modal (P0)
- [ ] Mobile swipe gestures: left = not yet, right = tasted, up = want
- [ ] Blurhash placeholders for images
- [ ] Pre-cache Wikipedia summaries at build time (no runtime fetch)
- [ ] Undo toast after marking

---

## 🎮 Gamification

- [ ] Category badges (Mediterranean Master, Street Food Warrior, Home Cook, 100 Tastes)
- [ ] Continent badges
- [ ] Streak counter
- [ ] Milestones popups at 10 / 50 / 100 / 500
- [ ] Daily "Chef's Pick"
- [ ] Random dish button
- [ ] Page-turn / stamp animation on country completion
- [ ] Leaderboard (later, needs account)

---

## 🧠 Dish Metadata Schema (expand)

```json
{
  "id", "name", "wikiTitle",
  "tags": ["everyday", "street"],
  "region": "Sicily" | "Oaxaca" | null,
  "mainIngredient": "rice" | "lamb" | …,
  "vegetarian": true, "vegan": false,
  "halal": true, "glutenFree": false,
  "typicalMeal": "breakfast|lunch|dinner|snack|dessert|drink",
  "difficulty": "common|regional|rare",
  "disputedOriginWith": ["Greece", "Armenia"],
  "imageFile": "Commons filename", "imageAuthor": "...",
  "imageLicense": "CC BY-SA 3.0"
}
```

---

## 🔎 Editorial Process

- [ ] Per-country editorial checklist template
- [ ] Native speaker / local food-writer consultation per country
- [ ] Cross-reference: academic food-studies papers, local food blogs (not TripAdvisor)
- [ ] Test: "Would a resident eat this at least monthly at home or at a local spot?"
- [ ] Flag tourist-traps (e.g., dondurma ice-cream performance is a Turkish tourist act; locals eat Mado without the show)
- [ ] Handle disputed origins with cross-reference tags

---

## 🖼 Images: Quality + Licensing

- [ ] Hand-pick Wikimedia Commons images (P1) — replace auto-fetch
- [ ] Store author / license / source URL per image in JSON
- [ ] Prefer CC BY / CC0 over CC BY-SA where available
- [ ] Blurhash placeholders (P1)
- [ ] Commission branded photo set for top 100 dishes (later)

---

## 🔊 Depth (later)

- [ ] Pronunciation audio (P2)
- [ ] 30-sec "how it's made" video embed (YouTube CC)
- [ ] "Where to eat it authentically" restaurant links
- [ ] "Ask a local" quotes
- [ ] Regional inset map on country page

---

## 💰 Monetization

- [ ] Affiliate: country cookbooks (Amazon Associates)
- [ ] Affiliate: food tours (GetYourGuide, Viator)
- [ ] Affiliate: regional ingredient kits (international grocers)
- [ ] Sponsored "featured country" (disclosed)
- [ ] AdSense — food-niche CPM is strong
