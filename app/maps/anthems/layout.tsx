import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Milli Marşlar Haritası — Tıkla, Dinle, Hikâyesini Oku",
  description:
    "Bir ülkeye tıkla, milli marşını dinle ve arkasındaki hikâyeyi oku. İstiklâl Marşı'ndan La Marseillaise'e, Aegukga'dan Wilhelmus'a 20 ülkenin marşı.",
  keywords: [
    "milli marşlar",
    "İstiklal Marşı",
    "ülke marşları",
    "milli marş dinle",
    "national anthems",
    "anthem map",
    "play national anthem",
  ],
  openGraph: {
    title: "Milli Marşlar Haritası · GeographicHub",
    description: "Bir ülkeye tıkla, milli marşını dinle ve hikâyesini oku.",
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Milli Marşlar · GeographicHub",
    description: "Tıkla, dinle, hikâyesini oku — 20 ülkenin marşı interaktif haritada.",
  },
  alternates: {
    canonical: "/maps/anthems",
    languages: { tr: "/maps/anthems", en: "/maps/anthems" },
  },
};

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Milli Marşlar Haritası",
  alternateName: "National Anthems Map",
  applicationCategory: "Reference",
  operatingSystem: "Any",
  description:
    "Dünya milli marşlarını dinleyen ve hikâyelerini anlatan interaktif harita.",
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
