"use client";

import Link from "next/link";
import { useLocale, LocaleToggle } from "@/components/LocaleProvider";

export default function Home() {
  const { t, locale } = useLocale();

  const title = locale === "tr" ? "Savaş Haritaları" : "War Maps";
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

      <section className="px-5 md:px-10 pt-3 md:pt-6 pb-5 flex-1 flex flex-col">
        <div className="max-w-[1200px] w-full mx-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 min-h-[72vh]">
          <div className="md:col-span-2 flex">
            <FeaturedMap title={title} tag={tag} t={t} />
          </div>
          <div className="md:col-span-1 flex flex-col gap-4 md:gap-5">
            <TastePassportTile t={t} locale={locale} />
            <IssTile t={t} locale={locale} />
          </div>
        </div>
      </section>

      <section className="px-5 md:px-10 pb-5">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <PilotTile t={t} locale={locale} />
          <AlliancesTile t={t} locale={locale} />
        </div>
      </section>

      <section className="px-5 md:px-10 pb-12">
        <div className="max-w-[1200px] mx-auto">
          <AnthemsTile t={t} locale={locale} />
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
  tag,
  t,
}: {
  title: string;
  tag: string;
  t: (k: any) => string;
}) {
  const parts = tag.split(" · ");
  return (
    <Link
      href="/maps/wars"
      className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-[var(--line-2)] hover:border-white/40 transition-all duration-500 block flex-1 w-full min-h-[52vh] md:min-h-0"
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
        {/* Top tags — chips, more prominent */}
        <div className="flex flex-wrap gap-2">
          {parts.map((p) => (
            <span
              key={p}
              className="font-mono text-[11px] md:text-[12px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-[#fcd34d]/45 bg-[#fcd34d]/10 text-[#fcd34d] backdrop-blur-sm"
            >
              {p}
            </span>
          ))}
        </div>

        <div>
          <h2 className="font-serif leading-[0.95] tracking-tight text-5xl sm:text-6xl md:text-7xl lg:text-[96px]">
            {title}
          </h2>
          {/* Big primary CTA button */}
          <div className="mt-6 md:mt-8">
            <span className="inline-flex items-center gap-3 md:gap-4 px-6 md:px-8 py-3 md:py-4 rounded-full bg-[#fcd34d] text-black font-mono text-[13px] md:text-[15px] uppercase tracking-[0.22em] font-semibold group-hover:gap-5 transition-all shadow-lg shadow-black/40">
              {t("tile.enter")}
              <span className="inline-block h-px w-8 md:w-10 bg-black/60 group-hover:w-14 md:group-hover:w-16 transition-all" />
              <span className="text-lg md:text-xl">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function TastePassportTile({
  t,
  locale,
}: {
  t: (k: any) => string;
  locale: string;
}) {
  const title = locale === "tr" ? "Damak Pasaportu" : "Taste Passport";
  const parts =
    locale === "tr"
      ? ["Oyun", "Dünya Mutfağı"]
      : ["Gamified", "World Cuisine"];
  return (
    <Link
      href="/maps/taste-passport"
      className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-[var(--line-2)] hover:border-white/40 transition-all duration-500 block flex-1 w-full min-h-[52vh] md:min-h-0"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#2a1208] via-[#3e1f12] to-[#5a2e1a]" />
      <div
        className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(255,180,100,0.45), transparent 55%), radial-gradient(circle at 75% 75%, rgba(251,113,133,0.3), transparent 55%)",
        }}
      />
      <TasteBigPreview />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      <div className="absolute inset-0 p-5 md:p-7 lg:p-8 flex flex-col justify-between text-white">
        <div className="flex flex-wrap gap-2">
          {parts.map((p) => (
            <span
              key={p}
              className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border border-[#fdba74]/50 bg-[#fdba74]/10 text-[#fdba74] backdrop-blur-sm"
            >
              {p}
            </span>
          ))}
        </div>

        <div>
          <h2 className="font-serif leading-[0.95] tracking-tight text-3xl sm:text-4xl md:text-4xl lg:text-[46px]">
            {title}
          </h2>
          <div className="mt-4 md:mt-5">
            <span className="inline-flex items-center gap-2.5 md:gap-3 px-4 md:px-5 py-2.5 md:py-3 rounded-full bg-[#fdba74] text-black font-mono text-[11px] md:text-[12px] uppercase tracking-[0.2em] font-semibold group-hover:gap-4 transition-all shadow-lg shadow-black/40">
              {t("tile.enter")}
              <span className="inline-block h-px w-5 md:w-6 bg-black/60 group-hover:w-10 transition-all" />
              <span className="text-base">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function IssTile({
  t,
  locale,
}: {
  t: (k: any) => string;
  locale: string;
}) {
  const title = locale === "tr" ? "ISS Takibi" : "ISS Tracker";
  const parts =
    locale === "tr"
      ? ["Canlı", "Uzay"]
      : ["Live", "Space"];
  return (
    <Link
      href="/maps/iss"
      className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-[var(--line-2)] hover:border-white/40 transition-all duration-500 block flex-1 w-full min-h-[26vh] md:min-h-0"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#050a1c] via-[#0c1530] to-[#161f4a]" />
      <div
        className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(138,180,255,0.45), transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,204,51,0.25), transparent 55%)",
        }}
      />
      <IssBigPreview />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      <div className="absolute inset-0 p-5 md:p-7 flex flex-col justify-between text-white">
        <div className="flex flex-wrap gap-2">
          {parts.map((p) => (
            <span
              key={p}
              className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border border-[#8ab4ff]/50 bg-[#8ab4ff]/10 text-[#8ab4ff] backdrop-blur-sm"
            >
              {p}
            </span>
          ))}
        </div>

        <div>
          <h2 className="font-serif leading-[0.95] tracking-tight text-3xl sm:text-4xl md:text-4xl lg:text-[46px]">
            {title}
          </h2>
          <div className="mt-4 md:mt-5">
            <span className="inline-flex items-center gap-2.5 md:gap-3 px-4 md:px-5 py-2.5 md:py-3 rounded-full bg-[#8ab4ff] text-black font-mono text-[11px] md:text-[12px] uppercase tracking-[0.2em] font-semibold group-hover:gap-4 transition-all shadow-lg shadow-black/40">
              {t("tile.enter")}
              <span className="inline-block h-px w-5 md:w-6 bg-black/60 group-hover:w-10 transition-all" />
              <span className="text-base">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PilotTile({
  t,
  locale,
}: {
  t: (k: any) => string;
  locale: string;
}) {
  const title = t("home.pilotTitle");
  const blurb = t("home.pilotBlurb");
  const parts = [t("pilot.tag1"), t("pilot.tag2")];
  return (
    <Link
      href="/maps/pilot-game"
      className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-[var(--line-2)] hover:border-white/40 transition-all duration-500 block min-h-[280px] md:min-h-[320px]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f14] via-[#0c2a1c] to-[#10402a]" />
      <div
        className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 30%, rgba(34,197,94,0.45), transparent 55%), radial-gradient(circle at 80% 70%, rgba(74,222,128,0.25), transparent 55%)",
        }}
      />
      <PilotBigPreview />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent md:bg-gradient-to-t md:from-black/80 md:via-black/10 md:to-transparent" />

      <div className="absolute inset-0 p-5 md:p-8 lg:p-10 flex flex-col justify-between text-white">
        <div className="flex flex-wrap gap-2">
          {parts.map((p) => (
            <span
              key={p}
              className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border border-[#4ade80]/55 bg-[#4ade80]/10 text-[#4ade80] backdrop-blur-sm"
            >
              {p}
            </span>
          ))}
        </div>

        <div className="max-w-[640px]">
          <h2 className="font-serif leading-[0.95] tracking-tight text-4xl md:text-5xl lg:text-[64px]">
            {title}
          </h2>
          <p className="mt-3 md:mt-4 text-white/80 text-[14px] md:text-[15px] leading-relaxed max-w-[520px]">
            {blurb}
          </p>
          <div className="mt-5 md:mt-6">
            <span className="inline-flex items-center gap-3 md:gap-4 px-5 md:px-7 py-3 md:py-3.5 rounded-full bg-[#4ade80] text-black font-mono text-[12px] md:text-[14px] uppercase tracking-[0.22em] font-semibold group-hover:gap-5 transition-all shadow-lg shadow-black/40">
              {t("tile.enter")}
              <span className="inline-block h-px w-6 md:w-8 bg-black/60 group-hover:w-12 transition-all" />
              <span className="text-lg">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function AlliancesTile({
  t,
  locale,
}: {
  t: (k: any) => string;
  locale: string;
}) {
  const title = t("home.alliancesTitle");
  const blurb = t("home.alliancesBlurb");
  const parts = [t("home.alliancesTag1"), t("home.alliancesTag2")];
  return (
    <Link
      href="/maps/alliances"
      className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-[var(--line-2)] hover:border-white/40 transition-all duration-500 block min-h-[280px] md:min-h-[320px]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#08152a] via-[#0e2548] to-[#163b6e]" />
      <div
        className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(56,189,248,0.4), transparent 55%), radial-gradient(circle at 75% 75%, rgba(168,85,247,0.25), transparent 55%)",
        }}
      />
      <AlliancesBigPreview />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent md:bg-gradient-to-t md:from-black/80 md:via-black/10 md:to-transparent" />

      <div className="absolute inset-0 p-5 md:p-7 flex flex-col justify-between text-white">
        <div className="flex flex-wrap gap-2">
          {parts.map((p) => (
            <span
              key={p}
              className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border border-[#38bdf8]/55 bg-[#38bdf8]/10 text-[#38bdf8] backdrop-blur-sm"
            >
              {p}
            </span>
          ))}
        </div>

        <div className="max-w-[560px]">
          <h2 className="font-serif leading-[0.95] tracking-tight text-4xl md:text-5xl lg:text-[60px]">
            {title}
          </h2>
          <p className="mt-3 md:mt-4 text-white/80 text-[14px] md:text-[15px] leading-relaxed max-w-[460px]">
            {blurb}
          </p>
          <div className="mt-5 md:mt-6">
            <span className="inline-flex items-center gap-3 md:gap-4 px-5 md:px-7 py-3 md:py-3.5 rounded-full bg-[#38bdf8] text-black font-mono text-[12px] md:text-[14px] uppercase tracking-[0.22em] font-semibold group-hover:gap-5 transition-all shadow-lg shadow-black/40">
              {t("tile.enter")}
              <span className="inline-block h-px w-6 md:w-8 bg-black/60 group-hover:w-12 transition-all" />
              <span className="text-lg">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function AnthemsTile({
  t,
  locale,
}: {
  t: (k: any) => string;
  locale: string;
}) {
  const title = t("home.anthemsTitle");
  const blurb = t("home.anthemsBlurb");
  const parts = [t("home.anthemsTag1"), t("home.anthemsTag2")];
  return (
    <Link
      href="/maps/anthems"
      className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-[var(--line-2)] hover:border-white/40 transition-all duration-500 block min-h-[260px] md:min-h-[300px]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#2a0d2e] via-[#3d1247] to-[#5b1d6e]" />
      <div
        className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 30%, rgba(232,195,106,0.4), transparent 55%), radial-gradient(circle at 80% 70%, rgba(217,70,239,0.3), transparent 55%)",
        }}
      />
      <AnthemsBigPreview />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent md:bg-gradient-to-t md:from-black/80 md:via-black/10 md:to-transparent" />

      <div className="absolute inset-0 p-5 md:p-7 lg:p-9 flex flex-col justify-between text-white">
        <div className="flex flex-wrap gap-2">
          {parts.map((p) => (
            <span
              key={p}
              className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border border-[#e8c36a]/55 bg-[#e8c36a]/10 text-[#e8c36a] backdrop-blur-sm"
            >
              {p}
            </span>
          ))}
        </div>

        <div className="max-w-[640px]">
          <h2 className="font-serif leading-[0.95] tracking-tight text-4xl md:text-5xl lg:text-[64px]">
            {title}
          </h2>
          <p className="mt-3 md:mt-4 text-white/80 text-[14px] md:text-[15px] leading-relaxed max-w-[520px]">
            {blurb}
          </p>
          <div className="mt-5 md:mt-6">
            <span className="inline-flex items-center gap-3 md:gap-4 px-5 md:px-7 py-3 md:py-3.5 rounded-full bg-[#e8c36a] text-black font-mono text-[12px] md:text-[14px] uppercase tracking-[0.22em] font-semibold group-hover:gap-5 transition-all shadow-lg shadow-black/40">
              {t("tile.enter")}
              <span className="inline-block h-px w-6 md:w-8 bg-black/60 group-hover:w-12 transition-all" />
              <span className="text-lg">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function AnthemsBigPreview() {
  return (
    <svg
      className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      width="700"
      height="700"
      viewBox="0 0 400 400"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="anthemBg" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#5b1d6e" />
          <stop offset="100%" stopColor="#2a0d2e" />
        </radialGradient>
      </defs>
      {/* world frame */}
      <ellipse
        cx="200" cy="200" rx="170" ry="115"
        fill="url(#anthemBg)"
        stroke="rgba(232,195,106,0.3)" strokeWidth="1"
      />
      {/* graticule */}
      {[140, 175, 200, 225, 260].map((y) => (
        <line key={y} x1="40" y1={y} x2="360" y2={y} stroke="rgba(255,255,255,0.06)" />
      ))}

      {/* highlighted countries with musical notes */}
      {[
        { x: 110, y: 160, color: "#e8c36a" },
        { x: 175, y: 145, color: "#e8c36a" },
        { x: 215, y: 140, color: "#e8c36a" },
        { x: 250, y: 160, color: "#e8c36a" },
        { x: 290, y: 175, color: "#e8c36a" },
        { x: 195, y: 200, color: "#e8c36a" },
        { x: 240, y: 215, color: "#e8c36a" },
        { x: 285, y: 230, color: "#e8c36a" },
        { x: 130, y: 235, color: "#e8c36a" },
        { x: 195, y: 270, color: "#e8c36a" },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="9" fill={p.color} fillOpacity="0.7" />
          <circle cx={p.x} cy={p.y} r="14" fill={p.color} fillOpacity="0.2" />
        </g>
      ))}

      {/* Big musical notes around */}
      <g fill="#e8c36a" opacity="0.85">
        <g transform="translate(75 120)">
          <ellipse cx="0" cy="14" rx="9" ry="6" transform="rotate(-15)" />
          <line x1="9" y1="14" x2="11" y2="-22" stroke="#e8c36a" strokeWidth="2.5" />
          <path d="M 11 -22 Q 22 -18 24 -8" stroke="#e8c36a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
        <g transform="translate(330 280)">
          <ellipse cx="0" cy="14" rx="8" ry="5.5" transform="rotate(-15)" />
          <line x1="8" y1="14" x2="10" y2="-18" stroke="#e8c36a" strokeWidth="2" />
          <path d="M 10 -18 Q 20 -14 22 -6" stroke="#e8c36a" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
        <g transform="translate(320 110)">
          <ellipse cx="0" cy="10" rx="7" ry="5" transform="rotate(-15)" />
          <line x1="7" y1="10" x2="9" y2="-14" stroke="#e8c36a" strokeWidth="2" />
        </g>
      </g>

      {/* Sound waves arc */}
      <g fill="none" stroke="#e8c36a" strokeOpacity="0.5">
        <path d="M 60 200 Q 30 220 60 240" strokeWidth="1.5" />
        <path d="M 50 195 Q 12 220 50 245" strokeWidth="1" />
        <path d="M 40 190 Q -5 220 40 250" strokeWidth="0.7" />
      </g>
    </svg>
  );
}

