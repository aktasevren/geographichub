import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ISS Tracker — Where Is the International Space Station Right Now?",
  description:
    "Live 3D globe showing the International Space Station in real time. See altitude, speed, the country it's over, and upcoming passes over your location.",
  keywords: [
    "ISS tracker",
    "where is the ISS",
    "international space station live",
    "ISS live location",
    "ISS pass over my city",
    "space station tracker",
  ],
  openGraph: {
    title: "ISS Tracker — Live 3D Globe · GeographicHub",
    description:
      "Where the International Space Station is right now, and when it will pass over you.",
    type: "website",
  },
  alternates: { canonical: "/maps/iss" },
};

const JSONLD_APP = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ISS Tracker",
  applicationCategory: "Reference",
  operatingSystem: "Any",
  description:
    "Real-time tracker of the International Space Station on a 3D globe, with upcoming pass predictions for your location.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const JSONLD_FAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Where is the International Space Station right now?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can see the live position on this page — the ISS is shown as a yellow satellite icon moving across a 3D globe, updated every 3 seconds.",
      },
    },
    {
      "@type": "Question",
      name: "How fast does the ISS travel?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "About 7.66 kilometres per second — roughly 27,600 km/h. It circles Earth every 93 minutes.",
      },
    },
    {
      "@type": "Question",
      name: "How high is the ISS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Approximately 400 km above Earth's surface — about 1,000 times higher than a typical commercial flight.",
      },
    },
    {
      "@type": "Question",
      name: "Can I see the ISS with the naked eye?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. It's the third-brightest object in the night sky after the Moon and Venus. Best visibility is 1–2 hours after sunset or before sunrise. Use the 'Passes Over You' panel to find the next visible pass over your city.",
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
