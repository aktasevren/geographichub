import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";

type Dish = { id: string; name: string; wikiTitle: string };
type Country = { slug: string; name: string; flag: string; blurb: string; dishes: Dish[] };

function loadCountries(): Country[] {
  const p = path.join(process.cwd(), "public", "data", "taste-passport.json");
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  return j.countries as Country[];
}

export async function generateStaticParams() {
  return loadCountries().map((c) => ({ country: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const c = loadCountries().find((x) => x.slug === country);
  if (!c) return { title: "Country not found" };
  const dishesList = c.dishes.map((d) => d.name).slice(0, 5).join(", ");
  return {
    title: `Signature Dishes of ${c.name} — What to Eat (and What Locals Love)`,
    description: `${c.blurb} Try ${dishesList} and ${Math.max(
      c.dishes.length - 5,
      0
    )} more. Mark each one you've tasted on your passport.`,
    keywords: [
      `signature dishes of ${c.name}`,
      `traditional ${c.name} food`,
      `what to eat in ${c.name}`,
      `${c.name} cuisine`,
      `must try ${c.name} dishes`,
    ],
    openGraph: {
      title: `${c.flag} ${c.name} — Taste Passport`,
      description: `The ${c.dishes.length} signature dishes of ${c.name}.`,
      type: "article",
    },
    alternates: { canonical: `/maps/taste-passport/${c.slug}` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
