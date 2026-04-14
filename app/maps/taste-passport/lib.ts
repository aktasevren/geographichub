export type DishTag =
  | "iconic"
  | "everyday"
  | "street"
  | "dessert"
  | "drink";

export type Dish = {
  id: string;
  name: string;
  wikiTitle: string;
  tags?: DishTag[];
};

export type Country = {
  slug: string;
  name: string;
  flag: string;
  blurb: string;
  dishes: Dish[];
};

export type PassportData = {
  version: number;
  countries: Country[];
};

export type TasteStatus = "tasted" | "want" | null;

const STORAGE_KEY = "taste-passport-v1";

export function loadProgress(): Record<string, TasteStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStatus(key: string, status: TasteStatus) {
  if (typeof window === "undefined") return;
  const all = loadProgress();
  if (status === null) delete all[key];
  else all[key] = status;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function dishKey(countrySlug: string, dishId: string) {
  return `${countrySlug}:${dishId}`;
}

export type WikiSummary = {
  extract: string;
  thumbnail?: string;
};

const summaryCache = new Map<string, WikiSummary>();

export async function fetchSummary(title: string): Promise<WikiSummary> {
  if (summaryCache.has(title)) return summaryCache.get(title)!;
  try {
    const r = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
      { headers: { accept: "application/json" } }
    );
    if (!r.ok) throw new Error();
    const d = await r.json();
    const s: WikiSummary = {
      extract: d.extract || "",
      thumbnail: d.thumbnail?.source || d.originalimage?.source,
    };
    summaryCache.set(title, s);
    return s;
  } catch {
    return { extract: "" };
  }
}

export function countryProgress(
  country: Country,
  progress: Record<string, TasteStatus>
) {
  let tasted = 0;
  let want = 0;
  for (const d of country.dishes) {
    const st = progress[dishKey(country.slug, d.id)];
    if (st === "tasted") tasted++;
    else if (st === "want") want++;
  }
  return { tasted, want, total: country.dishes.length };
}
