import Link from "next/link";

type MapEntry = {
  href: string;
  title: string;
  blurb: string;
  accent: string;
};

const ALL: MapEntry[] = [
  {
    href: "/maps/iss",
    title: "Track the ISS",
    blurb: "Live position of the space station on a 3D globe.",
    accent: "#8ab4ff",
  },
  {
    href: "/maps/visa-free",
    title: "Visa-Free Atlas",
    blurb: "Where your passport can take you without paperwork.",
    accent: "#16a34a",
  },
  {
    href: "/maps/taste-passport",
    title: "Taste Passport",
    blurb: "A bucket list of the world's signature dishes.",
    accent: "#f59e0b",
  },
  {
    href: "/maps/hidden-brands",
    title: "Hidden Brands",
    blurb: "Same product, different name around the world.",
    accent: "#ef4444",
  },
];

export default function RelatedMaps({
  exclude,
  theme = "dark",
}: {
  exclude?: string;
  theme?: "dark" | "light";
}) {
  const list = ALL.filter((m) => m.href !== exclude).slice(0, 3);
  const isDark = theme === "dark";
  return (
    <section
      className={`px-6 md:px-10 py-14 border-t ${
        isDark ? "border-white/10" : "border-black/10"
      }`}
    >
      <div className="max-w-[1100px] mx-auto">
        <div
          className={`font-mono text-[10px] uppercase tracking-[0.28em] mb-6 ${
            isDark ? "text-white/40" : "text-black/40"
          }`}
        >
          More maps on GeographicHub
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {list.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`group block p-5 rounded-xl border transition ${
                isDark
                  ? "border-white/10 hover:border-white/30 bg-white/[0.03]"
                  : "border-black/10 hover:border-black/30 bg-black/[0.03]"
              }`}
            >
              <div
                className="w-3 h-3 rounded-full mb-3"
                style={{ background: m.accent }}
              />
              <h3 className="font-serif text-xl leading-tight mb-1">
                {m.title}
              </h3>
              <p
                className={`text-[13px] leading-relaxed ${
                  isDark ? "text-white/65" : "text-black/65"
                }`}
              >
                {m.blurb}
              </p>
              <span
                className="inline-block mt-3 font-mono text-[10px] uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform"
                style={{ color: m.accent }}
              >
                Open →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
