import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trademark & Fair Use Notice",
  description:
    "How GeographicHub uses third-party brand names, logos, and marks in editorial / informational contexts.",
  alternates: { canonical: "/legal/trademarks" },
  robots: { index: true, follow: true },
};

export default function TrademarksPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex justify-between items-center px-6 md:px-10 py-5 border-b border-white/10">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70 hover:text-white"
        >
          ← GeographicHub
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
          Legal
        </span>
      </header>

      <section className="max-w-[820px] mx-auto px-6 md:px-10 py-14 md:py-20">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-4">
          § Trademarks & Fair Use
        </div>
        <h1 className="font-serif font-light text-4xl md:text-6xl leading-[1.0] tracking-tight">
          Brands belong to their owners.
        </h1>

        <div className="mt-10 space-y-6 text-[16px] leading-relaxed text-white/80">
          <p>
            GeographicHub's <Link href="/maps/hidden-brands" className="underline decoration-white/40 hover:decoration-white">Hidden Brands</Link> atlas
            and related pages reference registered trademarks, product names, logos,
            and related marks owned by third parties.
          </p>

          <p>
            All such marks are property of their respective owners. GeographicHub is not
            affiliated with, endorsed by, sponsored by, or in any way officially
            connected to any of the companies or brands it describes.
          </p>

          <p>
            We use these marks in strictly editorial and informational contexts —
            specifically <em>nominative fair use</em>: identifying the brands we
            discuss so that readers can understand which products are which. This is
            the same editorial use relied on by Wikipedia, encyclopedias,
            newspapers, and the general press.
          </p>

          <h2 className="font-serif text-2xl md:text-3xl mt-10 pt-6 border-t border-white/10">
            Specifically
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-2 text-white/80">
            <li>
              Brand names are used factually to describe which company sells which
              product in which country.
            </li>
            <li>
              Logos, where shown, are sourced from Wikipedia / Wikimedia Commons
              under their own fair-use rationales.
            </li>
            <li>
              We do not sell, distribute, or resell any referenced product.
            </li>
            <li>
              We do not imply that any rights-holder has approved this content.
            </li>
            <li>
              Historical facts about rebrands and trademark disputes are drawn from
              publicly available reporting and Wikipedia.
            </li>
          </ul>

          <h2 className="font-serif text-2xl md:text-3xl mt-10 pt-6 border-t border-white/10">
            Rights-holder requests
          </h2>
          <p>
            If you hold rights to a mark featured here and would prefer alternate
            attribution, correction, or removal, please contact us and we will
            respond promptly. Identify the mark, the page URL, and your
            relationship to the rights-holder.
          </p>

          <h2 className="font-serif text-2xl md:text-3xl mt-10 pt-6 border-t border-white/10">
            Data sources
          </h2>
          <p>
            Underlying data is drawn from publicly available sources — principally
            Wikipedia (CC BY-SA 4.0), Wikimedia Commons, and open datasets such as
            the passport-index-dataset (MIT). Attribution is included in every
            map's footer.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 font-mono text-[11px] uppercase tracking-[0.22em] text-white/40">
          Last reviewed: {new Date().toISOString().slice(0, 10)}
        </div>
      </section>

      <footer className="px-6 md:px-10 py-8 border-t border-white/10 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 flex flex-wrap justify-between gap-4">
        <span>© {new Date().getFullYear()} GeographicHub</span>
        <Link href="/" className="hover:text-white">
          GeographicHub
        </Link>
      </footer>
    </div>
  );
}
