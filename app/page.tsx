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

      <section className="px-5 md:px-10 pb-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] mb-3">
            {t("home.otherMaps")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SecondaryTile
              href="/maps/iss"
              title={t("home.isserTitle")}
              blurb={t("home.isserBlurb")}
              meta={t("home.isserMeta")}
              gradient="from-[#050a1c] via-[#0c1530] to-[#161f4a]"
              accent="rgba(138,180,255,0.35)"
              preview={<IssSmallPreview />}
              enterLabel={t("tile.enter")}
            />
            <SecondaryTile
              href="/maps/taste-passport"
              title={t("home.tasteTitle")}
              blurb={t("home.tasteBlurb")}
              meta={t("home.tasteMeta")}
              gradient="from-[#2a1208] via-[#3e1f12] to-[#5a2e1a]"
              accent="rgba(255,160,80,0.35)"
              preview={<TasteSmallPreview />}
              enterLabel={t("tile.enter")}
            />
          </div>
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
