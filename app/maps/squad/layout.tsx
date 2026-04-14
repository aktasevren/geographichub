import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kadro Haritası — Takım İlk 11'i ve Teknik Direktör Nereli?",
  description:
    "Bir takım ismi yaz (Fenerbahçe, Real Madrid, Bayern) — ilk 11 ve teknik direktörün millilikleri interaktif harita üzerinde.",
  keywords: [
    "takım kadrosu harita",
    "Fenerbahçe kadro nereli",
    "oyuncular nereli",
    "squad nationality map",
    "football team nationality map",
  ],
  openGraph: {
    title: "Kadro Haritası · GeographicHub",
    description: "Takım ismi yaz, oyuncuları haritada memleketlerine göre gör.",
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kadro Haritası · GeographicHub",
    description: "İlk 11 ve teknik direktör — harita üzerinde millilik.",
  },
  alternates: {
    canonical: "/maps/squad",
    languages: { tr: "/maps/squad", en: "/maps/squad" },
  },
};

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Kadro Haritası",
  alternateName: "Squad Map",
  applicationCategory: "SportsApplication",
  operatingSystem: "Any",
  description:
    "Futbol takımlarının oyuncu ve teknik direktör milliliklerini haritada görselleştiren interaktif araç.",
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
