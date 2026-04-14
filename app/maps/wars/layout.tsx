import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Savaş Haritası — İnteraktif Tarih Atlası",
  description:
    "Bir savaş seç, her muharebeyi, antlaşmayı ve dönüm noktasını yaşandığı yerde görselleştir. Kurtuluş Savaşı, II. Dünya Savaşı, Napolyon Savaşları ve daha fazlası.",
  keywords: [
    "savaş haritası",
    "Kurtuluş Savaşı haritası",
    "II. Dünya Savaşı haritası",
    "Birinci Dünya Savaşı haritası",
    "interaktif tarih haritası",
    "muharebe haritası",
    "war map",
    "battle map",
    "world war 2 map",
  ],
  openGraph: {
    title: "Savaş Haritası · GeographicHub",
    description:
      "İnteraktif tarih atlası — 6 büyük savaşın muharebeleri, antlaşmaları ve dönüm noktaları haritada.",
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Savaş Haritası · GeographicHub",
    description:
      "İnteraktif tarih atlası — Kurtuluş Savaşı, WWII, WWI ve daha fazlası.",
  },
  alternates: {
    canonical: "/maps/wars",
    languages: { tr: "/maps/wars", en: "/maps/wars" },
  },
};

const JSONLD_APP = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Savaş Haritası",
  alternateName: "War Map",
  applicationCategory: "Reference",
  operatingSystem: "Any",
  description:
    "Tarihsel savaşların muharebeleri, antlaşmaları ve dönüm noktalarını coğrafi olarak gösteren interaktif harita.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_APP) }}
      />
      {children}
    </>
  );
}
