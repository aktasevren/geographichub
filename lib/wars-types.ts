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

// Visual mapping — icons + colors + labels
export const KIND_META: Record<
  WarEventKind,
  { icon: string; color: string; label: string }
> = {
  battle:      { icon: "⚔",  color: "#dc2626", label: "Battle" },
  siege:       { icon: "🏰", color: "#f97316", label: "Siege" },
  congress:    { icon: "🏛",  color: "#f59e0b", label: "Congress" },
  treaty:      { icon: "🕊",  color: "#06b6d4", label: "Treaty" },
  occupation:  { icon: "🚩", color: "#a855f7", label: "Occupation" },
  liberation:  { icon: "✨", color: "#22c55e", label: "Liberation" },
  armistice:   { icon: "✋", color: "#94a3b8", label: "Armistice" },
  landing:     { icon: "⚓", color: "#ec4899", label: "Landing" },
  event:       { icon: "⭐", color: "#eab308", label: "Event" },
};

export const SIDE_META: Record<
  WarEventSide,
  { color: string; label: string }
> = {
  "victory-a":  { color: "#22c55e", label: "Victory · our side" },
  "victory-b":  { color: "#ef4444", label: "Defeat · our side" },
  "draw":       { color: "#94a3b8", label: "Indecisive" },
  "political":  { color: "#f59e0b", label: "Political" },
  "occupation": { color: "#a855f7", label: "Occupation" },
  "armistice":  { color: "#06b6d4", label: "Armistice" },
  "treaty":     { color: "#0ea5e9", label: "Treaty" },
};

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
