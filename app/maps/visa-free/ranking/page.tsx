import type { Metadata } from "next";
import Link from "next/link";
import {
  allPassports,
  getCountryMeta,
  groupByStatus,
  loadVisaMatrix,
} from "@/lib/visa-data";
import { breadcrumbs, faqPage, jsonLd } from "@/lib/seo";
import RelatedMaps from "@/components/RelatedMaps";

export const metadata: Metadata = {
  title: "Passport Power Ranking — Strongest Passports in the World",
  description:
    "Every passport ranked by visa-free access: visa-free, visa on arrival, eVisa, and ETA destinations. See where your passport sits.",
  keywords: [
    "strongest passport in the world",
    "passport power ranking",
    "most powerful passports",
    "passport index",
    "visa-free countries ranking",
  ],
  alternates: { canonical: "/maps/visa-free/ranking" },
  openGraph: {
    title: "Passport Power Ranking · GeographicHub",
    description: "Every passport in the world ranked by where it can go.",
    type: "article",
  },
};

export default function RankingPage() {
  const { rows } = loadVisaMatrix();

  const ranked = allPassports()
    .map((iso) => {
      const row = rows[iso];
      const groups = groupByStatus(row);
      const free =
        groups["visa-free"].length +
        groups["visa-on-arrival"].length +
        groups["e-visa"].length +
        groups["eta"].length;
      return {
        iso,
        meta: getCountryMeta(iso),
        free,
        vf: groups["visa-free"].length,
        voa: groups["visa-on-arrival"].length,
        ev: groups["e-visa"].length,
        eta: groups["eta"].length,
        req: groups["visa-required"].length,
      };
    })
    .sort((a, b) => b.free - a.free);

  const top = ranked.slice(0, 5);

  const bc = breadcrumbs([
    { name: "GeographicHub", path: "/" },
    { name: "Visa-Free Atlas", path: "/maps/visa-free" },
    { name: "Passport Ranking", path: "/maps/visa-free/ranking" },
  ]);
  const faq = faqPage([
    {
      question: "Which passport is the strongest in the world right now?",
      answer: `By visa-free access, the strongest passport in our dataset is ${top[0].meta.name}, with access to ${top[0].free} destinations without an embassy visa.`,
    },
    {
      question: "How is passport strength measured?",
      answer:
        "We count the number of destinations accessible without an embassy visa — combining visa-free access, visa on arrival, eVisa, and ETA. Destinations that require full embassy paperwork are not counted in the strength score.",
    },
    {
      question: "Where does this data come from?",
      answer:
        "The open passport-index-dataset on GitHub (MIT licence), which is derived from Wikipedia's crowd-maintained visa requirement tables.",
    },
  ]);

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
          href="/maps/visa-free"
          className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70 hover:text-white"
        >
          ← Interactive map
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
        <Link href="/maps/visa-free" className="hover:text-white/70">Visa-Free</Link>
        <span className="mx-2">/</span>
        <span className="text-white/70">Ranking</span>
      </nav>

      <section className="px-6 md:px-10 pt-10 pb-12">
        <div className="max-w-[1100px] mx-auto">
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 mb-4">
            Passport power
          </div>
          <h1 className="font-serif font-light text-4xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight">
            The world's passports,{" "}
            <span className="italic text-emerald-400">ranked.</span>
          </h1>
          <p className="mt-6 text-[17px] md:text-[20px] leading-relaxed text-white/80 max-w-2xl">
            Every passport, sorted by how many destinations it opens without an
            embassy visa. Click a country to see its full visa breakdown.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-10 pb-10">
        <div className="max-w-[1100px] mx-auto">
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 mb-4">
            Top 5 · this dataset
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {top.map((r, i) => (
              <Link
                key={r.iso}
                href={`/maps/visa-free/${r.meta.slug}`}
                className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-400/40 hover:bg-emerald-400/5 transition"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">
                  #{i + 1}
                </div>
                <div className="font-serif text-2xl text-emerald-400 tabular-nums leading-none">
                  {r.free}
                </div>
                <div className="font-serif text-[17px] leading-tight mt-2 line-clamp-2">
                  {r.meta.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 pb-16">
        <div className="max-w-[1100px] mx-auto overflow-x-auto">
          <table className="w-full text-[14px] border-collapse">
            <thead>
              <tr className="border-b border-white/20 text-left">
                <th className="py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">#</th>
                <th className="py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">Passport</th>
                <th className="py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 text-right">Open</th>
                <th className="py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 text-right hidden md:table-cell">Visa-free</th>
                <th className="py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 text-right hidden md:table-cell">VOA</th>
                <th className="py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 text-right hidden md:table-cell">eVisa</th>
                <th className="py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 text-right hidden md:table-cell">Required</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((r, i) => (
                <tr
                  key={r.iso}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-2.5 text-white/40 font-mono text-[12px] tabular-nums w-10">
                    {i + 1}
                  </td>
                  <td className="py-2.5">
                    <Link
                      href={`/maps/visa-free/${r.meta.slug}`}
                      className="hover:text-emerald-400 transition"
                    >
                      {r.meta.name}
                    </Link>
                  </td>
                  <td className="py-2.5 text-right tabular-nums font-semibold text-emerald-400">
                    {r.free}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-white/70 hidden md:table-cell">
                    {r.vf}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-white/70 hidden md:table-cell">
                    {r.voa}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-white/70 hidden md:table-cell">
                    {r.ev}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-white/70 hidden md:table-cell">
                    {r.req}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="px-6 md:px-10 py-14 border-t border-white/10">
        <div className="max-w-[820px] mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl mb-6">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {[
              { q: "Which passport is the strongest in the world right now?", a: `In our open dataset, ${top[0].meta.name} tops the list with ${top[0].free} destinations accessible without an embassy visa.` },
              { q: "How is passport strength measured?", a: "We count destinations accessible without an embassy visa — combining visa-free, visa on arrival, eVisa and ETA. Embassy-visa destinations are not counted in the strength score." },
              { q: "Where does this data come from?", a: "The passport-index-dataset on GitHub (MIT), derived from Wikipedia. Always verify with the destination's embassy before booking." },
            ].map((f, i) => (
              <div key={i} className="border-b border-white/10 pb-5">
                <h3 className="font-serif text-xl mb-2">{f.q}</h3>
                <p className="text-white/75 text-[15px] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RelatedMaps exclude="/maps/visa-free" />

      <footer className="px-6 md:px-10 py-8 border-t border-white/10 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 flex flex-wrap justify-between gap-4">
        <span>© {new Date().getFullYear()} GeographicHub</span>
        <span>Data · passport-index-dataset (MIT) · Wikipedia</span>
      </footer>
    </div>
  );
}