function AlliancesBigPreview() {
  // Stylized 2D map with member regions
  return (
    <svg
      className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      width="540"
      height="540"
      viewBox="0 0 400 400"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="alliBg" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#163b6e" />
          <stop offset="100%" stopColor="#08152a" />
        </radialGradient>
      </defs>
      {/* world frame */}
      <ellipse cx="200" cy="200" rx="170" ry="115" fill="url(#alliBg)" stroke="rgba(56,189,248,0.25)" strokeWidth="1" />

      {/* graticule lines */}
      {[140, 175, 200, 225, 260].map((y) => (
        <line key={y} x1="40" y1={y} x2="360" y2={y} stroke="rgba(255,255,255,0.06)" />
      ))}
      {[80, 130, 200, 270, 320].map((x) => (
        <line key={x} x1={x} y1="100" x2={x} y2="300" stroke="rgba(255,255,255,0.06)" />
      ))}

      {/* fake "country" patches in alliance colors */}
      {[
        // North America (NATO blue)
        { d: "M 80 145 Q 105 138 130 150 L 135 175 Q 110 185 85 178 Z", c: "#1e40af" },
        // Europe (EU cyan)
        { d: "M 165 130 Q 195 125 220 138 L 218 165 Q 188 172 162 162 Z", c: "#0ea5e9" },
        // Russia / Asia (SCO red)
        { d: "M 225 130 Q 270 122 310 140 L 305 175 Q 268 180 230 168 Z", c: "#b91c1c" },
        // Middle East (Arab League)
        { d: "M 188 170 Q 218 168 240 180 L 232 200 Q 205 205 185 195 Z", c: "#7c2d12" },
        // Africa (AU green)
        { d: "M 165 200 Q 200 198 235 215 L 225 270 Q 195 280 170 268 Z", c: "#16a34a" },
        // S. America (Mercosur emerald)
        { d: "M 105 215 Q 130 215 145 232 L 138 285 Q 118 290 100 275 Z", c: "#10b981" },
        // Asia/India
        { d: "M 245 175 Q 275 175 295 188 L 290 215 Q 265 220 245 208 Z", c: "#f59e0b" },
        // SE Asia ASEAN
        { d: "M 280 215 Q 305 215 320 228 L 315 252 Q 295 258 278 248 Z", c: "#dc2626" },
        // Australia
        { d: "M 290 260 Q 320 258 340 272 L 332 290 Q 305 292 290 282 Z", c: "#0891b2" },
      ].map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={p.c}
          fillOpacity="0.78"
          stroke="white"
          strokeOpacity="0.4"
          strokeWidth="1"
        />
      ))}

      {/* connection arcs */}
      <g fill="none" stroke="rgba(56,189,248,0.55)" strokeWidth="1.2" strokeDasharray="3 3">
        <path d="M 100 160 Q 130 100 200 140" />
        <path d="M 200 140 Q 250 105 290 150" />
        <path d="M 200 235 Q 240 280 320 280" />
      </g>

      {/* compass marker */}
      <g transform="translate(60, 105)" opacity="0.6">
        <circle r="14" fill="none" stroke="#38bdf8" strokeWidth="0.8" />
        <path d="M 0 -10 L 2 0 L 0 10 L -2 0 Z" fill="#38bdf8" />
        <text y="-16" textAnchor="middle" fontSize="9" fill="#38bdf8" fontFamily="serif" fontWeight="700">N</text>
      </g>
    </svg>
  );
}

