import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  allPassports,
  getCountryMeta,
  groupByStatus,
  loadVisaMatrix,
  slugToIso,
} from "@/lib/visa-data";
import { breadcrumbs, faqPage, jsonLd, siteUrl } from "@/lib/seo";
import RelatedMaps from "@/components/RelatedMaps";

type Params = { passport: string };

export async function generateStaticParams() {
  return allPassports().map((iso) => ({
    passport: getCountryMeta(iso).slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { passport } = await params;
  const iso = slugToIso(passport);
  if (!iso) return { title: "Passport not found" };
  const meta = getCountryMeta(iso);
  const { rows } = loadVisaMatrix();
  const groups = groupByStatus(rows[iso]);
  const free =
    groups["visa-free"].length +
    groups["visa-on-arrival"].length +
    groups["e-visa"].length +
    groups["eta"].length;
  const demonym = meta.demonym || meta.name;
  return {
    title: `${meta.name} Passport — ${free} Visa-Free Destinations`,
    description: `${demonym} passport holders can enter ${free} countries without an embassy visa. Full list of visa-free, visa on arrival, eVisa, ETA, and visa-required destinations.`,
    keywords: [
      `${meta.name} passport visa-free countries`,
      `${demonym} passport`,
      `visa-free countries for ${meta.name}`,
      `countries ${demonym} citizens can visit without visa`,
      `${meta.name} passport power`,
    ],
    openGraph: {
      title: `${meta.name} Passport — ${free} Visa-Free Destinations`,
      description: `Where ${demonym} citizens can travel without an embassy visa.`,
      type: "website",
    },
    alternates: { canonical: `/maps/visa-free/${meta.slug}` },
  };
}

export default async function PassportPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { passport } = await params;
  const iso = slugToIso(passport);
  if (!iso) notFound();
  const meta = getCountryMeta(iso);
  const { rows } = loadVisaMatrix();
  const row = rows[iso];
  if (!row) notFound();

  const groups = groupByStatus(row);
  const vf = groups["visa-free"];
  const voa = groups["visa-on-arrival"];
  const ev = groups["e-visa"];
  const eta = groups["eta"];
  const req = groups["visa-required"];
  const no = groups["no-admission"];
  const totalFree = vf.length + voa.length + ev.length + eta.length;
  const demonym = meta.demonym || meta.name;

  const bc = breadcrumbs([
    { name: "GeographicHub", path: "/" },
    { name: "Visa-Free Atlas", path: "/maps/visa-free" },
    { name: `${meta.name} passport`, path: `/maps/visa-free/${meta.slug}` },
  ]);

  const faq = faqPage([
    {
      question: `How many countries can ${demonym} passport holders visit without a visa?`,
      answer: `${demonym} passport holders have visa-free or visa-on-arrival access to ${totalFree} destinations — ${vf.length} visa-free, ${voa.length} visa on arrival, ${ev.length} with an eVisa, and ${eta.length} with an ETA.`,
    },
    {
      question: `Do ${demonym} citizens need a visa for Europe?`,
      answer: `It depends on each country. Check the lists below — every destination is grouped by visa requirement for ${meta.name} passport holders.`,
    },
    {
      question: `How long can ${demonym} passport holders stay visa-free?`,
      answer: `Typical visa-free stays range from 14 to 180 days depending on the destination. See the visa-free list for exact stay durations where provided.`,
    },
    {
      question: `Is this visa information up to date?`,
      answer: `Data is sourced from the open passport-index-dataset on GitHub, which in turn is derived from Wikipedia. Always confirm with the destination's embassy before booking a flight.`,
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
        aria-label="Breadcrumb"
        className="px-6 md:px-10 pt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40"
      >
        <Link href="/" className="hover:text-white/70">GeographicHub</Link>
        <span className="mx-2">/</span>
        <Link href="/maps/visa-free" className="hover:text-white/70">Visa-Free</Link>
        <span className="mx-2">/</span>
        <span className="text-white/70">{meta.name}</span>
      </nav>

      <section className="px-6 md:px-10 pt-10 pb-16">
        <div className="max-w-[1100px] mx-auto">
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 mb-4">
            Passport strength
          </div>
          <h1 className="font-serif font-light text-4xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight max-w-[900px]">
            Where can a{" "}
            <span className="italic text-emerald-400">{meta.name}</span>{" "}
            passport take you?
          </h1>
          <div className="mt-8 flex flex-wrap items-baseline gap-3 md:gap-5">
            <span className="font-serif text-6xl md:text-8xl leading-none text-emerald-400 tabular-nums">
              {totalFree}
            </span>
            <span className="text-white/70 text-[16px] md:text-[19px] leading-snug max-w-sm">
              destinations open without an embassy visa — visa-free, visa on
              arrival, eVisa, or ETA combined.
            </span>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-5">
            {[
              { n: vf.length, label: "Visa-free", color: "#16a34a" },
              { n: voa.length, label: "Visa on arrival", color: "#eab308" },
              { n: ev.length, label: "eVisa", color: "#06b6d4" },
              { n: eta.length, label: "ETA", color: "#8b5cf6" },
              { n: req.length, label: "Visa required", color: "#f97316" },
              { n: no.length, label: "No admission", color: "#dc2626" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <div className="font-serif text-2xl tabular-nums" style={{ color: s.color }}>
                  {s.n}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50 mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 pb-16">
        <div className="max-w-[1100px] mx-auto space-y-12">
          <DestGroup
            title={`Visa-free destinations for ${meta.name} passport`}
            subtitle="Just your passport — no paperwork needed before you fly."
            color="#16a34a"
            list={vf}
            showDays
          />
          <DestGroup
            title="Visa on arrival"
            subtitle="Pay a small fee at the airport or border crossing."
            color="#eab308"
            list={voa}
          />
          <DestGroup
            title="eVisa (apply online)"
            subtitle="Complete an online application before your trip."
            color="#06b6d4"
            list={ev}
          />
          <DestGroup
            title="Electronic Travel Authorization (ETA)"
            subtitle="Quick pre-approval through a government website."
            color="#8b5cf6"
            list={eta}
          />
          <DestGroup
            title="Visa required (embassy application)"
            subtitle="Apply in advance at the destination's embassy or consulate."
            color="#f97316"
            list={req}
          />
          {no.length > 0 && (
            <DestGroup
              title="No admission"
              subtitle="Entry not permitted for this passport."
              color="#dc2626"
              list={no}
            />
          )}
        </div>
      </section>

      <section className="px-6 md:px-10 py-16 border-t border-white/10">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-6 max-w-3xl">
            {[
              {
                q: `How many countries can ${demonym} passport holders visit without a visa?`,
                a: `${demonym} passport holders have visa-free or visa-on-arrival access to ${totalFree} destinations — ${vf.length} visa-free, ${voa.length} visa on arrival, ${ev.length} with an eVisa, and ${eta.length} with an ETA.`,
              },
              {
                q: `How long can ${demonym} passport holders stay visa-free?`,
                a: `Typical visa-free stays range from 14 to 180 days depending on the destination. Specific stay durations are shown on the visa-free list above where the data provides them.`,
              },
              {
                q: "How up to date is this data?",
                a: "We use the open passport-index-dataset on GitHub, which is maintained from Wikipedia. Visa rules change often — always confirm with the destination's embassy before booking.",
              },
              {
                q: "Why are some countries marked 'No data'?",
                a: "A handful of jurisdictions have ambiguous or unreported rules. When in doubt, check the official embassy of the destination country.",
              },
            ].map((item, i) => (
              <div key={i} className="border-b border-white/10 pb-6">
                <h3 className="font-serif text-xl mb-2">{item.q}</h3>
                <p className="text-white/70 text-[15px] leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-10 py-12 border-t border-white/10">
        <div className="max-w-[1100px] mx-auto flex flex-wrap justify-center gap-3">
          <Link
            href="/maps/visa-free"
            className="inline-block px-6 py-3 rounded-full border border-emerald-400/40 bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-300 font-mono text-[11px] uppercase tracking-[0.22em]"
          >
            Interactive map →
          </Link>
          <Link
            href={`/maps/visa-free/destination/${meta.slug}`}
            className="inline-block px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white/80 font-mono text-[11px] uppercase tracking-[0.22em]"
          >
            Who can visit {meta.name}? →
          </Link>
          <Link
            href="/maps/visa-free/ranking"
            className="inline-block px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white/80 font-mono text-[11px] uppercase tracking-[0.22em]"
          >
            Passport ranking →
          </Link>
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

function DestGroup({
  title,
  subtitle,
  color,
  list,
  showDays,
}: {
  title: string;
  subtitle: string;
  color: string;
  list: { iso: string; name: string; days?: number }[];
  showDays?: boolean;
}) {
  if (list.length === 0)
    return (
      <div>
        <h2 className="font-serif text-2xl md:text-3xl mb-1">{title}</h2>
        <p className="text-white/50 text-[14px]">None for this passport.</p>
      </div>
    );
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-1">
        <h2 className="font-serif text-2xl md:text-3xl" style={{ color }}>
          {title}
        </h2>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
          {list.length}
        </span>
      </div>
      <p className="text-white/60 text-[14px] mb-5">{subtitle}</p>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
        {list.map((d) => (
          <li
            key={d.iso}
            className="flex justify-between items-baseline gap-2 border-b border-white/5 py-1.5"
          >
            <span className="text-[14px] text-white/85 truncate">{d.name}</span>
            {showDays && d.days !== undefined && (
              <span
                className="font-mono text-[11px] tabular-nums"
                style={{ color }}
              >
                {d.days}d
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
