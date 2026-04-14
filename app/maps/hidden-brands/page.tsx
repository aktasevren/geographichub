"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import SiteLogo from "@/components/SiteLogo";
import { useEffect, useMemo, useRef, useState } from "react";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

type BrandName = {
  name: string;
  color: string;
  countries: string[]; // ISO_A3 codes
  wikiTitle?: string;
  note?: string;
};

type Brand = {
  slug: string;
  title: string;
  product: string;
  parent: string;
  symbol: string;
  blurb: string;
  story?: string;
  wikiTitle?: string;
  names: BrandName[];
};

type BrandsData = { brands: Brand[] };

const COUNTRIES_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

function iso3(feat: any): string | null {
  const p = feat?.properties || {};
  return (
    p.ADM0_A3 ||
    p.ISO_A3 ||
    p.ISO_A3_EH ||
    p.SOV_A3 ||
    null
  );
}

function countryName(feat: any): string {
  const p = feat?.properties || {};
  return p.NAME || p.ADMIN || p.NAME_LONG || "—";
}

export default function HiddenBrandsPage() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [countries, setCountries] = useState<any>(null);
  const [activeSlug, setActiveSlug] = useState<string>("heartbrand");
  const [hovered, setHovered] = useState<any>(null);
  const [clicked, setClicked] = useState<any>(null);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [brandLogos, setBrandLogos] = useState<Record<string, string>>({});
  const globeRef = useRef<any>(null);

  useEffect(() => {
    fetch("/data/hidden-brands.json")
      .then((r) => r.json())
      .then((d: BrandsData) => setBrands(d.brands));
    fetch(COUNTRIES_URL)
      .then((r) => r.json())
      .then(setCountries)
      .catch(() => {});
    const onResize = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight - 64 });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;
    const c = globeRef.current.controls?.();
    if (c) {
      c.autoRotate = true;
      c.autoRotateSpeed = 0.25;
      c.enableDamping = true;
    }
  }, [size.w, countries]);

  const active = useMemo(
    () => brands?.find((b) => b.slug === activeSlug) || brands?.[0],
    [brands, activeSlug]
  );

  // Fetch one logo per brand for the selector list (once when brands load)
  useEffect(() => {
    if (!brands) return;
    let cancel = false;
    (async () => {
      const pairs = await Promise.allSettled(
        brands.map(async (b) => {
          const t = b.wikiTitle || b.names[0]?.wikiTitle;
          if (!t) return [b.slug, ""] as const;
          try {
            const r = await fetch(
              `https://en.wikipedia.org/api/rest_v1/page/summary/${t}`
            );
            if (!r.ok) throw new Error();
            const d = await r.json();
            return [
              b.slug,
              d?.thumbnail?.source || d?.originalimage?.source || "",
            ] as const;
          } catch {
            return [b.slug, ""] as const;
          }
        })
      );
      if (cancel) return;
      const next: Record<string, string> = {};
      for (const p of pairs) {
        if (p.status === "fulfilled" && p.value[1]) {
          next[p.value[0]] = p.value[1];
        }
      }
      setBrandLogos(next);
    })();
    return () => {
      cancel = true;
    };
  }, [brands]);

  // Fetch a thumbnail image for each name variant via Wikipedia summaries
  useEffect(() => {
    if (!active) return;
    let cancel = false;
    (async () => {
      const titles = Array.from(
        new Set(active.names.map((n) => n.wikiTitle).filter(Boolean))
      ) as string[];
      const results = await Promise.allSettled(
        titles.map(async (t) => {
          const r = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${t}`
          );
          if (!r.ok) throw new Error("miss");
          const d = await r.json();
          return [t, d?.thumbnail?.source || d?.originalimage?.source || ""] as const;
        })
      );
      if (cancel) return;
      const next: Record<string, string> = {};
      for (const r of results) {
        if (r.status === "fulfilled" && r.value[1]) {
          next[r.value[0]] = r.value[1];
        }
      }
      setLogos((prev) => ({ ...prev, ...next }));
    })();
    return () => {
      cancel = true;
    };
  }, [active]);

  const iso3ToName = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    if (!active) return map;
    for (const n of active.names) {
      for (const c of n.countries) map.set(c, { name: n.name, color: n.color });
    }
    return map;
  }, [active]);

  const features = countries?.features || [];

  const colorFor = (feat: any) => {
    const code = iso3(feat);
    const hit = code && iso3ToName.get(code);
    if (!hit) return "rgba(255,255,255,0.05)";
    return hit.color + "cc"; // add alpha
  };

  const polygonLabel = (feat: any) => {
    const code = iso3(feat);
    const hit = code && iso3ToName.get(code);
    const cn = countryName(feat);
    if (!hit) {
      return `<div style="background:rgba(0,0,0,0.85);color:#fff;padding:8px 12px;border-radius:6px;font-size:13px;font-family:ui-sans-serif;">
        <div style="font-weight:600">${cn}</div>
        <div style="color:#ffffff80;font-size:11px;margin-top:2px">Not sold here</div>
      </div>`;
    }
    return `<div style="background:rgba(0,0,0,0.9);color:#fff;padding:10px 14px;border-radius:8px;font-size:13px;font-family:ui-sans-serif;border-left:3px solid ${hit.color}">
      <div style="font-weight:600;font-size:14px">${cn}</div>
      <div style="margin-top:4px;color:#ffffff90">Known as</div>
      <div style="color:${hit.color};font-weight:700;font-size:17px;margin-top:2px">${hit.name}</div>
    </div>`;
  };

  const activeStats = useMemo(() => {
    if (!active) return { countries: 0, names: 0 };
    const countries = active.names.reduce((s, n) => s + n.countries.length, 0);
    return { countries, names: active.names.length };
  }, [active]);

  const clickedInfo = useMemo(() => {
    if (!clicked) return null;
    const code = iso3(clicked);
    const hit = code ? iso3ToName.get(code) || null : null;
    return { name: countryName(clicked), code, hit };
  }, [clicked, iso3ToName]);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-6 py-4 bg-gradient-to-b from-black/80 to-transparent">
        <SiteLogo />
        <h1 className="hidden md:block font-serif text-xl md:text-2xl">
          Hidden Brands · <span className="italic text-white/60">Same Product, Different Name</span>
        </h1>
        <span className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
          {active ? `${activeStats.names} names · ${activeStats.countries} countries` : ""}
        </span>
      </header>

      {size.w > 0 && features.length > 0 && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="#180812"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          atmosphereColor="#8ab4ff"
          atmosphereAltitude={0.15}
          polygonsData={features}
          polygonCapColor={colorFor as any}
          polygonSideColor={() => "rgba(20,20,20,0.8)"}
          polygonStrokeColor={() => "rgba(255,255,255,0.15)"}
          polygonAltitude={(d: any) =>
            d === hovered || d === clicked ? 0.02 : 0.007
          }
          polygonLabel={polygonLabel as any}
          polygonsTransitionDuration={400}
          onPolygonHover={setHovered as any}
          onPolygonClick={(d: any) => setClicked(d)}
        />
      )}

      {/* Brand selector */}
      <aside className="absolute top-20 left-4 md:left-6 z-20 w-[280px] md:w-[320px] rounded-xl border border-white/10 bg-black/55 backdrop-blur-md p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 mb-3">
          § Pick a brand
        </div>
        <div className="flex flex-col gap-1.5">
          {brands?.map((b) => {
            const on = b.slug === activeSlug;
            return (
              <button
                key={b.slug}
                onClick={() => {
                  setActiveSlug(b.slug);
                  setClicked(null);
                }}
                className={`text-left px-2.5 py-2 rounded-md transition border flex items-center gap-3 ${
                  on
                    ? "bg-white/10 border-white/30"
                    : "bg-transparent border-white/5 hover:border-white/15"
                }`}
              >
                <span
                  className="w-10 h-10 rounded-md bg-white/95 flex-shrink-0 flex items-center justify-center overflow-hidden"
                  aria-hidden
                >
                  {brandLogos[b.slug] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={brandLogos[b.slug]}
                      alt=""
                      className="w-full h-full object-contain p-0.5"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-2xl leading-none">{b.symbol}</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-[15px] leading-tight truncate">
                    {b.title}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40 mt-0.5 truncate">
                    {b.product}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Current brand detail */}
      {active && (
        <aside className="absolute top-20 right-4 md:right-6 z-20 w-[300px] md:w-[340px] rounded-xl border border-white/10 bg-black/55 backdrop-blur-md p-5 max-h-[calc(100vh-120px)] overflow-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                § {active.product}
              </div>
              <h2 className="font-serif text-2xl leading-tight mt-1">
                {active.title}
              </h2>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 mt-1">
                by {active.parent}
              </div>
            </div>
            <div className="text-3xl leading-none">{active.symbol}</div>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-white/75">
            {active.blurb}
          </p>

          <div className="h-px bg-white/10 my-4" />

          {clickedInfo ? (
            <div className="mb-4 p-3 rounded-md border border-white/15 bg-white/5">
              <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40 mb-1">
                You clicked
              </div>
              <div className="font-serif text-[17px]">{clickedInfo.name}</div>
              {clickedInfo.hit ? (
                <div className="mt-2 flex items-center gap-2">
                  {(() => {
                    const variant = active.names.find(
                      (n) => n.name === clickedInfo.hit!.name
                    );
                    const logo = variant?.wikiTitle && logos[variant.wikiTitle];
                    return logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo}
                        alt=""
                        className="w-8 h-8 rounded object-cover bg-white flex-shrink-0"
                      />
                    ) : (
                      <span
                        className="w-8 h-8 rounded flex-shrink-0"
                        style={{ background: clickedInfo.hit!.color }}
                      />
                    );
                  })()}
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">
                      Sold as
                    </div>
                    <div
                      className="font-semibold text-[15px]"
                      style={{ color: clickedInfo.hit.color }}
                    >
                      {clickedInfo.hit.name}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                  Not sold here / data missing
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
              Click any country for details
            </div>
          )}

        </aside>
      )}

      {/* BOTTOM: permanent legend strip (one chip per regional name) */}
      {active && (
        <div className="absolute left-0 right-0 bottom-0 z-10 px-4 md:px-6 pb-4 pt-8 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
          <div className="max-w-[1200px] mx-auto">
            <div className="rounded-xl border border-white/10 bg-black/65 backdrop-blur-md px-3 py-2.5 pointer-events-auto">
              <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40 mb-1.5 px-1">
                Every name for {active.title} around the world
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-2">
                {active.names.map((n) => {
                  const logo = n.wikiTitle && logos[n.wikiTitle];
                  return (
                    <div
                      key={n.name}
                      className="flex items-center gap-1.5 px-1.5 py-1 rounded-md bg-white/5 border border-white/10"
                    >
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logo}
                          alt=""
                          className="w-5 h-5 rounded-sm object-cover bg-white flex-shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <span
                          className="inline-block w-3.5 h-3.5 rounded-sm flex-shrink-0"
                          style={{ background: n.color }}
                          aria-hidden
                        />
                      )}
                      <span className="text-[12px] text-white/90">{n.name}</span>
                      <span className="font-mono text-[9px] text-white/40 tabular-nums">
                        ×{n.countries.length}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-center mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
              Data · Wikipedia · Natural Earth · Brand names & logos are trademarks of their owners
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
