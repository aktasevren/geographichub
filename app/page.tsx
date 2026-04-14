"use client";

import Link from "next/link";
import { useLocale, LocaleToggle } from "@/components/LocaleProvider";

export default function Home() {
  const { t, locale } = useLocale();

  const warTitle = locale === "tr" ? "Kurtuluş Savaşı" : "Turkish War of Independence";
  const warBlurb =
    locale === "tr"
      ? "Bir savaş ara — her muharebeyi, antlaşmayı ve dönüm noktasını tarihî bir harita üzerinde gör. Her konum için kısa hikâye ve gerçek fotoğraf."
      : "Search any war — see every battle, treaty and turning point on a historical globe, with a short story and real photo per location.";
  const meta = locale === "tr" ? "17 olay haritalandı" : "17 events mapped";

  return (
    <div className="relative min-h-screen grain flex flex-col">
      {/* Header */}
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

      {/* Hero — compact */}
      <section className="px-5 md:px-10 pt-6 md:pt-12 pb-4 md:pb-6">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="font-serif font-light text-[36px] sm:text-5xl md:text-6xl lg:text-7xl leading-[0.98] tracking-tight">
            {t("home.heroA")}{" "}
            <span className="italic" style={{ color: "var(--accent)" }}>
              {t("home.heroB")}
            </span>
          </h1>
        </div>
      </section>

      {/* Featured map — dominant */}
      <section className="px-5 md:px-10 pb-8 md:pb-10 flex-1">
        <div className="max-w-[1200px] mx-auto">
          <FeaturedMap
            title={warTitle}
            blurb={warBlurb}
            meta={meta}
            locale={locale}
            t={t}
          />
        </div>
      </section>

      {/* Minimal footer */}
      <footer className="px-5 md:px-10 py-6 md:py-7 hair-t">
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
      <ellipse
        cx="32"
        cy="32"
        rx="20"
        ry="8"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />
      <line
        x1="12"
        y1="32"
        x2="52"
        y2="32"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />
      <circle cx="52" cy="32" r="2" fill="currentColor" />
    </svg>
  );
}

function FeaturedMap({
  title,
  blurb,
  meta,
  locale,
  t,
}: {
  title: string;
  blurb: string;
  meta: string;
  locale: string;
  t: (k: any) => string;
}) {
  const newLabel = locale === "tr" ? "Yeni" : "New";
  const numLabel = locale === "tr" ? "N°" : "N°";
  const tagLabel =
    locale === "tr" ? "Tarih · Küre" : "History · Globe";

  return (
    <Link
      href="/maps/wars"
      className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-[var(--line-2)] hover:border-white/40 transition-all duration-500 block h-[72vh] min-h-[440px] md:min-h-[520px]"
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/40 to-transparent" />

      {/* NEW ribbon — locale aware */}
      <div className="absolute top-4 md:top-5 right-4 md:right-5 z-10 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.25em] px-2 md:px-2.5 py-1 rounded-full bg-emerald-400/90 text-black font-semibold">
        ● {newLabel}
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-5 md:p-8 lg:p-10 flex flex-col justify-between text-white">
        <div className="flex justify-between items-start gap-4 pr-16 md:pr-20">
          <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.22em] text-white/65">
            <span className="text-white/35">{numLabel}</span>01 · {tagLabel}
          </span>
          <span className="hidden sm:inline font-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/60">
            {meta}
          </span>
        </div>
        <div>
          <h2 className="font-serif leading-[0.98] tracking-tight mb-2 md:mb-3 text-[34px] sm:text-5xl md:text-6xl lg:text-[80px]">
            {title}
          </h2>
          <p className="text-white/80 leading-relaxed text-[14px] md:text-[16px] max-w-[620px]">
            {blurb}
          </p>
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
      className="absolute -right-12 -top-12 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
      width="720"
      height="720"
      viewBox="0 0 400 400"
      aria-hidden
      preserveAspectRatio="xMaxYMid slice"
    >
      <defs>
        <radialGradient id="warsGlobe" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#3d1d12" />
          <stop offset="100%" stopColor="#1a0806" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="170" fill="url(#warsGlobe)" />
      <circle cx="200" cy="200" r="170" stroke="rgba(245,158,11,0.28)" strokeWidth="1" fill="none" />
      <ellipse cx="200" cy="200" rx="170" ry="58" stroke="rgba(245,158,11,0.2)" strokeWidth="0.8" fill="none" />
      <ellipse cx="200" cy="200" rx="58" ry="170" stroke="rgba(245,158,11,0.2)" strokeWidth="0.8" fill="none" />

      {[
        { x: 120, y: 150, c: "#a855f7", icon: "🚩" },
        { x: 170, y: 170, c: "#ec4899", icon: "⚓" },
        { x: 215, y: 145, c: "#f59e0b", icon: "🏛" },
        { x: 255, y: 165, c: "#f59e0b", icon: "🏛" },
        { x: 230, y: 205, c: "#eab308", icon: "⭐" },
        { x: 275, y: 195, c: "#dc2626", icon: "⚔" },
        { x: 180, y: 225, c: "#dc2626", icon: "⚔" },
        { x: 305, y: 235, c: "#dc2626", icon: "⚔" },
        { x: 130, y: 250, c: "#22c55e", icon: "✨" },
        { x: 240, y: 265, c: "#06b6d4", icon: "🕊" },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="14" fill={p.c} stroke="white" strokeWidth="2" />
          <text
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="13"
          >
            {p.icon}
          </text>
        </g>
      ))}
    </svg>
  );
}
