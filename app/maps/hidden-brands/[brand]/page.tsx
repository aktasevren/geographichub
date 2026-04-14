import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrand, loadBrands } from "@/lib/brand-data";
import { breadcrumbs, faqPage, jsonLd } from "@/lib/seo";
import RelatedMaps from "@/components/RelatedMaps";

type Params = { brand: string };

const ISO_TO_NAME: Record<string, string> = {
  TUR: "Turkey", ITA: "Italy", GRC: "Greece", CYP: "Cyprus", ROU: "Romania",
  HUN: "Hungary", BGR: "Bulgaria", POL: "Poland", SVK: "Slovakia", CZE: "Czech Republic",
  ISR: "Israel", GBR: "United Kingdom", IRL: "Ireland", IDN: "Indonesia", THA: "Thailand",
  PHL: "Philippines", MYS: "Malaysia", SGP: "Singapore", LKA: "Sri Lanka", VNM: "Vietnam",
  CHN: "China", SAU: "Saudi Arabia", ARE: "UAE", IND: "India", PAK: "Pakistan",
  BGD: "Bangladesh", NPL: "Nepal", NLD: "Netherlands", BEL: "Belgium", USA: "United States",
  CAN: "Canada", DEU: "Germany", AUT: "Austria", BIH: "Bosnia", SRB: "Serbia",
  MKD: "North Macedonia", ESP: "Spain", BRA: "Brazil", AUS: "Australia", NZL: "New Zealand",
  DNK: "Denmark", PRT: "Portugal", FRA: "France", SWE: "Sweden", NOR: "Norway",
  FIN: "Finland", VEN: "Venezuela", CHL: "Chile", MEX: "Mexico", ECU: "Ecuador",
  COL: "Colombia", ARG: "Argentina", TUR_2: "Turkey", EGY: "Egypt", MAR: "Morocco",
  ZAF: "South Africa", NGA: "Nigeria", KEN: "Kenya", RUS: "Russia", UKR: "Ukraine",
  JPN: "Japan", KOR: "South Korea", PER: "Peru", LUX: "Luxembourg", CHE: "Switzerland",
  HRV: "Croatia", SVN: "Slovenia", EST: "Estonia", LVA: "Latvia", LTU: "Lithuania",
};

