import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbs, faqPage, jsonLd } from "@/lib/seo";
import RelatedMaps from "@/components/RelatedMaps";

export const metadata: Metadata = {
  title: "How to Spot the ISS with the Naked Eye — A Short Guide",
  description:
    "The International Space Station is the third-brightest object in the night sky. Here's exactly when to look, where to look, and what you'll see.",
  keywords: [
    "how to see the ISS",
    "how to spot the International Space Station",
    "can you see the ISS from earth",
    "ISS naked eye",
    "when to see the ISS",
  ],
  alternates: { canonical: "/maps/iss/how-to-spot" },
  openGraph: {
    title: "How to Spot the ISS with the Naked Eye · GeographicHub",
    description:
      "When, where and how to see the International Space Station from your own backyard.",
    type: "article",
  },
};

const FAQS = [
  {
    question: "Can you see the ISS with the naked eye?",
    answer:
      "Yes. The International Space Station reflects sunlight and appears as a fast-moving, steady bright point — brighter than most stars and planets. No telescope is needed; binoculars help only if you want to make out a shape.",
  },
  {
    question: "What does the ISS look like?",
    answer:
      "A steady, non-blinking white-ish point of light moving silently across the sky. It looks like a bright star, but it moves. A pass lasts about 2 to 6 minutes as the station crosses from horizon to horizon.",
  },
  {
    question: "What time should I look?",
    answer:
      "The best passes happen roughly 1–2 hours after sunset or 1–2 hours before sunrise — when the sky is dark but the station is still sunlit 400 km up. During the middle of the night the ISS is usually in Earth's shadow and invisible.",
  },
  {
    question: "Do I need a telescope or an app?",
    answer:
      "No telescope. A free app — or GeographicHub's live ISS tracker — is enough to tell you when the next pass is, in which direction it will rise, and at what maximum altitude.",
  },
  {
    question: "How fast is the ISS moving?",
    answer:
      "About 7.66 km per second, or 27,600 km per hour. It circles the Earth every ~93 minutes, which means 16 sunrises and sunsets per day for the crew.",
  },
];

export default function HowToSpotPage() {
  const bc = breadcrumbs([
    { name: "GeographicHub", path: "/" },
    { name: "ISS Tracker", path: "/maps/iss" },
    { name: "How to spot", path: "/maps/iss/how-to-spot" },
  ]);
  const faq = faqPage(FAQS);

  return (
    <div className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(bc)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(faq)}
      />

      <header className="flex justify-between items-center px-6 md:px-10 py-5 border-b border-white/10">
        <Link
          href="/maps/iss"
          className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70 hover:text-white"
        >
          ← Live ISS tracker
        </Link>
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70 hover:text-white"
        >
          GeographicHub
        </Link>
      </header>

      <nav
        className="px-6 md:px-10 pt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-white/70">GeographicHub</Link>
        <span className="mx-2">/</span>
        <Link href="/maps/iss" className="hover:text-white/70">ISS Tracker</Link>
        <span className="mx-2">/</span>
        <span className="text-white/70">How to spot</span>
      </nav>

      <section className="max-w-[820px] mx-auto px-6 md:px-10 pt-10 pb-14">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-4">
          § A short guide
        </div>
        <h1 className="font-serif font-light text-4xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight">
          How to spot the <span className="italic text-[#ffcc33]">ISS</span>
        </h1>
        <p className="mt-6 text-[17px] md:text-[20px] leading-relaxed text-white/80">
          The International Space Station is the third-brightest object in the
          night sky — after the Moon and Venus. You don't need a telescope, a
          dark-sky park, or any skill. You just need to know when to look.
        </p>
      </section>

      <section className="max-w-[820px] mx-auto px-6 md:px-10 py-10 border-t border-white/10">
        <h2 className="font-serif text-3xl md:text-4xl mb-6">Step by step</h2>
        <ol className="space-y-6">
          {[
            {
              n: "1",
              title: "Check the next pass time",
              body: (
                <>
                  Open GeographicHub's{" "}
                  <Link
                    href="/maps/iss"
                    className="underline decoration-white/40 hover:decoration-white"
                  >
                    live ISS tracker
                  </Link>
                  , tap <em>Use my location</em>, and it will compute the next
                  few visible passes over your city. Each listing shows the
                  start time, end time, and maximum altitude above the horizon.
                </>
              ),
            },
            {
              n: "2",
              title: "Pick a twilight pass",
              body: (
                <>
                  The best passes are 1–2 hours after sunset or before sunrise,
                  when the sky is dark but the station is still sunlit 400 km
                  above you. Passes at midnight usually happen in Earth's
                  shadow — the station exists but you can't see it.
                </>
              ),
            },
            {
              n: "3",
              title: "Face the right direction",
              body: (
                <>
                  The tracker tells you from which compass direction the ISS
                  rises. Usually it climbs from the west or north-west. Give
                  your eyes 2–3 minutes outside to adjust to the dark.
                </>
              ),
            },
            {
              n: "4",
              title: "Watch for a steady bright point",
              body: (
                <>
                  It looks like a star that moves. It does not blink like a
                  plane and makes no sound. A pass lasts 2 to 6 minutes from
                  horizon to horizon.
                </>
              ),
            },
            {
              n: "5",
              title: "Wave — they might see the same sunset",
              body: (
                <>
                  There are usually 7 astronauts aboard. At 7.66 km/s they see
                  sixteen sunsets a day. You won't get a reply, but it's a
                  surprisingly moving moment.
                </>
              ),
            },
          ].map((s) => (
            <li key={s.n} className="flex gap-5">
              <div className="font-serif text-3xl text-[#ffcc33] leading-none shrink-0">
                {s.n}
              </div>
              <div>
                <h3 className="font-serif text-xl md:text-2xl mb-1">
                  {s.title}
                </h3>
                <p className="text-white/80 text-[15px] leading-relaxed">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-[820px] mx-auto px-6 md:px-10 py-10 border-t border-white/10">
        <h2 className="font-serif text-3xl md:text-4xl mb-6">
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          {FAQS.map((f) => (
            <div key={f.question} className="border-b border-white/10 pb-5">
              <h3 className="font-serif text-xl mb-2">{f.question}</h3>
              <p className="text-white/75 text-[15px] leading-relaxed">
                {f.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-10 py-10 border-t border-white/10 text-center">
        <Link
          href="/maps/iss"
          className="inline-block px-6 py-3 rounded-full border border-[#ffcc33]/40 bg-[#ffcc33]/10 hover:bg-[#ffcc33]/20 text-[#ffcc33] font-mono text-[11px] uppercase tracking-[0.22em]"
        >
          Open the live tracker →
        </Link>
      </section>

      <RelatedMaps exclude="/maps/iss" />

      <footer className="px-6 md:px-10 py-8 border-t border-white/10 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 flex flex-wrap justify-between gap-4">
        <span>© {new Date().getFullYear()} GeographicHub</span>
        <span>Data · Where The ISS At? · CelesTrak TLE · Open Notify</span>
      </footer>
    </div>
  );
}
