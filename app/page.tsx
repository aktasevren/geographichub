"use client";

import Link from "next/link";
import { useLocale, LocaleToggle } from "@/components/LocaleProvider";

export default function Home() {
  const { t, locale } = useLocale();

  const title = locale === "tr" ? "Savaş Haritaları" : "War Maps";
  const meta = locale === "tr" ? "1 savaş haritalandı" : "1 war mapped";
  const tag = locale === "tr" ? "Tarih · Küre" : "History · Globe";

  return (
    <div className="relative min-h-screen grain flex flex-col">
      <header className="relative z-30 flex justify-between items-center px-5 md:px-10 py-4 md:py-5">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <BrandMark />
          <span className="font-serif text-[19px] md:text-[22px] tracking-tight">
            GeographicHub
          </span>
        </Link>
        <div className="flex items-center gap-5 md:gap-7 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-2)]">
          <Link href="/about" className="link-u hidden sm:inline">
            {t("nav.about")}
          </Link>
          <LocaleToggle theme="light" />
        </div>
      </header>

      <section className="px-5 md:px-10 pt-3 md:pt-6 pb-4 md:pb-6 flex-1 flex flex-col">
        <div className="max-w-[1200px] w-full mx-auto flex-1 flex flex-col">
          <FeaturedMap title={title} meta={meta} tag={tag} t={t} />
        </div>
      </section>

      <footer className="px-5 md:px-10 py-5 hair-t">
        <div className="max-w-[1200px] mx-auto flex flex-wrap justify-between items-center gap-3 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
          <span>
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </span>
          <div className="flex gap-5 md:gap-6">
            <Link href="/about" className="hover:text-[var(--text)]">
              {t("nav.about")}
            </Link>
            <Link href="/legal/trademarks" className="hover:text-[var(--text)]">
              {t("footer.trademarks")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BrandMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none" aria-hidden>
      <path
        d="M 50 22 A 20 20 0 1 0 44 48 L 44 34 L 34 34"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="32" cy="32" rx="20" ry="8" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="12" y1="32" x2="52" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <circle cx="52" cy="32" r="2" fill="currentColor" />
    </svg>
  );
}

function FeaturedMap({
  title,
  meta,
  tag,
  t,
}: {
  title: string;
  meta: string;
  tag: string;
  t: (k: any) => string;
}) {
  return (
    <Link
      href="/maps/wars"
      className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-[var(--line-2)] hover:border-white/40 transition-all duration-500 block flex-1 min-h-[72vh]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0806] via-[#2a0f0a] to-[#3d1d12]" />
      <div
        className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(245,158,11,0.45), transparent 55%), radial-gradient(circle at 75% 75%, rgba(245,158,11,0.35), transparent 55%)",
        }}
      />
      <WarsPreview />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      <div className="absolute inset-0 p-5 md:p-8 lg:p-10 flex flex-col justify-between text-white">
        <div className="flex justify-between items-start gap-4">
          <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.22em] text-white/65">
            <span className="text-white/35">N°</span>01 · {tag}
          </span>
          <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/60">
            {meta}
          </span>
        </div>
        <div>
          <h2 className="font-serif leading-[0.95] tracking-tight text-5xl sm:text-6xl md:text-7xl lg:text-[96px]">
            {title}
          </h2>
          <span className="inline-flex items-center gap-2 mt-4 md:mt-6 font-mono text-[11px] md:text-[12px] uppercase tracking-[0.22em] text-white group-hover:gap-3 transition-all">
            {t("tile.enter")}
            <span className="inline-block h-px w-8 md:w-10 bg-white/50 group-hover:w-14 md:group-hover:w-16 group-hover:bg-white transition-all" />
            <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function WarsPreview() {
  return (
    <svg
      className="absolute -right-16 md:-right-10 top-1/2 -translate-y-1/2 opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      width="760"
      height="760"
      viewBox="0 0 400 400"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="warsGlobe" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#3d1d12" />
          <stop offset="100%" stopColor="#1a0806" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="180" fill="url(#warsGlobe)" />
      <circle cx="200" cy="200" r="180" stroke="rgba(245,158,11,0.3)" strokeWidth="1" fill="none" />
      <ellipse cx="200" cy="200" rx="180" ry="60" stroke="rgba(245,158,11,0.22)" strokeWidth="0.8" fill="none" />
      <ellipse cx="200" cy="200" rx="60" ry="180" stroke="rgba(245,158,11,0.22)" strokeWidth="0.8" fill="none" />

      {[
        { x: 118, y: 145, c: "#a855f7", icon: "🚩" },
        { x: 168, y: 168, c: "#ec4899", icon: "⚓" },
        { x: 215, y: 140, c: "#f59e0b", icon: "🏛" },
        { x: 260, y: 160, c: "#f59e0b", icon: "🏛" },
        { x: 230, y: 205, c: "#eab308", icon: "⭐" },
        { x: 278, y: 195, c: "#dc2626", icon: "⚔" },
        { x: 180, y: 225, c: "#dc2626", icon: "⚔" },
        { x: 310, y: 238, c: "#dc2626", icon: "⚔" },
        { x: 128, y: 252, c: "#22c55e", icon: "✨" },
        { x: 245, y: 268, c: "#06b6d4", icon: "🕊" },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="15" fill={p.c} stroke="white" strokeWidth="2.2" />
          <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="14">
            {p.icon}
          </text>
        </g>
      ))}
    </svg>
  );
}
