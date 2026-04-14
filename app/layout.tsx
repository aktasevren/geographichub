import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/components/LocaleProvider";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://maphub.example";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GeographicHub — İnteraktif Haritalar",
    template: "%s · GeographicHub",
  },
  description:
    "GeographicHub, açık coğrafi verilerle inşa edilmiş interaktif haritalar sunar. Savaş tarihi, canlı uydular, dünya mutfağı, gizli markalar ve vizesiz seyahat.",
  keywords: [
    "interactive maps",
    "map hub",
    "ISS tracker",
    "visa-free map",
    "passport map",
    "world cuisine map",
    "hidden brands",
    "cartography",
    "geographic visualization",
    "3D globe",
    "open data atlas",
  ],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "GeographicHub — İnteraktif Haritalar",
    description:
      "Savaş tarihi, canlı uydular, dünya mutfağı, gizli markalar — açık veriyle interaktif kartografi.",
    type: "website",
    siteName: "GeographicHub",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "GeographicHub — İnteraktif Haritalar",
    description:
      "Savaş tarihi, canlı uydular, dünya mutfağı, gizli markalar — açık veriyle interaktif kartografi.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

const JSONLD_SITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GeographicHub",
  url: SITE_URL,
  description:
    "A growing hub of interactive maps built on open geographic data.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const JSONLD_ORG = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GeographicHub",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_SITE) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_ORG) }}
        />
      </head>
      <body className="grain contour-bg">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
