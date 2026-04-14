import fs from "node:fs";
import path from "node:path";

export type BrandName = {
  name: string;
  color: string;
  countries: string[];
  wikiTitle?: string;
  note?: string;
};

export type Brand = {
  slug: string;
  title: string;
  product: string;
  parent: string;
  symbol: string;
  blurb: string;
  story?: string;
  wikiTitle?: string;
  names: BrandName[];
};

let cached: Brand[] | null = null;

export function loadBrands(): Brand[] {
  if (cached) return cached;
  const p = path.join(process.cwd(), "public", "data", "hidden-brands.json");
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  cached = j.brands as Brand[];
  return cached;
}

export function getBrand(slug: string): Brand | undefined {
  return loadBrands().find((b) => b.slug === slug);
}
