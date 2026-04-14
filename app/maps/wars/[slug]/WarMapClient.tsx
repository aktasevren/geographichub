"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import SiteLogo from "@/components/SiteLogo";
import { LocaleToggle, useLocale } from "@/components/LocaleProvider";
import {
  KIND_META,
  SIDE_META,
  type War,
  type WarEvent,
  formatFuzzyDate,
  parseFuzzyDate,
} from "@/lib/wars-types";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const COUNTRIES_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

export default function WarMapClient({ war }: { war: War }) {
  const { t, locale } = useLocale();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [countries, setCountries] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tourIdx, setTourIdx] = useState<number | null>(null);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const globeRef = useRef<any>(null);
  const tourTimer = useRef<any>(null);

  useEffect(() => {
    const onR = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight - 64 });
    onR();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  useEffect(() => {
    fetch(COUNTRIES_URL)
      .then((r) => r.json())
      .then((d) => setCountries(d.features || []))
      .catch(() => {});
  }, []);

  // Fetch Wikipedia thumbnails for each event
  useEffect(() => {
    let cancel = false;
    (async () => {
      const titleFromUrl = (url?: string): string | null => {
        if (!url) return null;
        const m = url.match(/\/wiki\/([^?#]+)/);
        return m ? decodeURIComponent(m[1]) : null;
      };
      const next: Record<string, string> = {};
      const results = await Promise.allSettled(
        war.events.map(async (e) => {
          const title =
            titleFromUrl(e.wikipediaEn) || titleFromUrl(e.wikipediaTr);
          if (!title) return null;
          const host = e.wikipediaEn ? "en.wikipedia.org" : "tr.wikipedia.org";
          try {
            const r = await fetch(
              `https://${host}/api/rest_v1/page/summary/${encodeURIComponent(
                title
              )}`
            );
            if (!r.ok) throw new Error();
            const d = await r.json();
            const src = d?.thumbnail?.source || d?.originalimage?.source;
            if (src) return [e.id, src] as const;
          } catch {}
          return null;
        })
      );
      if (cancel) return;
      for (const r of results) {
        if (r.status === "fulfilled" && r.value) next[r.value[0]] = r.value[1];
      }
      setThumbs(next);
    })();
    return () => {
      cancel = true;
    };
  }, [war]);

  // Enable zoom + set limits explicitly
  useEffect(() => {
    if (!globeRef.current) return;
    const c = globeRef.current.controls?.();
    if (c) {
      c.enableZoom = true;
      c.zoomSpeed = 1.2;
      c.minDistance = 160;
      c.maxDistance = 900;
      c.enableDamping = true;
    }
  }, [size.w, countries]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveId(null);
        stopTour();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sort events chronologically
  const eventsSorted = useMemo(() => {
    return [...war.events].sort(
      (a, b) => parseFuzzyDate(a.date).t - parseFuzzyDate(b.date).t
    );
  }, [war.events]);

  // Arcs removed — pins + sidebar tell the chronological story

  useEffect(() => {
    if (!globeRef.current || eventsSorted.length === 0) return;
    const lat =
      eventsSorted.reduce((s, e) => s + e.lat, 0) / eventsSorted.length;
    const lng =
      eventsSorted.reduce((s, e) => s + e.lng, 0) / eventsSorted.length;
    globeRef.current.pointOfView({ lat, lng, altitude: 2 }, 1200);
  }, [eventsSorted]);

  // Tour
  useEffect(() => {
    if (tourIdx === null || !eventsSorted[tourIdx] || !globeRef.current) return;
    const e = eventsSorted[tourIdx];
    setActiveId(e.id);
    const cur = globeRef.current.pointOfView();
    const alt = cur && cur.altitude < 1.1 ? cur.altitude : 1.1;
    globeRef.current.pointOfView({ lat: e.lat, lng: e.lng, altitude: alt }, 2000);
    tourTimer.current = setTimeout(() => {
      if (tourIdx + 1 < eventsSorted.length) setTourIdx(tourIdx + 1);
      else {
        setTourIdx(null);
      }
    }, 3000);
    return () => clearTimeout(tourTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourIdx]);

  const playTour = () => {
    if (!eventsSorted.length) return;
    setTourIdx(0);
  };
  const stopTour = () => {
    setTourIdx(null);
    clearTimeout(tourTimer.current);
  };

  const selectEvent = (e: WarEvent) => {
    setActiveId(e.id);
    if (!globeRef.current) return;
    const current = globeRef.current.pointOfView();
    // Never zoom out on click — keep user's current altitude if already closer.
    const alt = current && current.altitude < 1.2 ? current.altitude : 1.2;
    globeRef.current.pointOfView({ lat: e.lat, lng: e.lng, altitude: alt }, 800);
  };

  const eventMarker = (d: any) => {
    const e: WarEvent = d._e;
    const active = activeId === e.id || tourIdx !== null && eventsSorted[tourIdx!]?.id === e.id;
    const m = KIND_META[e.kind];
    const el = document.createElement("div");
    el.innerHTML = `
      <div style="width:40px;height:40px;transform:translate(-50%,-50%);pointer-events:auto;cursor:pointer;">
        ${active ? `<div style="position:absolute;inset:-8px;border-radius:50%;background:${m.color}33;animation:warPulse 1.6s ease-out infinite"></div>` : ""}
        <div style="width:32px;height:32px;border-radius:50%;background:${m.color};border:2px solid rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 10px rgba(0,0,0,0.55);${active ? "transform:scale(1.2)" : ""}">
          ${m.icon}
        </div>
      </div>
      <style>@keyframes warPulse{0%{transform:scale(0.6);opacity:.9}100%{transform:scale(2.2);opacity:0}}</style>
    `;
    el.addEventListener("click", () => selectEvent(e));
    return el;
  };

  const markers = eventsSorted.map((e) => ({
    lat: e.lat,
    lng: e.lng,
    alt: 0.01,
    _e: e,
  }));

  const activeEvent = eventsSorted.find((e) => e.id === activeId);

  const kindCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of war.events) c[e.kind] = (c[e.kind] || 0) + 1;
    return c;
  }, [war.events]);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center px-5 md:px-8 py-4 bg-gradient-to-b from-black/85 to-transparent">
        <SiteLogo />
        <h1 className="hidden md:block font-serif text-lg md:text-xl">
          {locale === "tr" && war.nameTr ? war.nameTr : war.name}
        </h1>
        <div className="flex items-center gap-4">
          <LocaleToggle />
          <Link
            href="/maps/wars"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/70 hover:text-white"
          >
            {t("wars.allWars")}
          </Link>
        </div>
      </header>

      {size.w > 0 && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="#141414"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          atmosphereColor="#d4c9ae"
          atmosphereAltitude={0.15}
          polygonsData={countries}
          polygonCapColor={() => "rgba(255,255,255,0.04)"}
          polygonSideColor={() => "rgba(0,0,0,0.4)"}
          polygonStrokeColor={() => "rgba(220,220,220,0.55)"}
          polygonAltitude={0.006}
          htmlElementsData={markers}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude="alt"
          htmlElement={eventMarker}
          arcsData={[]}
        />
      )}

      {/* LEFT: Timeline sidebar */}
      <aside className="absolute top-[70px] left-4 md:left-6 z-20 w-[330px] max-h-[calc(100vh-90px)] rounded-2xl border border-white/15 bg-black/65 backdrop-blur-md flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 mb-1">
            § {war.startYear}–{war.endYear}
          </div>
          <div className="font-serif text-[20px] leading-tight">
            {locale === "tr" && war.nameTr ? war.nameTr : war.name}
          </div>
          {locale === "tr"
            ? war.nameTr && war.nameTr !== war.name && (
                <div className="font-serif italic text-[13px] text-white/55 mt-0.5">
                  {war.name}
                </div>
              )
            : war.nameTr && war.nameTr !== war.name && (
                <div className="font-serif italic text-[13px] text-white/55 mt-0.5">
                  {war.nameTr}
                </div>
              )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(kindCounts).map(([k, n]) => {
              const m = KIND_META[k as keyof typeof KIND_META];
              return (
                <span
                  key={k}
                  className="font-mono text-[9px] uppercase tracking-[0.15em] px-1.5 py-0.5 rounded"
                  style={{
                    background: `${m.color}22`,
                    color: m.color,
                  }}
                >
                  {m.icon} {n}
                </span>
              );
            })}
          </div>

          {eventsSorted.length > 1 && (
            <button
              onClick={tourIdx === null ? playTour : stopTour}
              className="w-full mt-3 px-3 py-2 rounded-md border font-mono text-[11px] uppercase tracking-[0.2em] transition"
              style={{
                borderColor: tourIdx !== null ? "#ef4444" : "rgba(245,158,11,0.5)",
                color: tourIdx !== null ? "#ef4444" : "#f59e0b",
                background:
                  tourIdx !== null
                    ? "rgba(239,68,68,0.08)"
                    : "rgba(245,158,11,0.08)",
              }}
            >
              {tourIdx !== null
                ? `${t("wars.stopTour")} · ${tourIdx + 1} / ${eventsSorted.length}`
                : t("wars.playTimeline")}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40 mb-2">
            {t("wars.timelineLabel")} · {eventsSorted.length} {t("wars.eventsLabel")}
          </div>
          <ul className="space-y-1">
            {eventsSorted.map((e) => {
              const m = KIND_META[e.kind];
              const active = activeId === e.id;
              return (
                <li key={e.id}>
                  <button
                    onMouseEnter={() => setHoveredId(e.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => selectEvent(e)}
                    className={`w-full text-left flex items-start gap-2.5 px-2 py-2 rounded transition ${
                      active
                        ? "bg-white/15 ring-1 ring-[#f59e0b]"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[13px] flex-shrink-0 mt-0.5"
                      style={{ background: m.color }}
                      aria-label={m.label}
                    >
                      {m.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] text-white/90 leading-tight">
                        {e.name}
                      </div>
                      <div className="font-mono text-[10px] text-white/45 uppercase tracking-[0.12em] mt-0.5">
                        {formatFuzzyDate(e.date)}
                        {e.dateEnd && ` – ${formatFuzzyDate(e.dateEnd)}`}
                        {" · "}
                        {m.label}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* RIGHT: Event detail drawer */}
      {activeEvent && (
        <aside
          role="dialog"
          aria-labelledby="event-title"
          className="absolute top-[70px] right-4 md:right-6 z-20 w-[340px] md:w-[400px] max-h-[calc(100vh-110px)] rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md p-5 overflow-y-auto shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-full text-[16px] flex-shrink-0"
                style={{ background: KIND_META[activeEvent.kind].color }}
              >
                {KIND_META[activeEvent.kind].icon}
              </span>
              <div className="min-w-0">
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
                  {formatFuzzyDate(activeEvent.date)}
                  {activeEvent.dateEnd &&
                    ` – ${formatFuzzyDate(activeEvent.dateEnd)}`}
                </div>
                <h2
                  id="event-title"
                  className="font-serif text-[20px] leading-tight"
                >
                  {locale === "tr" && activeEvent.nameTr
                    ? activeEvent.nameTr
                    : activeEvent.name}
                </h2>
              </div>
            </div>
            <button
              onClick={() => setActiveId(null)}
              aria-label={t("wars.close")}
              className="font-mono text-[11px] text-white/40 hover:text-white/80"
            >
              ✕
            </button>
          </div>

          {activeEvent.nameTr && activeEvent.nameTr !== activeEvent.name && (
            <div className="font-serif italic text-[13px] text-white/55 mb-3">
              {locale === "tr" ? activeEvent.name : activeEvent.nameTr}
            </div>
          )}

          {thumbs[activeEvent.id] && (
            <div className="mb-3 -mx-1 aspect-[16/9] overflow-hidden rounded-md bg-white/5 border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbs[activeEvent.id]}
                alt={activeEvent.name}
                className="w-full h-full object-cover"
                style={{ filter: "grayscale(0.85) sepia(0.25) contrast(1.05)" }}
              />
            </div>
          )}

          <div
            className="inline-flex items-center gap-2 mb-3 px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{
              color: SIDE_META[activeEvent.side].color,
              background: `${SIDE_META[activeEvent.side].color}22`,
            }}
          >
            {SIDE_META[activeEvent.side].label}
          </div>

          <p className="text-[14px] leading-relaxed text-white/85 mb-4">
            {locale === "tr" && activeEvent.summaryTr
              ? activeEvent.summaryTr
              : activeEvent.summary}
          </p>

          {activeEvent.summaryTr && activeEvent.summaryTr !== activeEvent.summary && (
            <p className="text-[13px] leading-relaxed text-white/65 italic mb-4 pt-3 border-t border-white/10">
              {locale === "tr" ? activeEvent.summary : activeEvent.summaryTr}
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-white/10 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            {activeEvent.lat.toFixed(3)}°, {activeEvent.lng.toFixed(3)}°
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {activeEvent.wikipediaEn && (
              <a
                href={activeEvent.wikipediaEn}
                target="_blank"
                rel="noopener"
                className="inline-block px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-[0.18em] bg-white/5 border border-white/15 hover:bg-white/10"
              >
                {t("wars.wikiEn")}
              </a>
            )}
            {activeEvent.wikipediaTr && (
              <a
                href={activeEvent.wikipediaTr}
                target="_blank"
                rel="noopener"
                className="inline-block px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-[0.18em] bg-white/5 border border-white/15 hover:bg-white/10"
              >
                {t("wars.wikiTr")}
              </a>
            )}
          </div>
        </aside>
      )}

      {/* Zoom controls */}
      <div className="absolute right-4 md:right-6 bottom-[150px] md:bottom-[120px] z-20 flex flex-col gap-1">
        <button
          onClick={() => {
            const c = globeRef.current?.controls?.();
            if (!c) return;
            const pov = globeRef.current.pointOfView();
            globeRef.current.pointOfView(
              { ...pov, altitude: Math.max(0.2, pov.altitude * 0.7) },
              400
            );
          }}
          aria-label={t("wars.zoomIn")}
          className="w-10 h-10 rounded-full border border-white/20 bg-black/60 backdrop-blur hover:bg-white/10 text-white font-mono text-lg"
        >
          +
        </button>
        <button
          onClick={() => {
            const c = globeRef.current?.controls?.();
            if (!c) return;
            const pov = globeRef.current.pointOfView();
            globeRef.current.pointOfView(
              { ...pov, altitude: Math.min(4, pov.altitude * 1.4) },
              400
            );
          }}
          aria-label={t("wars.zoomOut")}
          className="w-10 h-10 rounded-full border border-white/20 bg-black/60 backdrop-blur hover:bg-white/10 text-white font-mono text-lg"
        >
          −
        </button>
        <button
          onClick={() => {
            if (!globeRef.current) return;
            const lat =
              eventsSorted.reduce((s, e) => s + e.lat, 0) / eventsSorted.length;
            const lng =
              eventsSorted.reduce((s, e) => s + e.lng, 0) / eventsSorted.length;
            globeRef.current.pointOfView({ lat, lng, altitude: 2 }, 800);
          }}
          aria-label={t("wars.reset")}
          className="w-10 h-10 rounded-full border border-white/20 bg-black/60 backdrop-blur hover:bg-white/10 text-white font-mono text-[11px]"
        >
          ⟲
        </button>
      </div>

      {/* BOTTOM: permanent legend */}
      <div className="absolute left-0 right-0 bottom-0 z-10 px-4 md:px-6 pb-4 pt-8 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
        <div className="max-w-[1100px] mx-auto">
          <div className="rounded-xl border border-white/10 bg-black/65 backdrop-blur-md px-3 py-2.5 pointer-events-auto flex flex-wrap gap-x-4 gap-y-2 justify-center">
            {Object.entries(KIND_META)
              .filter(([k]) => kindCounts[k])
              .map(([k, m]) => (
                <div key={k} className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[12px]"
                    style={{ background: m.color }}
                  >
                    {m.icon}
                  </span>
                  <span className="text-[12px] text-white/85">{m.label}</span>
                </div>
              ))}
          </div>
          <div className="text-center mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
            {t("wars.dataCredit")} · {war.events.length} {t("wars.eventsLabel")}
          </div>
        </div>
      </div>
    </div>
  );
}
