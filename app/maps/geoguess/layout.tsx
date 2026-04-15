import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neredeyim? — Fotoğraftan Ülke/Yer Tahmin Oyunu",
  description:
    "Dünyanın dört bir yanından bir fotoğraf — haritaya tıkla, nerede olduğunu tahmin et. Ne kadar yakınsan o kadar çok puan.",
  keywords: [
    "geoguessr alternatif",
    "ülke tahmin oyunu",
    "nerede oyunu",
    "geoguess free",
    "location guessing game",
  ],
  openGraph: {
    title: "Neredeyim · GeographicHub",
    description: "Bir fotoğraf gör, haritaya tıkla, kaç km ıskaladın gör.",
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Neredeyim · GeographicHub",
    description: "Fotoğraftan yer tahmin et — 5 tur, 25 000 puan.",
  },
  alternates: {
    canonical: "/maps/geoguess",
    languages: { tr: "/maps/geoguess", en: "/maps/geoguess" },
  },
};

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Neredeyim",
  alternateName: "GeoGuess",
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  description:
    "Ünlü yerlerin fotoğraflarından dünya üzerinde konum tahmin etme oyunu.",
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
