"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SiteLogo from "@/components/SiteLogo";
import { LocaleToggle, useLocale } from "@/components/LocaleProvider";

const COUNTRIES_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

type TeamSuggestion = {
  qid: string;
  label: string;
  description: string;
  logo?: string;
};

type Member = {
  qid: string;
  name: string;
  countryName: string;
  countryIso2: string | null;
  lat: number | null;
  lng: number | null;
  position?: string | null;
  isCoach?: boolean;
  image?: string | null;
  startDate?: string | null;
};

type Team = {
  qid: string;
  name: string;
  image?: string | null;
  members: Member[];
};

function iso3(feat: any): string | null {
  const p = feat?.properties || {};
  return p.ADM0_A3 || p.ISO_A3 || p.ISO_A3_EH || p.SOV_A3 || null;
}
function iso2Of(feat: any): string | null {
  const p = feat?.properties || {};
  return p.ISO_A2_EH || p.ISO_A2 || p.WB_A2 || null;
}
function countryName(feat: any): string {
  const p = feat?.properties || {};
  return p.NAME || p.ADMIN || p.NAME_LONG || "—";
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

export default function SquadPage() {
  const { t, locale } = useLocale();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<TeamSuggestion[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<any[]>([]);
  const [w, setW] = useState(1000);
  const [zoom, setZoom] = useState({ scale: 1, cx: 0.5, cy: 0.5 });
  const [dragging, setDragging] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const dragStart = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<any>(null);

  useEffect(() => {
    fetch(COUNTRIES_URL)
      .then((r) => r.json())
      .then((d) => setFeatures(d.features || []));
  }, []);

  useEffect(() => {
    const onR = () => containerRef.current && setW(containerRef.current.clientWidth);
    onR();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  // Autocomplete
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
            query
          )}&language=${locale === "tr" ? "tr" : "en"}&format=json&type=item&origin=*&limit=8`
        );
        const d = await r.json();
        const base = (d.search || []).map((e: any) => ({
          qid: e.id,
          label: e.label,
          description: e.description || "",
        }));
        setSuggestions(base);

        // Fetch logos in parallel
        if (base.length > 0) {
          const ids = base.map((b: any) => b.qid).join("|");
          try {
            const er = await fetch(
              `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&props=claims&format=json&origin=*`
            );
            const ed = await er.json();
            const withLogos = base.map((b: any) => {
              const ent = ed.entities?.[b.qid];
              const c = ent?.claims || {};
              // P154 = logo image, P18 = image (fallback)
              const file =
                c.P154?.[0]?.mainsnak?.datavalue?.value ||
                c.P41?.[0]?.mainsnak?.datavalue?.value || // flag
                c.P18?.[0]?.mainsnak?.datavalue?.value;
              if (!file) return b;
              return {
                ...b,
                logo: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
                  file
                )}?width=64`,
              };
            });
            setSuggestions(withLogos);
          } catch {}
        }
      } catch {}
    }, 250);
  }, [query, locale]);

  const pickTeam = async (qid: string, label: string, logo?: string) => {
    setQuery(label);
    setSuggestions([]);
    setLoading(true);
    setError(null);
    setTeam(null);
    try {
      // Simplified SPARQL — current players of the team
      const sparql = `
SELECT ?person ?personLabel ?country ?countryLabel ?iso2 ?coord ?positionLabel WHERE {
  ?person p:P54 ?ps .
  ?ps ps:P54 wd:${qid} .
  FILTER NOT EXISTS { ?ps pq:P582 ?e }
  OPTIONAL { ?person wdt:P413 ?position }
  ?person wdt:P27 ?country .
  OPTIONAL { ?country wdt:P297 ?iso2 }
  OPTIONAL { ?country wdt:P625 ?coord }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${locale === "tr" ? "tr,en" : "en,tr"}" . }
}
LIMIT 50`;

      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 20000);
      const r = await fetch("https://query.wikidata.org/sparql", {
        method: "POST",
        headers: {
          Accept: "application/sparql-results+json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "query=" + encodeURIComponent(sparql),
        signal: ctrl.signal,
      });
      clearTimeout(timeout);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      const rows = d?.results?.bindings || [];

      // Separately fetch the head coach (smaller query, less likely to timeout)
      try {
        const csp = `
SELECT ?person ?personLabel ?country ?countryLabel ?iso2 ?coord WHERE {
  wd:${qid} p:P286 ?cs .
  ?cs ps:P286 ?person .
  FILTER NOT EXISTS { ?cs pq:P582 ?e }
  ?person wdt:P27 ?country .
  OPTIONAL { ?country wdt:P297 ?iso2 }
  OPTIONAL { ?country wdt:P625 ?coord }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${locale === "tr" ? "tr,en" : "en,tr"}" . }
}
LIMIT 5`;
        const cr = await fetch("https://query.wikidata.org/sparql", {
          method: "POST",
          headers: {
            Accept: "application/sparql-results+json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "query=" + encodeURIComponent(csp),
        });
        if (cr.ok) {
          const cd = await cr.json();
          (cd?.results?.bindings || []).forEach((row: any) => {
            row.isCoachFlag = { value: "true" };
          });
          rows.push(...(cd?.results?.bindings || []));
        }
      } catch {}

      // Dedupe by person
      const byQid = new Map<string, Member>();
      for (const row of rows) {
        const pqid = row.person.value.split("/").pop() || "";
        const coord = row.coord?.value as string | undefined;
        let lat: number | null = null,
          lng: number | null = null;
        if (coord) {
          const m = coord.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
          if (m) {
            lng = parseFloat(m[1]);
            lat = parseFloat(m[2]);
          }
        }
        const isCoach = row.isCoachFlag?.value === "true";
        const existing = byQid.get(pqid);
        if (existing) {
          // Prefer coach row over player row (or vice versa — we want both)
          if (!existing.isCoach && isCoach) existing.isCoach = true;
          continue;
        }
        byQid.set(pqid, {
          qid: pqid,
          name: row.personLabel?.value || pqid,
          countryName: row.countryLabel?.value || "",
          countryIso2: row.iso2?.value || null,
          lat,
          lng,
          position: row.positionLabel?.value || null,
          isCoach,
          image: row.image?.value || null,
          startDate: row.start?.value || null,
        });
      }
      const members = Array.from(byQid.values());
      if (members.length === 0) {
        setError(
          locale === "tr"
            ? "Bu takım için kadro bulunamadı (Wikidata'da kayıt yoksa)."
            : "No squad found for this team (Wikidata has no current records)."
        );
      }
      setTeam({
        qid,
        name: label,
        image: logo || null,
        members,
      });
    } catch (e) {
      setError(
        locale === "tr" ? "Veri alınamadı." : "Failed to fetch data."
      );
    } finally {
      setLoading(false);
    }
  };

  const h = w * 0.5;

  // Group members by country
  const byCountry = useMemo(() => {
    const m = new Map<string, Member[]>();
    team?.members.forEach((mem) => {
      const key = mem.countryName || "—";
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(mem);
    });
    return m;
  }, [team]);

  // ISO country code -> list of members (for highlighting on map via iso2)
  const memberIsoSet = useMemo(() => {
    const s = new Set<string>();
    team?.members.forEach((m) => {
      if (m.countryIso2) s.add(m.countryIso2.toUpperCase());
    });
    return s;
  }, [team]);

  // Player pins with lat/lng
  const pins = useMemo(() => {
    return (
      team?.members
        .filter((m) => m.lat !== null && m.lng !== null)
        .map((m) => ({
          ...m,
          x: ((m.lng! + 180) / 360) * w,
          y: ((90 - m.lat!) / 180) * h,
        })) || []
    );
  }, [team, w, h]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      if (!dragStart.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = (e.clientX - dragStart.current.x) / rect.width / zoom.scale;
      const dy = (e.clientY - dragStart.current.y) / rect.height / zoom.scale;
      setZoom((z) => ({
        ...z,
        cx: Math.max(0, Math.min(1, dragStart.current!.cx - dx)),
        cy: Math.max(0, Math.min(1, dragStart.current!.cy - dy)),
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

  const coach = team?.members.find((m) => m.isCoach);
  const players = team?.members.filter((m) => !m.isCoach) || [];

  return (
    <div className="min-h-screen grain">
      <header className="hair-b">
        <div className="flex justify-between items-center px-5 md:px-10 py-3.5 md:py-4">
          <SiteLogo theme="light" />
          <LocaleToggle theme="light" />
        </div>
        <div className="px-5 md:px-10 py-2.5 hair-b">
          <ol className="flex items-center gap-x-1.5 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            <li>
              <a href="/" className="hover:text-[var(--text)]">
                {t("common.home")}
              </a>
            </li>
            <li>/</li>
            <li className="text-[var(--text-2)]">
              {locale === "tr" ? "Kadro Haritası" : "Squad Map"}
            </li>
          </ol>
        </div>
      </header>

      <section className="px-5 md:px-10 pt-8 md:pt-12 pb-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] mb-3">
            {locale === "tr" ? "§ Bir takım ara" : "§ Search a team"}
          </div>
          <h1 className="font-serif font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.98] tracking-tight">
            {locale === "tr" ? "Kadro" : "Squad"}{" "}
            <span className="italic" style={{ color: "var(--accent)" }}>
              {locale === "tr" ? "Haritası." : "Map."}
            </span>
          </h1>
          <p className="mt-3 text-[14px] md:text-[16px] text-[var(--text-2)] max-w-xl">
            {locale === "tr"
              ? "Bir takım ismi yaz — Fenerbahçe, Real Madrid, PSG. Oyuncuları ve teknik direktörü haritada memleketlerine göre gör."
              : "Type a team name — Fenerbahçe, Real Madrid, PSG. See players and manager on a world map by their nationality."}
          </p>
        </div>
      </section>

      <section className="px-5 md:px-10 pt-4 pb-6">
        <div className="max-w-[1200px] mx-auto relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              locale === "tr"
                ? "Örn: Fenerbahçe, Galatasaray, Real Madrid…"
                : "e.g. Fenerbahçe, Real Madrid, Liverpool…"
            }
            className="w-full max-w-xl px-5 py-3 rounded-full border border-[var(--line-2)] bg-transparent text-[15px] focus:outline-none focus:border-[var(--accent)]"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-20 top-full left-0 mt-2 max-w-xl w-full rounded-md border border-[var(--line-2)] bg-[var(--bg)] shadow-2xl max-h-[380px] overflow-auto">
              {suggestions.map((s) => (
                <button
                  key={s.qid}
                  onClick={() => pickTeam(s.qid, s.label, s.logo)}
                  className="flex items-center gap-3 w-full text-left px-3 py-2.5 hover:bg-[var(--line)] transition border-b border-[var(--line)] last:border-b-0"
                >
                  <span className="w-10 h-10 flex-shrink-0 rounded-md bg-white/90 flex items-center justify-center overflow-hidden">
                    {s.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.logo}
                        alt=""
                        className="w-full h-full object-contain p-0.5"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-[var(--muted)] font-mono text-[10px]">
                        ⚽
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-serif truncate">
                      {s.label}
                    </div>
                    {s.description && (
                      <div className="text-[11px] text-[var(--muted)] line-clamp-1 mt-0.5">
                        {s.description}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {loading && (
        <div className="px-5 md:px-10 pb-6 max-w-[1200px] mx-auto font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)] animate-pulse">
          {locale === "tr" ? "Kadro yükleniyor…" : "Fetching squad…"}
        </div>
      )}
      {error && (
        <div className="px-5 md:px-10 pb-6 max-w-[1200px] mx-auto font-mono text-[11px] uppercase tracking-[0.22em] text-red-500">
          {error}
        </div>
      )}

      {team && !loading && (
        <section className="px-5 md:px-10 pb-12">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
            {/* Map */}
            <div className="md:col-span-8">
              <div className="mb-3 flex items-center gap-3">
                {team.image && (
                  <span className="w-14 h-14 rounded-lg bg-white/95 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={team.image}
                      alt=""
                      className="w-full h-full object-contain p-1"
                    />
                  </span>
                )}
                <div className="min-w-0">
                  <div className="font-serif text-2xl md:text-3xl leading-tight">
                    {team.name}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mt-1">
                    {players.length} {locale === "tr" ? "oyuncu" : "players"}
                    {coach && (
                      <>
                        {" · "}
                        {locale === "tr" ? "TD" : "Manager"}:{" "}
                        <span className="text-[var(--text-2)]">{coach.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div
                ref={containerRef}
                className="rounded-xl border border-[var(--line-2)] bg-[#0a0a0c] overflow-hidden relative select-none"
                style={{
                  aspectRatio: "2 / 1",
                  cursor: dragging ? "grabbing" : "grab",
                }}
                onMouseDown={(e) => {
                  if ((e.target as HTMLElement).closest("button")) return;
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
                  <g
                    style={{
                      transformOrigin: `${zoom.cx * w}px ${zoom.cy * h}px`,
                      transform: `scale(${zoom.scale})`,
                      transition: "transform 600ms ease",
                    }}
                  >
                    {features.map((f, i) => {
                      const ic2 = iso2Of(f);
                      const isMember =
                        ic2 && memberIsoSet.has(ic2.toUpperCase());
                      const isHover =
                        hoveredCountry === countryName(f) && isMember;
                      return (
                        <path
                          key={i}
                          d={geomToPath(f.geometry, w, h)}
                          fill={
                            isMember
                              ? isHover
                                ? "rgba(52,211,153,0.75)"
                                : "rgba(52,211,153,0.5)"
                              : "rgba(255,255,255,0.05)"
                          }
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth={0.4 / zoom.scale}
                          onMouseEnter={() => setHoveredCountry(countryName(f))}
                          onMouseLeave={() => setHoveredCountry(null)}
                        />
                      );
                    })}
                    {/* Player pins */}
                    {pins.map((p, i) => (
                      <g key={`${p.qid}-${i}`}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={8 / zoom.scale + 4}
                          fill={p.isCoach ? "#fbbf24" : "#34d399"}
                          fillOpacity="0.3"
                        />
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={4 / zoom.scale + 3}
                          fill={p.isCoach ? "#fbbf24" : "#34d399"}
                          stroke="#000"
                          strokeWidth={0.8 / zoom.scale}
                        />
                      </g>
                    ))}
                  </g>
                </svg>

                <div className="absolute right-2 top-2 flex flex-col gap-1">
                  <button
                    onClick={() =>
                      setZoom((z) => ({ ...z, scale: Math.min(6, z.scale * 1.5) }))
                    }
                    className="w-8 h-8 rounded-full border border-white/20 bg-black/70 backdrop-blur text-white text-base"
                  >
                    +
                  </button>
                  <button
                    onClick={() =>
                      setZoom((z) => ({ ...z, scale: Math.max(1, z.scale / 1.5) }))
                    }
                    className="w-8 h-8 rounded-full border border-white/20 bg-black/70 backdrop-blur text-white text-base"
                  >
                    −
                  </button>
                  <button
                    onClick={() => setZoom({ scale: 1, cx: 0.5, cy: 0.5 })}
                    className="w-8 h-8 rounded-full border border-white/20 bg-black/70 backdrop-blur text-white text-[10px]"
                  >
                    ⟲
                  </button>
                </div>
              </div>

              {/* Country breakdown */}
              <div className="mt-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] mb-2">
                  {locale === "tr" ? "Millilik dağılımı" : "By nationality"}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(byCountry.entries())
                    .sort((a, b) => b[1].length - a[1].length)
                    .map(([cn, list]) => {
                      const iso2 = list[0]?.countryIso2;
                      return (
                        <span
                          key={cn}
                          className="font-mono text-[11px] px-2.5 py-1 rounded-md border border-[var(--line-2)] bg-[var(--line)] flex items-center gap-1.5"
                        >
                          <span>{flagFor(iso2)}</span>
                          <span>{cn}</span>
                          <span className="text-emerald-500 tabular-nums">
                            ×{list.length}
                          </span>
                        </span>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Squad list */}
            <aside className="md:col-span-4">
              <div className="rounded-xl border border-[var(--line-2)] p-4 sticky top-4">
                {coach && (
                  <>
                    <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--muted)] mb-2">
                      {locale === "tr" ? "Teknik direktör" : "Manager"}
                    </div>
                    <div className="flex items-center gap-2.5 py-2 mb-3 border-b border-[var(--line)]">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                        style={{ background: "#fbbf24" }}
                      >
                        {flagFor(coach.countryIso2)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-serif">{coach.name}</div>
                        <div className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.15em]">
                          {coach.countryName}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--muted)] mb-2">
                  {locale === "tr" ? "Oyuncular" : "Players"} · {players.length}
                </div>
                <ul className="space-y-1 max-h-[60vh] overflow-auto pr-1">
                  {players.map((p) => (
                    <li
                      key={p.qid}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[var(--line)]"
                    >
                      <span className="text-lg">{flagFor(p.countryIso2)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] text-[var(--text)] truncate">
                          {p.name}
                        </div>
                        <div className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.15em]">
                          {p.countryName}
                          {p.position && ` · ${p.position}`}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      )}

      {!team && !loading && !error && (
        <section className="px-5 md:px-10 pb-12">
          <div className="max-w-[1200px] mx-auto">
            <div className="rounded-xl border border-dashed border-[var(--line-2)] p-8 md:p-12 text-center">
              <div className="text-4xl mb-3">⚽</div>
              <p className="font-serif text-lg md:text-xl text-[var(--text-2)] italic max-w-xl mx-auto">
                {locale === "tr"
                  ? "Bir takım ismi yaz — Fenerbahçe, Real Madrid, Bayern München…"
                  : "Type a team name — Fenerbahçe, Real Madrid, Bayern München…"}
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {[
                  { label: "Fenerbahçe", q: "Fenerbahçe" },
                  { label: "Galatasaray", q: "Galatasaray" },
                  { label: "Real Madrid", q: "Real Madrid" },
                  { label: "Barcelona", q: "FC Barcelona" },
                  { label: "Liverpool", q: "Liverpool FC" },
                ].map((t) => (
                  <button
                    key={t.q}
                    onClick={() => setQuery(t.q)}
                    className="px-3 py-1.5 rounded-full border border-[var(--line-2)] text-[12px] font-mono uppercase tracking-[0.15em] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="px-5 md:px-10 py-6 hair-t flex flex-wrap justify-between gap-4 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        <span className="hidden md:inline">
          {locale === "tr" ? "Veri · Wikidata" : "Data · Wikidata"}
        </span>
      </footer>
    </div>
  );
}
