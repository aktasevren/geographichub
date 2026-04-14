import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  allPassports,
  getCountryMeta,
  loadVisaMatrix,
  slugToIso,
  type VisaStatus,
} from "@/lib/visa-data";
import { breadcrumbs, faqPage, jsonLd } from "@/lib/seo";
import RelatedMaps from "@/components/RelatedMaps";

type Params = { iso: string };

export async function generateStaticParams() {
  return allPassports().map((iso) => ({
    iso: getCountryMeta(iso).slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { iso: slug } = await params;
  const iso = slugToIso(slug);
  if (!iso) return { title: "Country not found" };
  const meta = getCountryMeta(iso);
  return {
    title: `Who Can Visit ${meta.name} Without a Visa?`,
    description: `Every passport that can enter ${meta.name} visa-free, with visa on arrival, with an eVisa, or an ETA — and which passports need a full embassy visa.`,
    keywords: [
      `visit ${meta.name} visa free`,
      `${meta.name} visa on arrival`,
      `who can visit ${meta.name} without visa`,
      `${meta.name} eVisa`,
      `passports allowed in ${meta.name}`,
    ],
    alternates: { canonical: `/maps/visa-free/destination/${meta.slug}` },
  };
}

type Group = Record<string, { iso: string; name: string; days?: number }[]>;

function groupVisitors(destinationIso: string): Group {
  const { rows } = loadVisaMatrix();
  const groups: Group = {
    "visa-free": [],
    "visa-on-arrival": [],
    "e-visa": [],
    "eta": [],
    "visa-required": [],
    "no-admission": [],
  };
  for (const [passportIso, row] of Object.entries(rows)) {
    if (passportIso === destinationIso) continue;
    const status: VisaStatus | undefined = row.destinations[destinationIso];
    if (!status || status.kind === "same" || status.kind === "unknown") continue;
    const pMeta = getCountryMeta(passportIso);
    if (!pMeta) continue;
    groups[status.kind].push({
      iso: passportIso,
      name: pMeta.name,
      days: status.kind === "visa-free" ? status.days : undefined,
    });
  }
  for (const k of Object.keys(groups)) {
    groups[k].sort((a, b) => a.name.localeCompare(b.name));
  }
  return groups;
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { iso: slug } = await params;
  const iso = slugToIso(slug);
  if (!iso) notFound();
  const meta = getCountryMeta(iso);
  const groups = groupVisitors(iso);
  const totalOpen =
    groups["visa-free"].length +
    groups["visa-on-arrival"].length +
    groups["e-visa"].length +
    groups["eta"].length;

  const bc = breadcrumbs([
    { name: "GeographicHub", path: "/" },
    { name: "Visa-Free Atlas", path: "/maps/visa-free" },
    { name: `Who visits ${meta.name}`, path: `/maps/visa-free/destination/${slug}` },
  ]);
  const faq = faqPage([
    {
      question: `How many passports can visit ${meta.name} without a visa?`,
      answer: `${groups["visa-free"].length} passports have full visa-free access to ${meta.name}. A further ${groups["visa-on-arrival"].length} get a visa on arrival, ${groups["e-visa"].length} qualify for an eVisa, and ${groups["eta"].length} need an ETA.`,
    },
    {
      question: `Do I need a visa to visit ${meta.name}?`,
      answer: `It depends on your passport. Find your country in the groups below — each is labelled visa-free, visa on arrival, eVisa, ETA, or visa required.`,
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
        <span className="text-white/70">Who visits {meta.name}</span>
      </nav>

      <section className="px-6 md:px-10 pt-10 pb-14">
        <div className="max-w-[1100px] mx-auto">
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 mb-4">
            Who can visit
          </div>
          <h1 className="font-serif font-light text-4xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight">
            Who can visit{" "}
            <span className="italic text-emerald-400">{meta.name}</span>{" "}
            without a visa?
          </h1>
          <div className="mt-8 flex items-baseline gap-4">
            <span className="font-serif text-6xl md:text-8xl leading-none text-emerald-400 tabular-nums">
              {totalOpen}
            </span>
            <span className="text-white/70 text-[16px] md:text-[19px] leading-snug max-w-sm">
              passports can enter {meta.name} without an embassy visa.
            </span>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 pb-16">
        <div className="max-w-[1100px] mx-auto space-y-10">
          {(
            [
              { key: "visa-free",        title: "Visa-free",       color: "#16a34a", showDays: true },
              { key: "visa-on-arrival", title: "Visa on arrival", color: "#eab308", showDays: false },
              { key: "e-visa",          title: "eVisa",            color: "#06b6d4", showDays: false },
              { key: "eta",             title: "ETA",              color: "#8b5cf6", showDays: false },
              { key: "visa-required",   title: "Visa required",    color: "#f97316", showDays: false },
              { key: "no-admission",    title: "No admission",     color: "#dc2626", showDays: false },
            ] as const
          ).map((g) => {
            const list = groups[g.key];
            if (list.length === 0) return null;
            return (
              <div key={g.key}>
                <div className="flex items-baseline gap-3 mb-4">
                  <h2
                    className="font-serif text-2xl md:text-3xl"
                    style={{ color: g.color }}
                  >
                    {g.title}
                  </h2>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
                    {list.length}
                  </span>
                </div>
                <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
                  {list.map((p) => (
                    <li
                      key={p.iso}
                      className="flex justify-between items-baseline gap-2 border-b border-white/5 py-1.5"
                    >
                      <Link
                        href={`/maps/visa-free/${getCountryMeta(p.iso).slug}`}
                        className="text-[14px] text-white/85 hover:text-emerald-400 truncate"
                      >
                        {p.name}
                      </Link>
                      {g.showDays && p.days !== undefined && (
                        <span
                          className="font-mono text-[11px] tabular-nums"
                          style={{ color: g.color }}
                        >
                          {p.days}d
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
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
