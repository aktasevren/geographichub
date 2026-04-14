"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SiteLogo from "@/components/SiteLogo";
import { LocaleToggle, useLocale } from "@/components/LocaleProvider";

const COUNTRIES_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

type Alliance = {
  slug: string;
  name: string;
  nameTr: string;
  fullName: string;
  fullNameTr: string;
  founded: number;
  color: string;
  tag: string;
  tagTr: string;
  purpose: string;
  purposeTr: string;
  headquarters: string;
  members: string[];
};

function iso3(feat: any): string | null {
  const p = feat?.properties || {};
  return p.ADM0_A3 || p.ISO_A3 || p.ISO_A3_EH || p.SOV_A3 || null;
}

function name(feat: any): string {
  const p = feat?.properties || {};
  return p.NAME || p.ADMIN || p.NAME_LONG || "—";
}

// Equirectangular projection
function project(lat: number, lng: number, w: number, h: number) {
  const x = ((lng + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return [x, y];
}

function ringToPath(ring: number[][], w: number, h: number) {
  return ring
    .map(([lng, lat], i) => {
      const [x, y] = project(lat, lng, w, h);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ") + " Z";
}

function geomToPath(geom: any, w: number, h: number): string {
  if (!geom) return "";
  if (geom.type === "Polygon") {
    return geom.coordinates.map((r: number[][]) => ringToPath(r, w, h)).join(" ");
  }
  if (geom.type === "MultiPolygon") {
    return geom.coordinates
      .flatMap((p: number[][][]) => p.map((r) => ringToPath(r, w, h)))
      .join(" ");
  }
  return "";
}

export default function AlliancesPage() {
  const { t, locale } = useLocale();
  const [alliances, setAlliances] = useState<Alliance[] | null>(null);
  const [features, setFeatures] = useState<any[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>("nato");
  const [hoveredIso, setHoveredIso] = useState<string | null>(null);
  const [w, setW] = useState(1200);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/data/alliances.json")
      .then((r) => r.json())
      .then((d) => setAlliances(d.alliances));
    fetch(COUNTRIES_URL)
      .then((r) => r.json())
      .then((d) => setFeatures(d.features || []));
  }, []);

  useEffect(() => {
    const onR = () => {
      if (containerRef.current) {
        setW(containerRef.current.clientWidth);
      }
    };
    onR();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  const active = useMemo(
    () => alliances?.find((a) => a.slug === activeSlug),
    [alliances, activeSlug]
  );

  const memberSet = useMemo(() => new Set(active?.members || []), [active]);

  const h = w * 0.5; // 2:1 aspect (equirectangular)

  return (
    <div className="min-h-screen grain">
      <header className="hair-b">
        <div className="flex justify-between items-center px-5 md:px-10 py-3.5 md:py-4">
          <SiteLogo theme="light" />
          <LocaleToggle theme="light" />
        </div>
        <div className="px-5 md:px-10 py-2.5 hair-b">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            <li>
              <a href="/" className="hover:text-[var(--text)]">
                {t("common.home")}
              </a>
            </li>
            <li>/</li>
            <li className="text-[var(--text-2)]">
              {locale === "tr" ? "İttifaklar" : "Alliances"}
            </li>
          </ol>
        </div>
      </header>

      <section className="px-5 md:px-10 pt-8 md:pt-12 pb-2">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="font-serif font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.98] tracking-tight">
            {locale === "tr" ? "İttifaklar &" : "Alliances &"}{" "}
            <span className="italic" style={{ color: "var(--accent)" }}>
              {locale === "tr" ? "Topluluklar." : "Communities."}
            </span>
          </h1>
          <p className="mt-3 text-[14px] md:text-[16px] text-[var(--text-2)] max-w-2xl">
            {locale === "tr"
              ? "Bir topluluk seç. Üyelerini haritada gör; ne işe yaradığını ve ne zaman kurulduğunu öğren."
              : "Pick an alliance. See its members on the map; learn what it does and when it was founded."}
          </p>
        </div>
      </section>

      {/* Horizontal picker — sticky on top */}
      <section className="px-5 md:px-10 pt-4 pb-3">
        <div className="max-w-[1400px] mx-auto">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] mb-2">
            {locale === "tr" ? "§ Topluluk seç" : "§ Pick alliance"}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {alliances?.map((a) => {
              const on = a.slug === activeSlug;
              return (
                <button
                  key={a.slug}
                  onClick={() => setActiveSlug(a.slug)}
                  className={`flex-shrink-0 text-left px-3 py-2 rounded-md transition border ${
                    on
                      ? "border-[var(--accent)]"
                      : "border-[var(--line-2)] hover:bg-[var(--line)]"
                  }`}
                  style={
                    on
                      ? { background: `${a.color}18`, borderColor: a.color }
                      : {}
                  }
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ background: a.color }}
                    />
                    <span className="font-serif text-[14px] whitespace-nowrap">
                      {locale === "tr" ? a.nameTr : a.name}
                    </span>
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted)] mt-1 whitespace-nowrap">
                    {a.founded} · {a.members.length}{" "}
                    {locale === "tr" ? "üye" : "members"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 md:px-10 pb-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          {/* Map — much wider now */}
          <div className="md:col-span-9">
            <div
              ref={containerRef}
              className="rounded-xl border border-[var(--line-2)] bg-[#0a0a0c] overflow-hidden relative"
              style={{ aspectRatio: "2 / 1" }}
            >
              <svg
                viewBox={`0 0 ${w} ${h}`}
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid meet"
              >
                <rect width={w} height={h} fill="#0e0f12" />
                {/* graticule lines */}
                {[-60, -30, 0, 30, 60].map((lat) => {
                  const y = ((90 - lat) / 180) * h;
                  return (
                    <line
                      key={lat}
                      x1="0"
                      y1={y}
                      x2={w}
                      y2={y}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="0.5"
                    />
                  );
                })}
                {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lng) => {
                  const x = ((lng + 180) / 360) * w;
                  return (
                    <line
                      key={lng}
                      x1={x}
                      y1="0"
                      x2={x}
                      y2={h}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="0.5"
                    />
                  );
                })}
                {features.map((f, i) => {
                  const code = iso3(f);
                  const isMember = code ? memberSet.has(code) : false;
                  const isHover = hoveredIso === code;
                  return (
                    <path
                      key={i}
                      d={geomToPath(f.geometry, w, h)}
                      fill={
                        isMember
                          ? active!.color
                          : "rgba(255,255,255,0.04)"
                      }
                      fillOpacity={isMember ? (isHover ? 1 : 0.8) : 1}
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="0.4"
                      onMouseEnter={() => code && setHoveredIso(code)}
                      onMouseLeave={() => setHoveredIso(null)}
                      style={{ cursor: code ? "pointer" : "default" }}
                    >
                      <title>{name(f)}</title>
                    </path>
                  );
                })}
              </svg>
            </div>
            {/* Hover label */}
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] min-h-[20px]">
              {hoveredIso
                ? (() => {
                    const f = features.find((x) => iso3(x) === hoveredIso);
                    if (!f) return null;
                    const isMem = memberSet.has(hoveredIso);
                    return (
                      <span>
                        {name(f)} —{" "}
                        <span style={{ color: isMem ? active?.color : undefined }}>
                          {isMem
                            ? locale === "tr"
                              ? "üye"
                              : "member"
                            : locale === "tr"
                            ? "üye değil"
                            : "not a member"}
                        </span>
                      </span>
                    );
                  })()
                : null}
            </div>
          </div>

          {/* Right: detail panel */}
          {active && (
            <aside className="md:col-span-3">
              <div className="rounded-xl border border-[var(--line-2)] p-5 sticky top-4">
                <span
                  className="inline-block font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded mb-2"
                  style={{
                    background: `${active.color}20`,
                    color: active.color,
                  }}
                >
                  {locale === "tr" ? active.tagTr : active.tag}
                </span>
                <h2 className="font-serif text-2xl md:text-3xl leading-tight mb-1">
                  {locale === "tr" ? active.nameTr : active.name}
                </h2>
                <div className="font-serif italic text-[14px] text-[var(--text-2)] leading-snug mb-4">
                  {locale === "tr" ? active.fullNameTr : active.fullName}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
                      {locale === "tr" ? "Kuruluş" : "Founded"}
                    </div>
                    <div className="font-serif text-xl tabular-nums">
                      {active.founded}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
                      {locale === "tr" ? "Üye sayısı" : "Members"}
                    </div>
                    <div
                      className="font-serif text-xl tabular-nums"
                      style={{ color: active.color }}
                    >
                      {active.members.length}
                    </div>
                  </div>
                </div>

                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] mb-1">
                  {locale === "tr" ? "Merkez" : "Headquarters"}
                </div>
                <div className="font-serif text-[16px] mb-4">
                  {active.headquarters}
                </div>

                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] mb-1">
                  {locale === "tr" ? "Amaç" : "Purpose"}
                </div>
                <p className="text-[13px] text-[var(--text)] leading-relaxed">
                  {locale === "tr" ? active.purposeTr : active.purpose}
                </p>
              </div>
            </aside>
          )}
        </div>

        {/* Members list */}
        {active && (
          <div className="max-w-[1400px] mx-auto mt-8">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] mb-3">
              {locale === "tr" ? "Üye ülkeler" : "Member countries"} ·{" "}
              {active.members.length}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {active.members
                .map((iso) => {
                  const f = features.find((x) => iso3(x) === iso);
                  return f ? { iso, n: name(f) } : { iso, n: iso };
                })
                .sort((a, b) => a.n.localeCompare(b.n))
                .map((m) => (
                  <span
                    key={m.iso}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-md border"
                    style={{
                      background: `${active.color}10`,
                      borderColor: `${active.color}40`,
                      color: active.color,
                    }}
                  >
                    {m.n}
                  </span>
                ))}
            </div>
          </div>
        )}
      </section>

      <footer className="px-5 md:px-10 py-6 hair-t flex flex-wrap justify-between gap-4 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        <span className="hidden md:inline">
          {locale === "tr"
            ? "Veri · Wikipedia · Natural Earth"
            : "Data · Wikipedia · Natural Earth"}
        </span>
      </footer>
    </div>
  );
}
