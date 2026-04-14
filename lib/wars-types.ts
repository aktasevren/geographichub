export type WarEventKind =
  | "battle"
  | "siege"
  | "congress"
  | "treaty"
  | "occupation"
  | "liberation"
  | "armistice"
  | "landing"
  | "event";

export type WarEventSide =
  | "victory-a"
  | "victory-b"
  | "draw"
  | "political"
  | "occupation"
  | "armistice"
  | "treaty";

export type WarEvent = {
  id: string;
  name: string;
  nameTr?: string;
  lat: number;
  lng: number;
  date: string; // YYYY, YYYY-MM, or YYYY-MM-DD
  dateEnd?: string;
  kind: WarEventKind;
  side: WarEventSide;
  summary: string;
  summaryTr?: string;
  wikipediaEn?: string;
  wikipediaTr?: string;
};

export type War = {
  slug: string;
  name: string;
  nameTr?: string;
  startYear: number;
  endYear: number;
  blurb: string;
  blurbTr?: string;
  events: WarEvent[];
};

export type WarIndexEntry = {
  slug: string;
  name: string;
  nameTr?: string;
  startYear: number;
  endYear: number;
  eventCount: number;
  blurb: string;
  blurbTr?: string;
};

// Visual mapping — icons + colors + localized labels
export const KIND_META: Record<
  WarEventKind,
  { icon: string; color: string; labelEn: string; labelTr: string }
> = {
  battle:     { icon: "⚔",  color: "#dc2626", labelEn: "Battle",     labelTr: "Muharebe" },
  siege:      { icon: "🏰", color: "#f97316", labelEn: "Siege",      labelTr: "Kuşatma" },
  congress:   { icon: "🏛",  color: "#f59e0b", labelEn: "Congress",   labelTr: "Kongre" },
  treaty:     { icon: "🕊",  color: "#06b6d4", labelEn: "Treaty",     labelTr: "Antlaşma" },
  occupation: { icon: "🚩", color: "#a855f7", labelEn: "Occupation", labelTr: "İşgal" },
  liberation: { icon: "✨", color: "#22c55e", labelEn: "Liberation", labelTr: "Kurtuluş" },
  armistice:  { icon: "✋", color: "#94a3b8", labelEn: "Armistice",  labelTr: "Mütareke" },
  landing:    { icon: "⚓", color: "#ec4899", labelEn: "Landing",    labelTr: "Çıkarma" },
  event:      { icon: "⭐", color: "#eab308", labelEn: "Event",      labelTr: "Olay" },
};

export const SIDE_META: Record<
  WarEventSide,
  { color: string; labelEn: string; labelTr: string }
> = {
  "victory-a":  { color: "#22c55e", labelEn: "Victory",          labelTr: "Zafer" },
  "victory-b":  { color: "#ef4444", labelEn: "Defeat",           labelTr: "Yenilgi" },
  "draw":       { color: "#94a3b8", labelEn: "Indecisive",       labelTr: "Kararsız" },
  "political":  { color: "#f59e0b", labelEn: "Political",        labelTr: "Siyasi" },
  "occupation": { color: "#a855f7", labelEn: "Occupation",       labelTr: "İşgal" },
  "armistice":  { color: "#06b6d4", labelEn: "Armistice",        labelTr: "Mütareke" },
  "treaty":     { color: "#0ea5e9", labelEn: "Treaty",           labelTr: "Antlaşma" },
};

export function kindLabel(k: WarEventKind, locale: "tr" | "en"): string {
  return locale === "tr" ? KIND_META[k].labelTr : KIND_META[k].labelEn;
}

export function sideLabel(s: WarEventSide, locale: "tr" | "en"): string {
  return locale === "tr" ? SIDE_META[s].labelTr : SIDE_META[s].labelEn;
}

// Parse fuzzy Wikidata-style date into sortable numeric index + year
export function parseFuzzyDate(d: string): { year: number; month: number; day: number; t: number } {
  const m = d.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (!m) return { year: 0, month: 0, day: 0, t: 0 };
  const y = parseInt(m[1], 10);
  const mo = m[2] ? parseInt(m[2], 10) : 1;
  const da = m[3] ? parseInt(m[3], 10) : 1;
  return { year: y, month: mo, day: da, t: y * 10000 + mo * 100 + da };
}

export function formatFuzzyDate(d: string): string {
  const m = d.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
  if (!m) return d;
  const y = m[1];
  const mo = m[2];
  const da = m[3];
  if (!mo) return y;
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mon = months[parseInt(mo, 10)] || mo;
  if (!da) return `${mon} ${y}`;
  return `${parseInt(da, 10)} ${mon} ${y}`;
}
