import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pilotsun — Coğrafya Bilgi Oyunu, Dünyayı Turla",
  description:
    "Pilotsun. Rastgele bir noktada uyandın — neredesin? Doğru tahmin et ve 1.500 km doğuya uç. Dünyayı tam tur atarsan kazanırsın.",
  keywords: [
    "coğrafya oyunu",
    "ülke tahmin oyunu",
    "neredeyim oyunu",
    "dünya turlama oyunu",
    "coğrafya bilgi yarışması",
    "pilot oyunu",
    "geography game",
    "country guessing game",
  ],
  openGraph: {
    title: "Pilotsun · GeographicHub",
    description: "Pilotsun. Neredesin? Dünyayı turla.",
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pilotsun · Coğrafya Bilgi Oyunu",
    description: "Rastgele bir konumda uyandın — neredesin? Dünyayı tam tur at.",
  },
  alternates: {
    canonical: "/maps/pilot-game",
    languages: { tr: "/maps/pilot-game", en: "/maps/pilot-game" },
  },
};

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "Game",
  name: "Pilot Game",
  description:
    "Browser geography game: identify countries or oceans from coordinates and circle the Earth.",
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
