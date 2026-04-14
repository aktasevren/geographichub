import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biography Map — A Famous Life on a 3D Globe",
  description:
    "Search any famous person and see their life as a map: birth, schools, residences, workplaces, death — pinned on a globe with chronological arcs.",
  keywords: [
    "biography map",
    "life map",
    "famous person life locations",
    "wikipedia life events map",
    "where was X born",
  ],
  openGraph: {
    title: "Biography Map · GeographicHub",
    description: "Pin the life of any famous person on a 3D globe.",
    type: "website",
  },
  alternates: { canonical: "/maps/biography" },
};

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Biography Map",
  applicationCategory: "Reference",
  operatingSystem: "Any",
  description:
    "Interactive map that pins birth, education, residence, work and death locations of any famous person.",
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
