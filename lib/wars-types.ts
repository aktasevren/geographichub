import { z } from "zod";

// Zod schemas (runtime source of truth)

export const WarEventKind = z.enum([
  "battle",
  "siege",
  "congress",
  "treaty",
  "occupation",
  "liberation",
  "armistice",
  "landing",
  "event",
]);
export type WarEventKind = z.infer<typeof WarEventKind>;

export const WarEventSide = z.enum([
  "victory-a",
  "victory-b",
  "draw",
  "political",
  "occupation",
  "armistice",
  "treaty",
]);
export type WarEventSide = z.infer<typeof WarEventSide>;

export const WarEra = z.enum([
  "ancient",
  "medieval",
  "early-modern",
  "19th-century",
  "20th-century",
  "21st-century",
]);
export type WarEra = z.infer<typeof WarEra>;

export const WarRegion = z.enum([
  "europe",
  "middle-east",
  "asia",
  "africa",
  "americas",
  "global",
]);
export type WarRegion = z.infer<typeof WarRegion>;

// Date format: allows BCE ("-NNNN"), CE, with optional month and day
const fuzzyDateRegex = /^-?\d{1,4}(-\d{2}(-\d{2})?)?$/;

export const WarSide = z.object({
  id: z.enum(["A", "B", "C"]),
  label: z.string().min(1),
  labelTr: z.string().min(1),
  countries: z
    .array(
      z.object({
        name: z.string().min(1),
        nameTr: z.string().min(1),
        flagUrl: z.string().url().optional(),
        flagFallback: z.enum(["coat", "emblem"]).optional(),
      })
    )
    .min(1),
  commanders: z.array(z.string()).min(1).max(12),
  result: z.enum(["victor", "defeated", "withdrew", "dissolved"]),
});
export type WarSide = z.infer<typeof WarSide>;

export const WarEvent = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  nameTr: z.string().optional(),
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
  date: z.string().regex(fuzzyDateRegex),
  dateEnd: z.string().regex(fuzzyDateRegex).optional(),
  kind: WarEventKind,
  side: WarEventSide,
  order: z.number().int().positive(),
  summary: z.string().min(1).max(320),
  summaryTr: z.string().max(320).optional(),
  story: z.string().min(100),
  storyTr: z.string().min(100),
  forces: z
    .object({ sideA: z.number(), sideB: z.number() })
    .optional(),
  casualties: z
    .object({ sideA: z.number(), sideB: z.number() })
    .optional(),
  commanders: z
    .object({
      sideA: z.array(z.string()),
      sideB: z.array(z.string()),
    })
    .optional(),
  wikipediaEn: z.string().url().optional(),
  wikipediaTr: z.string().url().optional(),
  imageCredit: z.string().optional(),
});
export type WarEvent = z.infer<typeof WarEvent>;

export const War = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  nameTr: z.string().optional(),
  startYear: z.number().int(),
  endYear: z.number().int(),
  era: WarEra,
  region: WarRegion,
  tags: z.array(z.string()).optional(),
  blurb: z.string().min(1).max(400),
  blurbTr: z.string().max(400).optional(),
  sides: z.array(WarSide).min(2).max(3),
  casualties: z.object({
    militaryDead: z.number().int().nonnegative(),
    civilianDead: z.number().int().nonnegative().optional(),
    wounded: z.number().int().nonnegative().optional(),
    pow: z.number().int().nonnegative().optional(),
    source: z.string().min(1),
  }),
  participantCount: z.number().int().nonnegative().optional(),
  opening: z.string().min(10),
  openingTr: z.string().min(10),
  outcome: z.string().min(40),
  outcomeTr: z.string().min(40),
  turningPointReason: z.string().min(40),
  turningPointReasonTr: z.string().min(40),
  events: z.array(WarEvent).min(1),
});
export type War = z.infer<typeof War>;

export const WarIndexEntry = z.object({
  slug: z.string(),
  name: z.string(),
  nameTr: z.string().optional(),
  startYear: z.number().int(),
  endYear: z.number().int(),
  eventCount: z.number().int().nonnegative(),
  blurb: z.string().max(400),
  blurbTr: z.string().max(400).optional(),
  era: WarEra.optional(),
  region: WarRegion.optional(),
  tags: z.array(z.string()).optional(),
  sideAFlagUrl: z.string().url().optional(),
  sideBFlagUrl: z.string().url().optional(),
  militaryDead: z.number().int().nonnegative().optional(),
});
export type WarIndexEntry = z.infer<typeof WarIndexEntry>;

