import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pilot Game — Can You Circle the Earth by Guessing Where You Are?",
  description:
    "A geography game. You wake up over a random part of the world — tell us which country or ocean you're over, and you'll fly 1,500 km east. Circle the planet to win.",
  keywords: [
    "geography game",
    "country guessing game",
    "where am I geography",
    "circumnavigate earth game",
    "interactive globe game",
  ],
  openGraph: {
    title: "Pilot Game · GeographicHub",
    description: "Wake up as a pilot. Guess where you are. Circle the Earth.",
    type: "website",
  },
  alternates: { canonical: "/maps/pilot-game" },
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