function PilotBigPreview() {
  return (
    <svg
      className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      width="640"
      height="640"
      viewBox="0 0 400 400"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="pilotGlobeHome" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#1a3a28" />
          <stop offset="100%" stopColor="#062415" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="170" fill="url(#pilotGlobeHome)" />
      <circle
        cx="200" cy="200" r="170"
        stroke="rgba(34,197,94,0.3)" strokeWidth="1" fill="none"
      />
      <ellipse cx="200" cy="200" rx="170" ry="55" stroke="rgba(34,197,94,0.22)" strokeWidth="0.8" fill="none" />
      <ellipse cx="200" cy="200" rx="55" ry="170" stroke="rgba(34,197,94,0.22)" strokeWidth="0.8" fill="none" />

      {/* dashed great-circle flight trail */}
      <path
        d="M 60 230 Q 130 150 220 180 Q 300 200 350 130"
        stroke="#22c55e"
        strokeOpacity="0.75"
        strokeWidth="2.5"
        fill="none"
        strokeDasharray="6 5"
      />

      {/* waypoints */}
      {[[60, 230], [130, 180], [220, 180], [300, 175], [350, 130]].map(
        ([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="#22c55e" />
        )
      )}

      {/* plane at head — bigger */}
      <g transform="translate(350 130) rotate(-32)">
        <circle r="22" fill="rgba(34,197,94,0.28)" />
        <path
          d="M 0 -14 L 5 6 L 18 8 L 18 11 L 6 13 L 4 24 L -4 24 L -6 13 L -18 11 L -18 8 L -5 6 Z"
          fill="#22c55e"
          stroke="#054423"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
      </g>

      {/* small destination flag */}
      <g transform="translate(80 180)">
        <line x1="0" y1="0" x2="0" y2="-22" stroke="#86efac" strokeWidth="1.2" />
        <path d="M 0 -22 L 14 -16 L 0 -10 Z" fill="#22c55e" />
      </g>
    </svg>
  );
}

function IssBigPreview() {
  return (
    <svg
      className="absolute -right-8 -top-6 opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      width="500"
      height="500"
      viewBox="0 0 400 400"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="issAtmHome" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#1a2a4a" />
          <stop offset="100%" stopColor="#050816" />
        </radialGradient>
        <radialGradient id="issHaloHome" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8ab4ff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#8ab4ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="200" cy="200" r="180" fill="url(#issHaloHome)" />
      <circle cx="200" cy="200" r="135" fill="url(#issAtmHome)" />
      <circle cx="200" cy="200" r="135" stroke="rgba(138,180,255,0.4)" strokeWidth="1" fill="none" />
      <ellipse cx="200" cy="200" rx="135" ry="45" stroke="rgba(138,180,255,0.28)" strokeWidth="0.8" fill="none" />
      <ellipse cx="200" cy="200" rx="45" ry="135" stroke="rgba(138,180,255,0.28)" strokeWidth="0.8" fill="none" />

      {/* city lights */}
      {[
        [150, 175], [180, 145], [225, 150], [255, 195], [200, 235],
        [165, 250], [240, 250], [135, 195], [275, 220],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill="#ffcc33" opacity="0.85" />
      ))}

      {/* orbit ring */}
      <circle
        cx="200" cy="200" r="160"
        stroke="#ffcc33" strokeOpacity="0.45" strokeWidth="1"
        strokeDasharray="3 6" fill="none"
      />

      {/* ISS satellite */}
      <g transform="translate(305 130) rotate(25)">
        <rect x="-7" y="-7" width="14" height="14" rx="1.5" fill="#2a2a2a" stroke="#ffcc33" strokeWidth="1.2" />
        <rect x="-26" y="-6" width="16" height="12" fill="#1a2a4a" stroke="#ffcc33" strokeWidth="1" />
        <rect x="10" y="-6" width="16" height="12" fill="#1a2a4a" stroke="#ffcc33" strokeWidth="1" />
        <line x1="-26" y1="-6" x2="-26" y2="6" stroke="#ffcc33" strokeWidth="0.7" />
        <line x1="-21" y1="-6" x2="-21" y2="6" stroke="#ffcc33" strokeWidth="0.7" />
        <line x1="-15" y1="-6" x2="-15" y2="6" stroke="#ffcc33" strokeWidth="0.7" />
        <line x1="15" y1="-6" x2="15" y2="6" stroke="#ffcc33" strokeWidth="0.7" />
        <line x1="20" y1="-6" x2="20" y2="6" stroke="#ffcc33" strokeWidth="0.7" />
        <line x1="25" y1="-6" x2="25" y2="6" stroke="#ffcc33" strokeWidth="0.7" />
        <circle cx="0" cy="-12" r="1.8" fill="#ffcc33" />
      </g>
      <circle cx="305" cy="130" r="22" fill="#ffcc33" fillOpacity="0.18" />

      {/* tiny stars in the void */}
      {[[60,80],[340,60],[80,320],[360,300],[40,200]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="1.2" fill="#fff" opacity="0.55" />
      ))}
    </svg>
  );
}

