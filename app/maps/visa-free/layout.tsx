import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visa-Free Atlas — Where Can Your Passport Take You?",
  description:
    "Pick your passport and see every country on a 3D globe, colored by visa requirement — visa-free, visa on arrival, eVisa, ETA, or full embassy visa.",
  keywords: [
    "visa free countries",
    "passport power",
    "visa on arrival",
    "eVisa countries",
    "ETA countries",
    "passport index",
    "visa requirements map",
    "where can I travel without a visa",
  ],
  openGraph: {
    title: "Visa-Free Atlas · GeographicHub",
    description:
      "Pick your passport, spin the globe, see where you can go visa-free.",
    type: "website",
  },
  alternates: { canonical: "/maps/visa-free" },
};

const JSONLD_APP = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Visa-Free Atlas",
  applicationCategory: "TravelApplication",
  operatingSystem: "Any",
  description:
    "Interactive passport visa-requirement globe for every country in the world.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const JSONLD_FAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a visa-free country?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A country that lets your passport enter without any visa application — just show your passport at the border.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between visa on arrival and eVisa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Visa on arrival is bought at the airport or border crossing when you arrive. An eVisa is applied for online before you fly and linked to your passport digitally.",
      },
    },
    {
      "@type": "Question",
      name: "What is an ETA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An Electronic Travel Authorization — a quick online pre-approval, usually approved in minutes. The UK ETA, US ESTA, and Canadian eTA are examples.",
      },
    },
    {
      "@type": "Question",
      name: "Is this data official?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. It comes from the open passport-index-dataset, which is maintained from Wikipedia. Always verify with the destination's embassy before booking.",
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
