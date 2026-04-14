import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizli Markalar — Aynı Ürün, Farklı İsim",
  description:
    "Türkiye'de Algida olarak bildiğin ürün İngiltere'de Wall's, Brezilya'da Kibon, ABD'de Good Humor. Tek logo, birçok isim — küreyi döndür ve keşfet.",
  keywords: [
    "Algida nedir",
    "Algida hangi marka",
    "aynı marka farklı isim",
    "Heartbrand markaları",
    "Axe Lynx aynı mı",
    "Hungry Jack's Burger King",
    "Opel Vauxhall",
    "gizli markalar",
    "hidden brands",
    "global brand names",
  ],
  openGraph: {
    title: "Gizli Markalar · GeographicHub",
    description:
      "Tek logo, birçok isim. Sınırları aşan markaların küresel atlası.",
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gizli Markalar · GeographicHub",
    description: "Algida = Wall's = Kibon. Aynı ürün, farklı isim — interaktif harita.",
  },
  alternates: {
    canonical: "/maps/hidden-brands",
    languages: { tr: "/maps/hidden-brands", en: "/maps/hidden-brands" },
  },
};

const JSONLD_APP = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Hidden Brands",
  applicationCategory: "Reference",
  operatingSystem: "Any",
  description:
    "Interactive atlas of multinational brands that trade under different names in different countries.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const JSONLD_FAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Algida the same as Wall's?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Both are Unilever's Heartbrand ice cream, sold under different regional names. Algida is used in Turkey, Italy, Greece and other markets; Wall's in the UK and much of Asia. The red heart logo is the constant across all of them.",
      },
    },
    {
      "@type": "Question",
      name: "Why is Burger King called Hungry Jack's in Australia?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A local Adelaide takeaway shop had already trademarked the name 'Burger King' in Australia when the US chain tried to enter in 1971. The Australian franchisee Jack Cowin was given a list of alternative names and picked 'Hungry Jack' from a Pillsbury pancake mix brand the parent company also owned.",
      },
    },
    {
      "@type": "Question",
      name: "Is Axe and Lynx the same deodorant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Unilever sells the same product as Axe globally, except in the UK, Ireland, Australia and New Zealand — where a competing trademark forced a rename to Lynx.",
      },
    },
    {
      "@type": "Question",
      name: "Was Snickers called Marathon in the UK?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, from 1968 until 1990. Mars launched the US 'Snickers' bar in Britain as 'Marathon' because they worried the US name sounded too close to a British slang word. The name was globally unified to Snickers in 1990.",
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