function TasteBigPreview() {
  const dishes: { c: string; emoji: string; rot: number }[] = [
    { c: "#fb7185", emoji: "🥟", rot: -6 },
    { c: "#fbbf24", emoji: "🍣", rot: 4 },
    { c: "#fb923c", emoji: "🌮", rot: -3 },
    { c: "#a3e635", emoji: "🥗", rot: 5 },
    { c: "#facc15", emoji: "🍜", rot: -4 },
    { c: "#f87171", emoji: "🍕", rot: 3 },
  ];
  return (
    <svg
      className="absolute -right-6 -bottom-6 md:-right-4 md:-bottom-4 opacity-85 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      width="560"
      height="560"
      viewBox="0 0 400 400"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      {dishes.map((d, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 50 + col * 120;
        const y = 70 + row * 140;
        return (
          <g
            key={i}
            transform={`translate(${x} ${y}) rotate(${d.rot} 45 55)`}
          >
            <rect
              width="90"
              height="110"
              rx="10"
              fill="rgba(0,0,0,0.3)"
              stroke="rgba(253,186,116,0.35)"
              strokeWidth="1.2"
            />
            <rect
              x="6"
              y="6"
              width="78"
              height="62"
              rx="5"
              fill={d.c}
              fillOpacity="0.35"
              stroke={d.c}
              strokeOpacity="0.55"
              strokeWidth="1"
            />
            <text
              x="45"
              y="40"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="36"
            >
              {d.emoji}
            </text>
            {/* passport stamp */}
            {i % 2 === 0 && (
              <g transform="translate(68 18)">
                <circle r="11" fill="#fdba74" />
                <text
                  y="1"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fontWeight="700"
                  fill="#000"
                >
                  ✓
                </text>
              </g>
            )}
            <rect x="10" y="78" width="50" height="5" rx="2" fill="#ffffff" opacity="0.4" />
            <rect x="10" y="90" width="34" height="4" rx="2" fill="#ffffff" opacity="0.25" />
          </g>
        );
      })}
    </svg>
  );
}