export async function generateStaticParams() {
  return loadBrands().map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { brand } = await params;
  const b = getBrand(brand);
  if (!b) return { title: "Brand not found" };
  const namesList = b.names.map((n) => n.name).slice(0, 5).join(", ");
  return {
    title: `${b.title} — Same ${b.product}, Different Name Around the World`,
    description: `${b.blurb} Full list of regional names: ${namesList}…`,
    keywords: [
      `${b.title} countries`,
      ...b.names.map((n) => `is ${n.name} the same as ${b.title}`),
      `${b.product} same brand different name`,
    ],
    openGraph: {
      title: `${b.title} · Hidden Brands · GeographicHub`,
      description: b.blurb,
      type: "article",
    },
    alternates: { canonical: `/maps/hidden-brands/${b.slug}` },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { brand } = await params;
  const b = getBrand(brand);
  if (!b) notFound();

  const bc = breadcrumbs([
    { name: "GeographicHub", path: "/" },
    { name: "Hidden Brands", path: "/maps/hidden-brands" },
    { name: b.title, path: `/maps/hidden-brands/${b.slug}` },
  ]);

  const faqs = [
    {
      question: `Is ${b.names[0].name} the same as ${b.names[1]?.name || b.title}?`,
      answer: `Yes. ${b.names[0].name} and ${b.names[1]?.name || b.title} are the same ${b.product.toLowerCase()} from ${b.parent}, sold under different names in different countries.`,
    },
    {
      question: `How many names does ${b.title} have around the world?`,
      answer: `We've catalogued ${b.names.length} regional names for ${b.title} across ${b.names.reduce((s, n) => s + n.countries.length, 0)} countries.`,
    },
    {
      question: `Who owns ${b.title}?`,
      answer: `${b.title} is owned by ${b.parent}.`,
    },
    b.story
      ? {
          question: `Why does ${b.title} use different names in different countries?`,
          answer: b.story,
        }
      : null,
  ].filter(Boolean) as { question: string; answer: string }[];

  const faq = faqPage(faqs);
  const totalCountries = b.names.reduce((s, n) => s + n.countries.length, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(bc)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(faq)}
      />

      <header className="flex justify-between items-center px-6 md:px-10 py-5 border-b border-white/10">
        <Link
          href="/maps/hidden-brands"
          className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70 hover:text-white"
        >
          ← Interactive globe
        </Link>
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70 hover:text-white"
        >
          GeographicHub
        </Link>
      </header>

      <nav
        className="px-6 md:px-10 pt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-white/70">GeographicHub</Link>
        <span className="mx-2">/</span>
        <Link href="/maps/hidden-brands" className="hover:text-white/70">Hidden Brands</Link>
        <span className="mx-2">/</span>
        <span className="text-white/70">{b.title}</span>
      </nav>

      <section className="px-6 md:px-10 pt-10 pb-14">
        <div className="max-w-[1100px] mx-auto">
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 mb-3">
            {b.product} · {b.parent}
          </div>
          <h1 className="font-serif font-light text-4xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight">
            {b.title}
          </h1>
          <p className="mt-6 text-[17px] md:text-[20px] leading-relaxed text-white/80 max-w-2xl">
            {b.blurb}
          </p>

          <div className="mt-8 flex items-baseline gap-5 md:gap-10">
            <Stat n={b.names.length} label="Regional names" />
            <Stat n={totalCountries} label="Countries" />
          </div>
        </div>
      </section>

      {b.story && (
        <section className="px-6 md:px-10 py-10 border-t border-white/10">
          <div className="max-w-[820px] mx-auto">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 mb-3">
              Why the different names?
            </div>
            <p className="text-white/85 text-[17px] leading-relaxed">{b.story}</p>
          </div>
        </section>
      )}

      <section className="px-6 md:px-10 py-14 border-t border-white/10">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl mb-2">
            Every name for {b.title}
          </h2>
          <p className="text-white/60 text-[14px] mb-8">
            Click into the interactive globe to see each name coloured on the map.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {b.names.map((n) => (
              <article
                key={n.name}
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="w-4 h-4 rounded-sm"
                    style={{ background: n.color }}
                    aria-hidden
                  />
                  <h3 className="font-serif text-2xl" style={{ color: n.color }}>
                    {n.name}
                  </h3>
                  <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                    {n.countries.length} {n.countries.length === 1 ? "country" : "countries"}
                  </span>
                </div>
                <ul className="flex flex-wrap gap-1.5">
                  {n.countries.map((iso) => (
                    <li
                      key={iso}
                      className="font-mono text-[11px] px-2 py-1 rounded bg-white/10 text-white/80"
                    >
                      {ISO_TO_NAME[iso] || iso}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 py-14 border-t border-white/10">
        <div className="max-w-[820px] mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl mb-6">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {faqs.map((f, i) => (
              <div key={i} className="border-b border-white/10 pb-5">
                <h3 className="font-serif text-xl mb-2">{f.question}</h3>
                <p className="text-white/75 text-[15px] leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 py-10 border-t border-white/10 text-center">
        <Link
          href="/maps/hidden-brands"
          className="inline-block px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-mono text-[11px] uppercase tracking-[0.22em]"
        >
          Spin the globe →
        </Link>
      </section>

      <RelatedMaps exclude="/maps/hidden-brands" />

      <footer className="px-6 md:px-10 py-8 border-t border-white/10 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 flex flex-wrap justify-between gap-4">
        <span>© {new Date().getFullYear()} GeographicHub</span>
        <span>Brand names & logos are trademarks of their owners, shown editorially · Data from Wikipedia</span>
      </footer>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="font-serif text-4xl md:text-6xl text-emerald-400 tabular-nums leading-none">
        {n}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mt-2">
        {label}
      </div>
    </div>
  );
}
