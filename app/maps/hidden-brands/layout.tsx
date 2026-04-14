import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hidden Brands — Same Product, Different Name Around the World",
  description:
    "Algida in Turkey is Wall's in the UK, Kibon in Brazil, Good Humor in America. Spin the globe and discover every brand that goes by a different name in your country.",
  keywords: [
    "hidden brands",
    "same product different name",
    "is algida wall's",
    "heartbrand countries",
    "axe lynx same",
    "hungry jack's burger king",
    "opel vauxhall same",
    "brands with different names by country",
  ],
  openGraph: {
    title: "Hidden Brands · GeographicHub",
    description:
      "One logo, many names. The global atlas of brands that rename themselves across borders.",
    type: "website",
  },
  alternates: { canonical: "/maps/hidden-brands" },
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
