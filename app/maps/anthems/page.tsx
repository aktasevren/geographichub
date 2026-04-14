"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SiteLogo from "@/components/SiteLogo";
import { LocaleToggle, useLocale } from "@/components/LocaleProvider";

const COUNTRIES_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

type Anthem = {
  iso: string;
  country: string;
  countryEn: string;
  name: string;
  nameEn: string;
  adopted: number | null;
  lyricist: string;
  composer: string;
  story: string;
  storyEn: string;
  audio: string;
  wikipedia: string;
  isDynamic?: boolean;
};

function iso3(feat: any): string | null {
  const p = feat?.properties || {};
  return p.ADM0_A3 || p.ISO_A3 || p.ISO_A3_EH || p.SOV_A3 || null;
}
function name(feat: any): string {
  const p = feat?.properties || {};
  return p.NAME || p.ADMIN || p.NAME_LONG || "—";
}
function project(lat: number, lng: number, w: number, h: number) {
  return [((lng + 180) / 360) * w, ((90 - lat) / 180) * h];
}
function ringToPath(ring: number[][], w: number, h: number) {
  return (
    ring
      .map(([lng, lat], i) => {
        const [x, y] = project(lat, lng, w, h);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ") + " Z"
  );
}
// Geometric centroid of country geometry — used to focus zoom
function geomCentroid(geom: any): [number, number] | null {
  if (!geom) return null;
  const rings: number[][][] =
    geom.type === "Polygon"
      ? geom.coordinates
      : geom.type === "MultiPolygon"
      ? geom.coordinates.flat()
      : [];
  let sx = 0, sy = 0, n = 0;
  for (const r of rings) {
    for (const pt of r) {
      sx += pt[0];
      sy += pt[1];
      n++;
    }
  }
  if (!n) return null;
  return [sy / n, sx / n]; // [lat, lng]
}

function iso2(feat: any): string | null {
  const p = feat?.properties || {};
  return p.ISO_A2_EH || p.ISO_A2 || p.WB_A2 || null;
}

function flagFor(iso2Code: string | null): string {
  if (!iso2Code || iso2Code.length !== 2 || iso2Code === "-9") return "🏳️";
  const cps = iso2Code
    .toUpperCase()
    .split("")
    .map((c) => 0x1f1e6 - 65 + c.charCodeAt(0));
  try {
    return String.fromCodePoint(...cps);
  } catch {
    return "🏳️";
  }
}

function stripHtml(s: string): string {
  if (!s) return s;
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function geomToPath(geom: any, w: number, h: number): string {
  if (!geom) return "";
  if (geom.type === "Polygon")
    return geom.coordinates.map((r: number[][]) => ringToPath(r, w, h)).join(" ");
  if (geom.type === "MultiPolygon")
    return geom.coordinates
      .flatMap((p: number[][][]) => p.map((r) => ringToPath(r, w, h)))
      .join(" ");
  return "";
}

export default function AnthemsPage() {
  const { t, locale } = useLocale();
  const [anthems, setAnthems] = useState<Anthem[] | null>(null);
  const [features, setFeatures] = useState<any[]>([]);
  const [activeIso, setActiveIso] = useState<string | null>(null);
  const [hoveredIso, setHoveredIso] = useState<string | null>(null);
  const [w, setW] = useState(1200);
  const [audioErr, setAudioErr] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [dynamicAnthem, setDynamicAnthem] = useState<Anthem | null>(null);
  const [zoom, setZoom] = useState({ scale: 1, cx: 0.5, cy: 0.5 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const movedDuringDrag = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch("/data/anthems.json").then((r) => r.json()).then((d) => setAnthems(d.anthems));
    fetch(COUNTRIES_URL).then((r) => r.json()).then((d) => setFeatures(d.features || []));
  }, []);

  useEffect(() => {
    const onR = () => containerRef.current && setW(containerRef.current.clientWidth);
    onR();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  const anthemMap = useMemo(() => {
    const m = new Map<string, Anthem>();
    anthems?.forEach((a) => m.set(a.iso, a));
    return m;
  }, [anthems]);

  const curated = activeIso ? anthemMap.get(activeIso) : null;
  const active = curated || dynamicAnthem;

  // For non-curated countries, fetch story+wikipedia URL on click
  useEffect(() => {
    if (!activeIso || curated) {
      setDynamicAnthem(null);
      return;
    }
    const feat = features.find((f) => iso3(f) === activeIso);
    if (!feat) return;
    const countryName = name(feat);
    let cancel = false;
    (async () => {
      try {
        // 1) Search for "National anthem of <Country>"
        const sr = await fetch(
          `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
            `National anthem of ${countryName}`
          )}&limit=1&format=json&origin=*`
        );
        const sd = await sr.json();
        const url = sd?.[3]?.[0];
        if (!url) {
          setDynamicAnthem({
            iso: activeIso,
            country: countryName,
            countryEn: countryName,
            name: locale === "tr" ? "Bilinmiyor" : "Unknown",
            nameEn: "Unknown",
            adopted: null,
            lyricist: "—",
            composer: "—",
            story: locale === "tr" ? "Bu ülke için marş bilgisi bulunamadı." : "No anthem info found for this country.",
            storyEn: "No anthem info found for this country.",
            audio: "",
            wikipedia: `https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`,
            isDynamic: true,
          });
          return;
        }
        // 2) Get summary from URL
        const titleMatch = url.match(/\/wiki\/([^?#]+)/);
        const articleTitle = titleMatch ? titleMatch[1] : "";
        const r = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${articleTitle}`
        );
        const d = await r.json();
        if (cancel) return;
        setDynamicAnthem({
          iso: activeIso,
          country: countryName,
          countryEn: countryName,
          name: stripHtml(d.displaytitle || d.title || `Anthem of ${countryName}`),
          nameEn: stripHtml(d.title || `Anthem of ${countryName}`),
          adopted: null,
          lyricist: "—",
          composer: "—",
          story: d.extract || (locale === "tr" ? "Marş hakkında özet bulunamadı." : "No summary available."),
          storyEn: d.extract || "No summary available.",
          audio: "",
          wikipedia: url,
          isDynamic: true,
        });
      } catch {
        if (!cancel) {
          setDynamicAnthem({
            iso: activeIso,
            country: countryName,
            countryEn: countryName,
            name: locale === "tr" ? "Yüklenemedi" : "Failed",
            nameEn: "Failed",
            adopted: null,
            lyricist: "—",
            composer: "—",
            story: locale === "tr" ? "Bilgi alınamadı." : "Could not load.",
            storyEn: "Could not load.",
            audio: "",
            wikipedia: `https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`,
            isDynamic: true,
          });
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, [activeIso, curated, features, locale]);

  // Pan handlers
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      if (!dragStart.current || !containerRef.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) movedDuringDrag.current = true;
      const rect = containerRef.current.getBoundingClientRect();
      const ndx = dx / rect.width / zoom.scale;
      const ndy = dy / rect.height / zoom.scale;
      setZoom((z) => ({
        ...z,
        cx: Math.max(0, Math.min(1, dragStart.current!.cx - ndx)),
        cy: Math.max(0, Math.min(1, dragStart.current!.cy - ndy)),
      }));
    };
    const onUp = () => {
      setDragging(false);
      dragStart.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, zoom.scale]);

  // Zoom to clicked country
  useEffect(() => {
    if (!activeIso) return;
    const feat = features.find((f) => iso3(f) === activeIso);
    if (!feat) return;
    const c = geomCentroid(feat.geometry);
    if (!c) return;
    const [lat, lng] = c;
    const cx = (lng + 180) / 360;
    const cy = (90 - lat) / 180;
    setZoom({ scale: 4, cx, cy });
  }, [activeIso, features]);

  // Fetch real audio URL from Wikipedia media-list
  useEffect(() => {
    if (!active) {
      setAudioUrl(null);
      return;
    }
    setAudioErr(false);
    setAudioUrl(null);
    setAudioLoading(true);
    let cancel = false;
    (async () => {
      // Extract page title from wikipedia URL
      const urlMatch = active.wikipedia.match(/\/wiki\/([^?#]+)/);
      const title = urlMatch ? urlMatch[1] : "";
      const isTr = active.wikipedia.includes("tr.wikipedia.org");
      const host = isTr ? "tr.wikipedia.org" : "en.wikipedia.org";

      // Try requested host first, then English fallback if Turkish
      const tryHosts = [host, "en.wikipedia.org"].filter(
        (v, i, a) => a.indexOf(v) === i
      );

      for (const h of tryHosts) {
        try {
          const r = await fetch(
            `https://${h}/api/rest_v1/page/media-list/${title}`
          );
          if (!r.ok) continue;
          const d = await r.json();
          // Pick the first audio item — preferring instrumental/anthem keywords
          const audioItems = (d.items || []).filter(
            (it: any) => it.type === "audio"
          );
          if (!audioItems.length) continue;
          // Prefer instrumental versions
          const preferred =
            audioItems.find((it: any) =>
              /instrumental|anthem|hymn|himno|himne|marş|marsi|march/i.test(
                it.title || ""
              )
            ) || audioItems[0];
          // Title is "<Namespace>:filename.ext" (File:, Dosya:, Datei:, Fichier:, Plik:, etc.)
          const rawTitle = (preferred.title || "").trim();
          const filename = rawTitle.includes(":")
            ? rawTitle.substring(rawTitle.indexOf(":") + 1)
            : rawTitle;
          if (!filename) continue;
          // Use Special:FilePath which redirects to the actual file URL
          const finalSrc = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
            filename
          )}`;
          if (!cancel) {
            setAudioUrl(finalSrc);
            setAudioLoading(false);
          }
          return;
        } catch {}
      }
      if (!cancel) {
        setAudioErr(true);
        setAudioLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [active]);

  // Auto-play when audioUrl changes
  useEffect(() => {
    if (!audioUrl || !audioRef.current) return;
    audioRef.current.load();
    audioRef.current.play().then(
      () => setPlaying(true),
      () => setPlaying(false)
    );
  }, [audioUrl]);

  const h = w * 0.5;

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
              {locale === "tr" ? "Milli Marşlar" : "National Anthems"}
            </li>
          </ol>
        </div>
      </header>

      <section className="px-5 md:px-10 pt-8 md:pt-12 pb-2">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="font-serif font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.98] tracking-tight">
            {locale === "tr" ? "Milli" : "National"}{" "}
            <span className="italic" style={{ color: "var(--accent)" }}>
              {locale === "tr" ? "Marşlar." : "Anthems."}
            </span>
          </h1>
          <p className="mt-3 text-[14px] md:text-[16px] text-[var(--text-2)] max-w-2xl">
            {locale === "tr"
              ? "Bir ülkeye tıkla, marşını dinle ve hikâyesini oku. 20 ülke küratörlü."
              : "Click a country to hear its anthem and read its story. 20 countries curated."}
          </p>
        </div>
      </section>

      {/* Country chips selector */}
      <section className="px-5 md:px-10 pt-4 pb-3">
        <div className="max-w-[1400px] mx-auto">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] mb-2">
            {locale === "tr" ? "§ Ülke seç" : "§ Pick country"}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {anthems?.map((a) => {
              const on = a.iso === activeIso;
              return (
                <button
                  key={a.iso}
                  onClick={() => setActiveIso(a.iso)}
                  className={`flex-shrink-0 text-left px-3 py-1.5 rounded-full border text-[12px] font-mono uppercase tracking-[0.15em] transition ${
                    on
                      ? "bg-[var(--accent)] text-black border-[var(--accent)]"
                      : "bg-transparent text-[var(--text-2)] border-[var(--line-2)] hover:border-[var(--text-2)]"
                  }`}
                >
                  {locale === "tr" ? a.country : a.countryEn}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 md:px-10 pb-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          {/* 2D Map */}
          <div className="md:col-span-8">
            <div
              ref={containerRef}
              className="rounded-xl border border-[var(--line-2)] bg-[#0a0a0c] overflow-hidden relative select-none"
              style={{
                aspectRatio: "2 / 1",
                cursor: dragging ? "grabbing" : "grab",
              }}
              onMouseDown={(e) => {
                if ((e.target as HTMLElement).closest("button")) return;
                movedDuringDrag.current = false;
                dragStart.current = {
                  x: e.clientX,
                  y: e.clientY,
                  cx: zoom.cx,
                  cy: zoom.cy,
                };
                setDragging(true);
              }}
            >
              <svg
                viewBox={`0 0 ${w} ${h}`}
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid meet"
              >
                <rect width={w} height={h} fill="#0e0f12" />
                {/* Zoomable group */}
                <g
                  style={{
                    transformOrigin: `${zoom.cx * w}px ${zoom.cy * h}px`,
                    transform: `scale(${zoom.scale})`,
                    transition: "transform 700ms ease",
                  }}
                >
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
                        strokeWidth={0.5 / zoom.scale}
                      />
                    );
                  })}
                  {features.map((f, i) => {
                    const code = iso3(f);
                    const isActive = code === activeIso;
                    const isHover = code === hoveredIso;
                    return (
                      <path
                        key={i}
                        d={geomToPath(f.geometry, w, h)}
                        fill={
                          isActive
                            ? "var(--accent)"
                            : isHover
                            ? "rgba(232,195,106,0.35)"
                            : "rgba(255,255,255,0.08)"
                        }
                        stroke="rgba(255,255,255,0.18)"
                        strokeWidth={0.4 / zoom.scale}
                        onMouseEnter={() => code && setHoveredIso(code)}
                        onMouseLeave={() => setHoveredIso(null)}
                        onClick={(e) => {
                          if (movedDuringDrag.current) return; // ignore click after drag
                          if (code) setActiveIso(code);
                        }}
                        style={{ cursor: code ? "pointer" : "default" }}
                      >
                        <title>{name(f)}</title>
                      </path>
                    );
                  })}
                </g>
              </svg>

              {/* Zoom controls */}
              <div className="absolute right-2 top-2 flex flex-col gap-1 z-10">
                <button
                  onClick={() =>
                    setZoom((z) => ({
                      ...z,
                      scale: Math.min(8, z.scale * 1.5),
                    }))
                  }
                  aria-label="Zoom in"
                  className="w-8 h-8 rounded-full border border-white/20 bg-black/70 backdrop-blur hover:bg-white/10 text-white text-base font-mono"
                >
                  +
                </button>
                <button
                  onClick={() =>
                    setZoom((z) => ({
                      ...z,
                      scale: Math.max(1, z.scale / 1.5),
                    }))
                  }
                  aria-label="Zoom out"
                  className="w-8 h-8 rounded-full border border-white/20 bg-black/70 backdrop-blur hover:bg-white/10 text-white text-base font-mono"
                >
                  −
                </button>
                <button
                  onClick={() => setZoom({ scale: 1, cx: 0.5, cy: 0.5 })}
                  aria-label="Reset"
                  className="w-8 h-8 rounded-full border border-white/20 bg-black/70 backdrop-blur hover:bg-white/10 text-white text-[10px] font-mono"
                >
                  ⟲
                </button>
              </div>
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] min-h-[20px]">
              {hoveredIso
                ? (() => {
                    const f = features.find((x) => iso3(x) === hoveredIso);
                    if (!f) return null;
                    const a = anthemMap.get(hoveredIso);
                    const flag = flagFor(iso2(f));
                    return (
                      <span>
                        {flag}{" "}
                        {a
                          ? locale === "tr"
                            ? a.country
                            : a.countryEn
                          : name(f)}
                        {a && (
                          <>
                            {" — "}
                            <span style={{ color: "var(--accent)" }}>
                              {a.name}
                            </span>
                          </>
                        )}
                      </span>
                    );
                  })()
                : locale === "tr"
                ? "Bir ülkeye tıkla, sürükleyerek pan yap, +/− ile zoom"
                : "Click country, drag to pan, +/− to zoom"}
            </div>
          </div>

          {/* Detail panel */}
          {active && (
            <aside className="md:col-span-4">
              <div className="rounded-xl border border-[var(--line-2)] p-5 sticky top-4 bg-[var(--bg-2,transparent)]">
                {(() => {
                  const feat = features.find((f) => iso3(f) === active.iso);
                  const flag = feat ? flagFor(iso2(feat)) : "🏳️";
                  return (
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-4xl md:text-5xl leading-none">
                        {flag}
                      </span>
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
                          {locale === "tr" ? active.country : active.countryEn}
                          {active.adopted ? ` · ${active.adopted}` : ""}
                        </div>
                        <h2 className="font-serif text-xl md:text-2xl leading-tight mt-1">
                          {active.name}
                        </h2>
                      </div>
                    </div>
                  );
                })()}
                {active.name !== active.nameEn && active.nameEn && (
                  <div className="font-serif italic text-[14px] text-[var(--text-2)] leading-snug mb-3">
                    {active.nameEn}
                  </div>
                )}

                {/* Audio player */}
                <div className="mt-4 mb-4">
                  {audioLoading && (
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] py-2 animate-pulse">
                      <span>♫</span>
                      {locale === "tr" ? "Ses dosyası yükleniyor…" : "Loading audio…"}
                    </div>
                  )}
                  {audioUrl && (
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      controls
                      preload="metadata"
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                      onError={() => setAudioErr(true)}
                      className="w-full"
                      style={{ filter: "invert(0.85) hue-rotate(180deg)" }}
                    />
                  )}
                  {audioErr && !audioUrl && !audioLoading && (
                    <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/30">
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-400 mb-1">
                        {locale === "tr"
                          ? "♫ Ses dosyası bulunamadı"
                          : "♫ Audio not found"}
                      </div>
                      <a
                        href={active.wikipedia}
                        target="_blank"
                        rel="noopener"
                        className="text-[12px] text-amber-300 underline"
                      >
                        {locale === "tr"
                          ? "Wikipedia sayfasında dinle ↗"
                          : "Listen on Wikipedia ↗"}
                      </a>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 mb-4">
                  <Field
                    label={locale === "tr" ? "Söz" : "Lyricist"}
                    value={active.lyricist}
                  />
                  <Field
                    label={locale === "tr" ? "Beste" : "Composer"}
                    value={active.composer}
                  />
                </div>

                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--muted)] mb-1">
                  {locale === "tr" ? "Hikâye" : "Story"}
                </div>
                <p className="text-[13px] text-[var(--text)] leading-relaxed">
                  {locale === "tr" ? active.story : active.storyEn}
                </p>

                <a
                  href={active.wikipedia}
                  target="_blank"
                  rel="noopener"
                  className="inline-block mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] hover:underline"
                >
                  Wikipedia ↗
                </a>
              </div>
            </aside>
          )}

          {!active && (
            <aside className="md:col-span-4">
              <div className="rounded-xl border border-dashed border-[var(--line-2)] p-8 text-center">
                <div className="text-4xl mb-3">🎵</div>
                <p className="font-serif text-lg text-[var(--text-2)] italic">
                  {locale === "tr"
                    ? "Bir ülke seç — marşı çalsın ve hikâyesini oku"
                    : "Pick a country — play its anthem and read its story"}
                </p>
              </div>
            </aside>
          )}
        </div>
      </section>

      <footer className="px-5 md:px-10 py-6 hair-t flex flex-wrap justify-between gap-4 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        <span className="hidden md:inline">
          {locale === "tr"
            ? "Ses dosyaları · Wikimedia Commons (public domain / CC)"
            : "Audio · Wikimedia Commons (public domain / CC)"}
        </span>
      </footer>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </div>
      <div className="text-[13px] text-[var(--text)]">{value}</div>
    </div>
  );
}
