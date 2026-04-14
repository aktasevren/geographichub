import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taste Passport — Have You Tasted the World?",
  description:
    "A bucket list for your tastebuds. Mark the signature dishes you've tried in every country and collect passport stamps as you complete cuisines.",
  keywords: [
    "signature dishes by country",
    "world cuisine bucket list",
    "what to eat in",
    "national food map",
    "must try dishes",
    "food passport",
  ],
  openGraph: {
    title: "Taste Passport · GeographicHub",
    description:
      "A gamified bucket list of the world's signature dishes. Mark, collect, complete.",
    type: "website",
  },
  alternates: { canonical: "/maps/taste-passport" },
};

const JSONLD_APP = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Taste Passport",
  applicationCategory: "FoodApplication",
  operatingSystem: "Any",
  description:
    "Gamified culinary bucket list — mark signature dishes you've tasted, country by country.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const JSONLD_FAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Taste Passport?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A bucket list for your tastebuds. Pick a country, see its signature dishes, and mark the ones you've tried. Your progress is saved on your device.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between 'iconic' and 'everyday' dishes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Iconic dishes are what foreigners know — Pad Thai, Carbonara, Haggis. Everyday dishes are what locals actually eat daily at home or nearby — kuru fasulye, cacio e pepe, fish and chips. Flip the filter to see the authentic, locally-loved side of each cuisine.",
      },
    },
    {
      "@type": "Question",
      name: "Is my progress saved?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — on this device, in your browser's local storage. No account is needed.",
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