export const WarIndex = z.object({
  wars: z.array(WarIndexEntry),
});
export type WarIndex = z.infer<typeof WarIndex>;

// Label maps (UI-facing)

export const ERA_LABEL: Record<WarEra, { tr: string; en: string }> = {
  ancient: { tr: "Antik", en: "Ancient" },
  medieval: { tr: "Orta Çağ", en: "Medieval" },
  "early-modern": { tr: "Erken Modern", en: "Early Modern" },
  "19th-century": { tr: "19. Yüzyıl", en: "19th Century" },
  "20th-century": { tr: "20. Yüzyıl", en: "20th Century" },
  "21st-century": { tr: "21. Yüzyıl", en: "21st Century" },
};

export const REGION_LABEL: Record<WarRegion, { tr: string; en: string }> = {
  europe: { tr: "Avrupa", en: "Europe" },
  "middle-east": { tr: "Orta Doğu", en: "Middle East" },
  asia: { tr: "Asya", en: "Asia" },
  africa: { tr: "Afrika", en: "Africa" },
  americas: { tr: "Amerika", en: "Americas" },
  global: { tr: "Küresel", en: "Global" },
};

// Kind metadata — labels only; colors/icons now live in wars-noir components
export const KIND_LABEL: Record<WarEventKind, { tr: string; en: string }> = {
  battle: { tr: "Muharebe", en: "Battle" },
  siege: { tr: "Kuşatma", en: "Siege" },
  congress: { tr: "Kongre", en: "Congress" },
  treaty: { tr: "Antlaşma", en: "Treaty" },
  occupation: { tr: "İşgal", en: "Occupation" },
  liberation: { tr: "Kurtuluş", en: "Liberation" },
  armistice: { tr: "Mütareke", en: "Armistice" },
  landing: { tr: "Çıkarma", en: "Landing" },
  event: { tr: "Olay", en: "Event" },
};

export const SIDE_LABEL: Record<WarEventSide, { tr: string; en: string }> = {
  "victory-a": { tr: "Zafer", en: "Victory" },
  "victory-b": { tr: "Yenilgi", en: "Defeat" },
  draw: { tr: "Kararsız", en: "Indecisive" },
  political: { tr: "Siyasi", en: "Political" },
  occupation: { tr: "İşgal", en: "Occupation" },
  armistice: { tr: "Mütareke", en: "Armistice" },
  treaty: { tr: "Antlaşma", en: "Treaty" },
};

export function kindLabel(k: WarEventKind, locale: "tr" | "en"): string {
  return KIND_LABEL[k][locale];
}

export function sideLabel(s: WarEventSide, locale: "tr" | "en"): string {
  return SIDE_LABEL[s][locale];
}

// Fuzzy date helpers — BCE-aware.
// Accepts "YYYY", "YYYY-MM", "YYYY-MM-DD", or "-YYYY"/"-YYYY-MM" for BCE.
export function parseFuzzyDate(d: string): {
  year: number;
  month: number;
  day: number;
  t: number;
} {
  const m = d.match(/^(-?\d{1,4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (!m) return { year: 0, month: 0, day: 0, t: 0 };
  const y = parseInt(m[1], 10);
  const mo = m[2] ? parseInt(m[2], 10) : 1;
  const da = m[3] ? parseInt(m[3], 10) : 1;
  // Sortable: shift year by +10000 so BCE years stay negative-sortable consistently
  const t = y * 10000 + mo * 100 + da;
  return { year: y, month: mo, day: da, t };
}

export function formatFuzzyDate(d: string): string {
  const m = d.match(/^(-?\d{1,4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (!m) return d;
  const y = m[1];
  const mo = m[2];
  const da = m[3];
  const yearLabel =
    y.startsWith("-")
      ? `${y.slice(1)} BC`
      : y;
  if (!mo) return yearLabel;
  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const mon = months[parseInt(mo, 10)] || mo;
  if (!da) return `${mon} ${yearLabel}`;
  return `${parseInt(da, 10)} ${mon} ${yearLabel}`;
}
