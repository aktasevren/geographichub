import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { breadcrumbs, faqPage, jsonLd } from "@/lib/seo";
import { loadWar, loadWarIndex } from "@/lib/wars";
import WarMapClient from "./WarMapClient";

type Params = { slug: string };

export async function generateStaticParams() {
  return loadWarIndex().map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const w = loadWar(slug);
  if (!w) return { title: "War not found" };
  const trTitle = w.nameTr || w.name;
  const trBlurb = (w as any).blurbTr || w.blurb;
  return {
    title: `${trTitle} · Harita (${w.startYear}–${w.endYear})`,
    description: `${trBlurb.slice(0, 145)}… ${w.events.length} olay haritalandı.`,
    keywords: [
      w.name,
      w.nameTr,
      `${trTitle} harita`,
      `${trTitle} muharebeleri`,
      `${trTitle} timeline`,
    ].filter(Boolean) as string[],
    openGraph: {
      title: `${trTitle} · Savaş Haritası · GeographicHub`,
      description: trBlurb.slice(0, 180),
      type: "article",
    },
    alternates: { canonical: `/maps/wars/${w.slug}` },
  };
}

export default async function WarPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const war = loadWar(slug);
  if (!war) notFound();

  const bc = breadcrumbs([
    { name: "GeographicHub", path: "/" },
    { name: "War Map", path: "/maps/wars" },
    { name: war.name, path: `/maps/wars/${war.slug}` },
  ]);

  const faq = faqPage([
    {
      question: `When did the ${war.name} start and end?`,
      answer: `${war.name} lasted from ${war.startYear} to ${war.endYear}.`,
    },
    {
      question: `How many battles and events are mapped for the ${war.name}?`,
      answer: `We have ${war.events.length} geolocated events — battles, treaties, congresses, armistices and turning points — with a short story per location.`,
    },
    {
      question: `Where did the ${war.name} begin?`,
      answer: `${war.events[0]?.name} at ${war.events[0]?.lat.toFixed(2)}°, ${war.events[0]?.lng.toFixed(2)}° on ${war.events[0]?.date}.`,
    },
    {
      question: `Where did the ${war.name} end?`,
      answer: `${war.events[war.events.length - 1]?.name} on ${war.events[war.events.length - 1]?.date}.`,
    },
  ]);

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${war.name} — Interactive Map`,
    author: { "@type": "Organization", name: "GeographicHub" },
    description: war.blurb,
    datePublished: "2026-04-14",
    dateModified: "2026-04-14",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(bc)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(faq)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(article)}
      />
      <WarMapClient war={war} />
    </>
  );
}
