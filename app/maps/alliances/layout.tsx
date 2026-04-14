import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İttifaklar Haritası — NATO, AB, BRICS ve Daha Fazlası",
  description:
    "Dünyanın 12 büyük topluluğu (NATO, AB, BRICS, Commonwealth, ASEAN, Afrika Birliği) interaktif haritada. Üye ülkeleri, kuruluş yıllarını ve amaçlarını gör.",
  keywords: [
    "NATO üyeleri",
    "AB üye ülkeleri",
    "BRICS ülkeleri",
    "G7 G20",
    "Commonwealth ülkeleri",
    "ASEAN üye ülkeleri",
    "Arap Birliği",
    "Afrika Birliği üyeleri",
    "uluslararası ittifaklar haritası",
    "alliances map",
    "international organizations",
  ],
  openGraph: {
    title: "İttifaklar Haritası · GeographicHub",
    description:
      "NATO, AB, BRICS, Commonwealth — dünya nasıl gruplara ayrıldı? İnteraktif harita.",
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "İttifaklar Haritası · GeographicHub",
    description:
      "Dünyanın 12 büyük topluluğu interaktif haritada. NATO, AB, BRICS, Commonwealth.",
  },
  alternates: {
    canonical: "/maps/alliances",
    languages: {
      tr: "/maps/alliances",
      en: "/maps/alliances",
    },
  },
};

const JSONLD_APP = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "İttifaklar Haritası",
  alternateName: "Alliances Map",
  applicationCategory: "Reference",
  operatingSystem: "Any",
  description:
    "İnteraktif dünya haritasında 12 büyük uluslararası topluluk: NATO, AB, BRICS, Commonwealth, G7, G20, ASEAN, Afrika Birliği, Arap Birliği, Mercosur, OPEC, ŞİÖ.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const JSONLD_FAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "NATO'nun kaç üyesi var?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NATO'nun 32 üyesi vardır. 1949'da 12 ülke ile kuruldu; en son 2024'te İsveç katıldı.",
      },
    },
    {
      "@type": "Question",
      name: "BRICS hangi ülkelerden oluşur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BRICS başlangıçta Brezilya, Rusya, Hindistan, Çin ve Güney Afrika'dan oluşuyordu. 2024'te Mısır, Etiyopya, İran ve BAE de katıldı — toplam 9 üye.",
      },
    },
    {
      "@type": "Question",
      name: "Avrupa Birliği'nde kaç ülke var?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Avrupa Birliği'nde 27 üye ülke vardır. Birleşik Krallık 2020'de ayrıldı. Üyelerin 20'si euro kullanır.",
      },
    },
    {
      "@type": "Question",
      name: "Commonwealth nedir?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Milletler Topluluğu (Commonwealth), çoğunluğu eski İngiliz İmparatorluğu'na bağlı 56 ülkeden oluşan gönüllü bir birliktir. Demokratik değerleri ve İngilizceyi paylaşırlar.",
      },
    },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_APP) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_FAQ) }}
      />
      {children}
    </>
  );
}
