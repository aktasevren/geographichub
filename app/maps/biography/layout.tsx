import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biyografi Haritası — Ünlü Bir Yaşam, 3D Küre Üzerinde",
  description:
    "Ünlü birini ara — doğum yeri, okulu, çalıştığı yer, vefat yeri 3D küre üzerinde işaretli zaman çizelgesi olarak. Wikidata kaynaklı.",
  keywords: [
    "biyografi haritası",
    "yaşam haritası",
    "ünlü kişilerin doğum yeri",
    "kim nerede doğdu",
    "wikidata yaşam",
    "biography map",
    "life map",
  ],
  openGraph: {
    title: "Biyografi Haritası · GeographicHub",
    description: "Herhangi bir ünlünün hayatını 3D küre üzerine sabitle.",
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Biyografi Haritası · GeographicHub",
    description: "Doğum, okul, iş, vefat — bir yaşam küre üzerinde.",
  },
  alternates: {
    canonical: "/maps/biography",
    languages: { tr: "/maps/biography", en: "/maps/biography" },
  },
};

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Biography Map",
  applicationCategory: "Reference",
  operatingSystem: "Any",
  description:
    "Interactive map that pins birth, education, residence, work and death locations of any famous person.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }}
      />
      {children}
    </>
  );
}
