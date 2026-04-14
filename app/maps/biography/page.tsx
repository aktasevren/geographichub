"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import SiteLogo from "@/components/SiteLogo";
import { useEffect, useMemo, useRef, useState } from "react";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

type EventKind =
  | "birth"
  | "death"
  | "education"
  | "residence"
  | "work"
  | "employer"
  | "buried"
  | "event";

type LifeEvent = {
  kind: EventKind;
  year: number | null;
  label: string;
  lat: number;
  lng: number;
};

type Person = {
  qid: string;
  name: string;
  description: string;
  image?: string;
  dob?: string;
  dod?: string;
  events: LifeEvent[];
};

const ICON_FOR: Record<EventKind, string> = {
  birth: "👶",
  death: "🪦",
  education: "🎓",
  residence: "🏠",
  work: "💼",
  employer: "🏢",
  buried: "⚰️",
  event: "⭐",
};

const COLOR_FOR: Record<EventKind, string> = {
  birth: "#22c55e",
  death: "#ef4444",
  education: "#8b5cf6",
  residence: "#06b6d4",
  work: "#f59e0b",
  employer: "#ec4899",
  buried: "#71717a",
  event: "#facc15",
};

const LABEL_FOR: Record<EventKind, string> = {
  birth: "Born",
  death: "Died",
  education: "Studied",
  residence: "Lived",
  work: "Worked",
  employer: "Employed by",
  buried: "Buried",
  event: "Event",
};