function SecondaryTile({
  href,
  title,
  blurb,
  meta,
  gradient,
  accent,
  preview,
  enterLabel,
}: {
  href: string;
  title: string;
  blurb: string;
  meta: string;
  gradient: string;
  accent: string;
  preview: React.ReactNode;
  enterLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border border-[var(--line-2)] hover:border-white/40 transition-all duration-500 block h-[200px] md:h-[220px]"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div
        className="absolute inset-0 opacity-75 group-hover:opacity-100 transition-opacity"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 30%, ${accent}, transparent 60%)`,
        }}
      />
      {preview}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-between text-white">
        <div className="flex justify-between items-start">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">
            {meta}
          </span>
        </div>
        <div className="max-w-[85%]">
          <h3 className="font-serif text-2xl md:text-[26px] leading-tight mb-1.5">
            {title}
          </h3>
          <p className="text-white/75 text-[13px] md:text-[14px] leading-relaxed line-clamp-2">
            {blurb}
          </p>
          <span className="inline-flex items-center gap-2 mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white group-hover:gap-3 transition-all">
            {enterLabel}
            <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function IssSmallPreview() {
  return (
    <svg
      className="absolute -right-6 -top-6 opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none"
      width="300" height="300" viewBox="0 0 300 300" aria-hidden
    >
      <circle cx="150" cy="150" r="100" stroke="rgba(138,180,255,0.3)" strokeWidth="1" fill="none" />
      <ellipse cx="150" cy="150" rx="100" ry="32" stroke="rgba(138,180,255,0.2)" strokeWidth="0.8" fill="none" />
      <circle cx="150" cy="150" r="125" stroke="#ffcc33" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 6" fill="none" />
      <g transform="translate(230 100) rotate(20)">
        <rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="#2a2a2a" stroke="#ffcc33" strokeWidth="1" />
        <rect x="-22" y="-5" width="14" height="10" fill="#1a2a4a" stroke="#ffcc33" strokeWidth="1" />
        <rect x="8" y="-5" width="14" height="10" fill="#1a2a4a" stroke="#ffcc33" strokeWidth="1" />
      </g>
      <circle cx="230" cy="100" r="15" fill="#ffcc33" fillOpacity="0.2" />
    </svg>
  );
}

function TasteSmallPreview() {
  const dishes = [
    { c: "#fbbf24", emoji: "🍣" },
    { c: "#fb7185", emoji: "🍕" },
    { c: "#a3e635", emoji: "🥗" },
    { c: "#fb923c", emoji: "🌮" },
  ];
  return (
    <svg
      className="absolute -right-4 -bottom-4 opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none"
      width="280" height="280" viewBox="0 0 280 280" aria-hidden
    >
      {dishes.map((d, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 60 + col * 110;
        const y = 70 + row * 120;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${(i - 1.5) * 6})`}>
            <rect width="80" height="90" rx="8" fill="rgba(0,0,0,0.35)" stroke="rgba(255,204,120,0.25)" />
            <rect x="5" y="5" width="70" height="55" rx="4" fill={d.c} fillOpacity="0.35" />
            <text x="40" y="40" textAnchor="middle" dominantBaseline="middle" fontSize="32">
              {d.emoji}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function WarsPreview() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-70 group-hover:opacity-95 transition-opacity duration-700 pointer-events-none"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        {/* Sepia parchment wash */}
        <radialGradient id="parchmentBg" cx="50%" cy="45%" r="85%">
          <stop offset="0%" stopColor="#4a2614" stopOpacity="0" />
          <stop offset="60%" stopColor="#2a0f0a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0e0503" stopOpacity="0.75" />
        </radialGradient>

        {/* Parchment noise texture */}
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.4  0 0 0 0 0.24  0 0 0 0 0.1  0 0 0 0.35 0" />
        </filter>

        {/* Red arrow marker — advancing force */}
        <marker id="arrowRed" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0,0 L12,6 L0,12 L3,6 Z" fill="#dc2626" />
        </marker>
        {/* Amber arrow marker */}
        <marker id="arrowAmber" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L12,6 L0,12 L3,6 Z" fill="#f59e0b" />
        </marker>
        {/* Blue arrow marker — defending force */}
        <marker id="arrowBlue" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L12,6 L0,12 L3,6 Z" fill="#3b82f6" />
        </marker>

        {/* Radial glow for explosions */}
        <radialGradient id="boom" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#ea580c" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* parchment + noise */}
      <rect width="1200" height="800" fill="url(#parchmentBg)" />
      <rect width="1200" height="800" filter="url(#grain)" opacity="0.25" />

      {/* Topographic contour lines */}
      {[
        "M 100 620 Q 300 550 500 600 T 900 550 Q 1050 530 1180 580",
        "M 80 680 Q 290 620 500 660 T 920 620 Q 1080 600 1180 640",
        "M 120 560 Q 310 490 510 540 T 880 480 Q 1040 470 1180 520",
        "M 140 490 Q 340 440 520 480 T 870 420 Q 1020 410 1180 460",
        "M 60 220 Q 220 180 400 210 T 780 180 Q 960 170 1100 200",
        "M 80 280 Q 240 240 420 270 T 800 250 Q 980 240 1110 270",
      ].map((d, i) => (
        <path
          key={i}
          d={d}
          stroke="#d4a574"
          strokeOpacity="0.22"
          strokeWidth="0.8"
          fill="none"
        />
      ))}

      {/* Front line — jagged dashed */}
      <path
        d="M 80 440 L 180 420 L 240 460 L 340 430 L 420 470 L 520 440 L 620 480 L 720 450 L 820 490 L 920 460 L 1020 500 L 1120 470"
        stroke="#fcd34d"
        strokeWidth="2.5"
        strokeDasharray="12 6"
        fill="none"
        opacity="0.7"
      />

      {/* Major tactical arrows — offensives */}
      <g fill="none" strokeLinecap="round" opacity="0.9">
        {/* big red offensive sweeping east */}
        <path
          d="M 160 380 C 280 280, 440 260, 580 320 S 780 420, 940 340"
          stroke="#dc2626"
          strokeWidth="5"
          markerEnd="url(#arrowRed)"
        />
        {/* amber offensive southeast */}
        <path
          d="M 420 220 C 520 280, 620 320, 760 400"
          stroke="#f59e0b"
          strokeWidth="4"
          markerEnd="url(#arrowAmber)"
        />
        {/* blue counter from east */}
        <path
          d="M 1060 250 C 960 300, 880 320, 780 350"
          stroke="#3b82f6"
          strokeWidth="3.5"
          markerEnd="url(#arrowBlue)"
        />
        {/* amber sweep south */}
        <path
          d="M 300 560 C 340 640, 460 680, 620 620"
          stroke="#f59e0b"
          strokeWidth="3"
          markerEnd="url(#arrowAmber)"
          opacity="0.85"
        />
      </g>

      {/* Explosion glows at key points */}
      {[
        { x: 580, y: 330, r: 55 },
        { x: 760, y: 400, r: 42 },
        { x: 420, y: 520, r: 48 },
        { x: 890, y: 480, r: 38 },
      ].map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="url(#boom)" />
      ))}

      {/* NATO-style unit markers — infantry boxes with X */}
      {[
        { x: 240, y: 380, c: "#dc2626" },
        { x: 420, y: 340, c: "#dc2626" },
        { x: 600, y: 380, c: "#f59e0b" },
        { x: 820, y: 420, c: "#f59e0b" },
        { x: 960, y: 320, c: "#3b82f6" },
        { x: 1040, y: 380, c: "#3b82f6" },
      ].map((u, i) => (
        <g key={i} transform={`translate(${u.x - 20},${u.y - 12})`} opacity="0.88">
          <rect
            width="40"
            height="24"
            fill="rgba(10,5,3,0.72)"
            stroke={u.c}
            strokeWidth="1.5"
          />
          <line x1="0" y1="0" x2="40" y2="24" stroke={u.c} strokeWidth="1.2" />
          <line x1="40" y1="0" x2="0" y2="24" stroke={u.c} strokeWidth="1.2" />
        </g>
      ))}

      {/* Cavalry / armor marker — oval with slash */}
      {[
        { x: 310, y: 440, c: "#dc2626" },
        { x: 700, y: 460, c: "#f59e0b" },
      ].map((c, i) => (
        <g key={i} transform={`translate(${c.x},${c.y})`} opacity="0.88">
          <ellipse rx="22" ry="11" fill="rgba(10,5,3,0.7)" stroke={c.c} strokeWidth="1.5" />
          <line x1="-22" y1="0" x2="22" y2="0" stroke={c.c} strokeWidth="1" strokeDasharray="3 2" />
        </g>
      ))}

      {/* Artillery range circles (dashed bombardment zones) */}
      <g fill="none" stroke="#fcd34d" strokeDasharray="4 4" opacity="0.35">
        <circle cx="580" cy="330" r="90" strokeWidth="1" />
        <circle cx="760" cy="400" r="75" strokeWidth="1" />
      </g>

      {/* Flag planted on a hill — top-right */}
      <g transform="translate(1020, 160)">
        {/* hill */}
        <path d="M -70 50 Q -20 10, 30 25 Q 70 35, 100 50 Z" fill="#3a1f10" opacity="0.85" />
        {/* pole */}
        <line x1="10" y1="50" x2="10" y2="-20" stroke="#d4a574" strokeWidth="2" />
        {/* flag cloth */}
        <path
          d="M 10 -20 L 55 -10 L 50 0 L 55 10 L 10 0 Z"
          fill="#dc2626"
          stroke="#7f1d1d"
          strokeWidth="0.8"
        />
        <circle cx="10" cy="-20" r="2" fill="#fcd34d" />
      </g>

      {/* Crossed swords + laurel — central emblem, top-left area */}
      <g transform="translate(160, 200)" opacity="0.75">
        {/* laurel left */}
        <path
          d="M -35 0 Q -45 -10 -40 -25 M -35 0 Q -42 5 -38 18 M -35 0 Q -48 -2 -52 12"
          stroke="#d4a574"
          strokeWidth="1"
          fill="none"
        />
        {/* laurel right */}
        <path
          d="M 35 0 Q 45 -10 40 -25 M 35 0 Q 42 5 38 18 M 35 0 Q 48 -2 52 12"
          stroke="#d4a574"
          strokeWidth="1"
          fill="none"
        />
        {/* sword left (blade going up-right) */}
        <g transform="rotate(-30)">
          <line x1="-30" y1="0" x2="28" y2="0" stroke="#e8d4b0" strokeWidth="3" strokeLinecap="round" />
          <rect x="-34" y="-4" width="6" height="8" fill="#7f1d1d" />
          <line x1="-38" y1="-8" x2="-38" y2="8" stroke="#d4a574" strokeWidth="3" strokeLinecap="round" />
        </g>
        {/* sword right (blade going up-left) */}
        <g transform="rotate(30)">
          <line x1="-28" y1="0" x2="30" y2="0" stroke="#e8d4b0" strokeWidth="3" strokeLinecap="round" />
          <rect x="28" y="-4" width="6" height="8" fill="#7f1d1d" />
          <line x1="38" y1="-8" x2="38" y2="8" stroke="#d4a574" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>

      {/* Cannons silhouette */}
      <g transform="translate(180, 640)" opacity="0.75">
        {/* barrel */}
        <rect x="-4" y="-8" width="52" height="9" fill="#0f0704" />
        {/* wheel */}
        <circle cx="8" cy="14" r="14" fill="#0f0704" />
        <circle cx="8" cy="14" r="6" fill="none" stroke="#d4a574" strokeWidth="1" />
        <circle cx="8" cy="14" r="14" fill="none" stroke="#d4a574" strokeWidth="0.8" />
        {/* second wheel */}
        <circle cx="40" cy="14" r="14" fill="#0f0704" />
        <circle cx="40" cy="14" r="6" fill="none" stroke="#d4a574" strokeWidth="1" />
        {/* smoke puff */}
        <circle cx="58" cy="-6" r="8" fill="#d4a574" opacity="0.35" />
        <circle cx="70" cy="-14" r="6" fill="#d4a574" opacity="0.22" />
      </g>
      <g transform="translate(960, 640)" opacity="0.65" style={{ transform: "translate(960px, 640px) scaleX(-1)" }}>
        <rect x="-4" y="-8" width="52" height="9" fill="#0f0704" />
        <circle cx="8" cy="14" r="14" fill="#0f0704" />
        <circle cx="8" cy="14" r="14" fill="none" stroke="#d4a574" strokeWidth="0.8" />
        <circle cx="40" cy="14" r="14" fill="#0f0704" />
      </g>

      {/* Compass rose — bottom-left */}
      <g transform="translate(120, 140)" opacity="0.7">
        <circle r="30" fill="none" stroke="#d4a574" strokeWidth="1" />
        <circle r="22" fill="none" stroke="#d4a574" strokeWidth="0.5" strokeDasharray="2 3" />
        <path d="M 0 -28 L 4 0 L 0 28 L -4 0 Z" fill="#d4a574" opacity="0.85" />
        <path d="M -28 0 L 0 -4 L 28 0 L 0 4 Z" fill="#d4a574" opacity="0.45" />
        <text y="-34" textAnchor="middle" fontSize="10" fontFamily="serif" fill="#d4a574" fontWeight="700">N</text>
      </g>

      {/* Fallen flag / banner tear accent — bottom-right */}
      <g transform="translate(1060, 560) rotate(15)" opacity="0.55">
        <rect x="0" y="0" width="60" height="3" fill="#d4a574" />
        <path d="M 0 3 L 55 3 L 50 16 L 40 10 L 30 18 L 20 11 L 10 19 L 0 14 Z" fill="#7f1d1d" />
      </g>

      {/* Bird silhouettes in sky */}
      <g opacity="0.5" fill="none" stroke="#d4a574" strokeWidth="1.2" strokeLinecap="round">
        <path d="M 380 120 Q 386 112, 392 120 Q 398 112, 404 120" />
        <path d="M 420 100 Q 425 94, 430 100 Q 435 94, 440 100" />
        <path d="M 680 80 Q 686 72, 692 80 Q 698 72, 704 80" />
      </g>
    </svg>
  );
}