function yearOf(wikidataDate: string | undefined | null): number | null {
  if (!wikidataDate) return null;
  const m = wikidataDate.match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

async function searchPerson(q: string): Promise<{ qid: string; label: string; description: string }[]> {
  const r = await fetch(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
      q
    )}&language=en&format=json&type=item&origin=*&limit=7`
  );
  const d = await r.json();
  return (d.search || []).map((e: any) => ({
    qid: e.id,
    label: e.label,
    description: e.description || "",
  }));
}

async function loadPerson(qid: string): Promise<Person> {
  const sparql = `
SELECT ?loc ?locLabel ?coord ?date ?type WHERE {
  {
    wd:${qid} wdt:P19 ?loc.
    ?loc wdt:P625 ?coord.
    OPTIONAL { wd:${qid} wdt:P569 ?date. }
    BIND("birth" AS ?type)
  } UNION {
    wd:${qid} wdt:P20 ?loc.
    ?loc wdt:P625 ?coord.
    OPTIONAL { wd:${qid} wdt:P570 ?date. }
    BIND("death" AS ?type)
  } UNION {
    wd:${qid} wdt:P119 ?loc.
    ?loc wdt:P625 ?coord.
    BIND("buried" AS ?type)
  } UNION {
    wd:${qid} wdt:P69 ?edu.
    ?edu wdt:P625 ?coord.
    BIND(?edu AS ?loc)
    BIND("education" AS ?type)
  } UNION {
    wd:${qid} wdt:P551 ?loc.
    ?loc wdt:P625 ?coord.
    BIND("residence" AS ?type)
  } UNION {
    wd:${qid} wdt:P937 ?loc.
    ?loc wdt:P625 ?coord.
    BIND("work" AS ?type)
  } UNION {
    wd:${qid} wdt:P108 ?emp.
    ?emp wdt:P159 ?loc.
    ?loc wdt:P625 ?coord.
    BIND("employer" AS ?type)
  } UNION {
    wd:${qid} wdt:P793 ?ev.
    ?ev wdt:P276 ?loc.
    ?loc wdt:P625 ?coord.
    OPTIONAL { ?ev wdt:P585 ?date. }
    BIND("event" AS ?type)
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 150`;
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(
    sparql
  )}&format=json`;
  const r = await fetch(url, { headers: { Accept: "application/sparql-results+json" } });
  const d = await r.json();
  const events: LifeEvent[] = [];
  const seen = new Set<string>();
  for (const row of d.results?.bindings || []) {
    const coord = row.coord?.value as string | undefined;
    if (!coord) continue;
    const m = coord.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
    if (!m) continue;
    const lng = parseFloat(m[1]);
    const lat = parseFloat(m[2]);
    const label = row.locLabel?.value || "Unknown";
    const kind = row.type.value as EventKind;
    const date = row.date?.value as string | undefined;
    const key = `${kind}|${lat.toFixed(2)}|${lng.toFixed(2)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    events.push({ kind, year: yearOf(date), label, lat, lng });
  }
  // Fetch Wikipedia summary for name/description/image
  let name = qid;
  let description = "";
  let image: string | undefined;
  try {
    const s = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qid}&props=labels|descriptions|claims&languages=en&format=json&origin=*`
    ).then((r) => r.json());
    const ent = s.entities?.[qid];
    name = ent?.labels?.en?.value || qid;
    description = ent?.descriptions?.en?.value || "";
    const imgClaim = ent?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    if (imgClaim) {
      image = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
        imgClaim
      )}?width=400`;
    }
  } catch {}
  return { qid, name, description, image, events };
}

export default function BiographyPage() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<
    { qid: string; label: string; description: string }[]
  >([]);
  const [selected, setSelected] = useState<Person | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<LifeEvent | null>(null);
  const [tourIdx, setTourIdx] = useState<number | null>(null);
  const globeRef = useRef<any>(null);
  const searchTimer = useRef<any>(null);
  const tourTimer = useRef<any>(null);

  useEffect(() => {
    const onR = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight - 64 });
    onR();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim() || q.length < 2) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        const r = await searchPerson(q);
        setSuggestions(r);
      } catch {}
    }, 250);
  }, [q]);

  const pickPerson = async (qid: string, label: string) => {
    setQ(label);
    setSuggestions([]);
    setLoading(true);
    setError(null);
    try {
      const p = await loadPerson(qid);
      if (p.events.length === 0) {
        setError("No geocoded life events on Wikidata for this person.");
      }
      setSelected(p);
    } catch (e) {
      setError("Could not load. Try another name.");
    } finally {
      setLoading(false);
    }
  };

  const eventsSorted = useMemo(() => {
    if (!selected) return [];
    return [...selected.events].sort((a, b) => {
      if (a.year === null && b.year === null) return 0;
      if (a.year === null) return 1;
      if (b.year === null) return -1;
      return a.year - b.year;
    });
  }, [selected]);

  const arcs = useMemo(() => {
    const out: any[] = [];
    const withYears = eventsSorted.filter((e) => e.year !== null);
    for (let i = 1; i < withYears.length; i++) {
      out.push({
        startLat: withYears[i - 1].lat,
        startLng: withYears[i - 1].lng,
        endLat: withYears[i].lat,
        endLng: withYears[i].lng,
      });
    }
    return out;
  }, [eventsSorted]);

  useEffect(() => {
    if (!globeRef.current || !selected || selected.events.length === 0) return;
    // zoom to centroid
    const lat =
      selected.events.reduce((s, e) => s + e.lat, 0) / selected.events.length;
    const lng =
      selected.events.reduce((s, e) => s + e.lng, 0) / selected.events.length;
    globeRef.current.pointOfView({ lat, lng, altitude: 1.8 }, 1200);
  }, [selected]);

  // Tour: step through events chronologically with camera moves
  useEffect(() => {
    if (tourIdx === null || !eventsSorted[tourIdx] || !globeRef.current) return;
    const e = eventsSorted[tourIdx];
    globeRef.current.pointOfView(
      { lat: e.lat, lng: e.lng, altitude: 1.1 },
      2200
    );
    tourTimer.current = setTimeout(() => {
      if (tourIdx + 1 < eventsSorted.length) {
        setTourIdx(tourIdx + 1);
      } else {
        setTourIdx(null);
      }
    }, 2700);
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

  const eventMarker = (e: LifeEvent) => () => {
    const el = document.createElement("div");
    el.innerHTML = `
      <div style="width:40px;height:40px;transform:translate(-50%,-50%);pointer-events:none;">
        <div style="width:36px;height:36px;border-radius:50%;background:${COLOR_FOR[e.kind]};border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.5);">
          ${ICON_FOR[e.kind]}
        </div>
      </div>
    `;
    return el;
  };

  const markers =
    selected?.events.map((e) => ({
      lat: e.lat,
      lng: e.lng,
      alt: 0.01,
      _event: e,
    })) || [];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center px-5 md:px-8 py-4 bg-gradient-to-b from-black/85 to-transparent">
        <SiteLogo />
        <h1 className="hidden md:block font-serif text-lg md:text-xl">
          Biography Map ·{" "}
          <span className="italic text-white/60">a life on a globe</span>
        </h1>
        <span className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
          Wikidata
        </span>
      </header>

      {size.w > 0 && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="#1c1206"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          atmosphereColor="#8ab4ff"
          atmosphereAltitude={0.15}
          htmlElementsData={markers}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude="alt"
          htmlElement={(d: any) => eventMarker(d._event)()}
          arcsData={arcs}
          arcColor={() => ["rgba(255,204,120,0.8)", "rgba(255,204,120,0.2)"]}
          arcStroke={0.4}
          arcAltitudeAutoScale={0.4}
          arcDashLength={0.4}
          arcDashGap={0.15}
          arcDashAnimateTime={3000}
        />
      )}

      {/* Left: search & timeline */}
      <aside className="absolute top-[70px] left-4 md:left-6 z-20 w-[340px] max-h-[calc(100vh-90px)] rounded-2xl border border-white/15 bg-black/65 backdrop-blur-md p-5 flex flex-col">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 mb-3">
          § Search a person
        </div>
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Brad Pitt, Einstein, Atatürk…"
            className="w-full px-3 py-2.5 rounded-md border border-white/20 bg-white/5 text-[14px] text-white placeholder-white/30 focus:outline-none focus:border-[#ffcc33]"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-md border border-white/15 bg-black/90 backdrop-blur-md max-h-[260px] overflow-auto">
              {suggestions.map((s) => (
                <button
                  key={s.qid}
                  onClick={() => pickPerson(s.qid, s.label)}
                  className="block w-full text-left px-3 py-2 hover:bg-white/10 transition"
                >
                  <div className="text-[13px] text-white">{s.label}</div>
                  {s.description && (
                    <div className="text-[11px] text-white/50 line-clamp-1">
                      {s.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40 animate-pulse">
            Fetching life events…
          </div>
        )}
        {error && (
          <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-red-400/80">
            {error}
          </div>
        )}

        {selected && (
          <div className="mt-4 overflow-y-auto min-h-0 pr-1">
            {/* Hero */}
            <div className="flex gap-3 mb-4">
              {selected.image && (
                <div className="w-20 h-24 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 border border-white/15">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.image}
                    alt={selected.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-[19px] leading-tight">
                  {selected.name}
                </h2>
                {selected.description && (
                  <p className="text-[11px] text-white/60 mt-1 leading-snug line-clamp-3">
                    {selected.description}
                  </p>
                )}
              </div>
            </div>

            {/* Tour controls */}
            {eventsSorted.length > 1 && (
              <button
                onClick={tourIdx === null ? playTour : stopTour}
                className="w-full mb-4 px-3 py-2 rounded-md border font-mono text-[11px] uppercase tracking-[0.2em] transition"
                style={{
                  borderColor:
                    tourIdx !== null ? "#ef4444" : "rgba(255,204,120,0.5)",
                  color: tourIdx !== null ? "#ef4444" : "#ffcc78",
                  background:
                    tourIdx !== null
                      ? "rgba(239,68,68,0.08)"
                      : "rgba(255,204,120,0.08)",
                }}
              >
                {tourIdx !== null
                  ? `◼ Stop · step ${tourIdx + 1} / ${eventsSorted.length}`
                  : "▶ Play life tour"}
              </button>
            )}

            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40 mb-2">
              Timeline · {eventsSorted.length} places
            </div>
            <ul className="space-y-1.5">
              {eventsSorted.map((e, i) => {
                const active = tourIdx === i;
                return (
                  <li
                    key={i}
                    onMouseEnter={() => setHovered(e)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() =>
                      globeRef.current?.pointOfView(
                        { lat: e.lat, lng: e.lng, altitude: 1.2 },
                        800
                      )
                    }
                    className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition ${
                      active ? "bg-white/15 ring-1 ring-[#ffcc78]" : "hover:bg-white/10"
                    }`}
                  >
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px] flex-shrink-0"
                      style={{ background: COLOR_FOR[e.kind] }}
                    >
                      {ICON_FOR[e.kind]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-white/90 truncate">
                        {e.label}
                      </div>
                      <div className="font-mono text-[10px] text-white/40 uppercase tracking-[0.15em]">
                        {LABEL_FOR[e.kind]}
                        {e.year !== null && ` · ${e.year}`}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </aside>

      {/* Bottom legend */}
      <div className="absolute left-0 right-0 bottom-0 z-10 px-4 md:px-6 pb-4 pt-8 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
        <div className="max-w-[900px] mx-auto">
          <div className="rounded-xl border border-white/10 bg-black/65 backdrop-blur-md px-3 py-2.5 pointer-events-auto flex flex-wrap gap-x-4 gap-y-2 justify-center">
            {(
              [
                { k: "birth",     l: "Born" },
                { k: "education", l: "Studied" },
                { k: "residence", l: "Lived" },
                { k: "work",      l: "Worked" },
                { k: "employer",  l: "Employer" },
                { k: "event",     l: "Event" },
                { k: "death",     l: "Died" },
                { k: "buried",    l: "Buried" },
              ] as { k: EventKind; l: string }[]
            ).map((x) => (
              <div key={x.k} className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
                  style={{ background: COLOR_FOR[x.k] }}
                >
                  {ICON_FOR[x.k]}
                </span>
                <span className="text-[12px] text-white/80">{x.l}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
            Data · Wikidata (CC0) · Wikipedia (CC BY-SA) · Wikimedia Commons
          </div>
        </div>
      </div>
    </div>
  );
}
