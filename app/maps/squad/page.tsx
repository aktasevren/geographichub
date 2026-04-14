"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SiteLogo from "@/components/SiteLogo";
import { LocaleToggle, useLocale } from "@/components/LocaleProvider";

const COUNTRIES_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

const TSDB = "https://www.thesportsdb.com/api/v1/json/3";

type TeamHit = {
  idTeam: string;
  strTeam: string;
  strLeague?: string | null;
  strCountry?: string | null;
  strSport?: string | null;
  strBadge?: string | null;
  strStadium?: string | null;
  strManager?: string | null;
};

type Player = {
  idPlayer: string;
  strPlayer: string;
  strNationality: string | null;
  strPosition: string | null;
  strCutout: string | null;
  strThumb: string | null;
};

type CountryHit = {
  name: string;
  iso2: string | null;
  iso3: string | null;
  lat: number;
  lng: number;
};

// Aliases between nationality strings and Natural Earth NAME
const COUNTRY_ALIAS: Record<string, string> = {
  "The Netherlands": "Netherlands",
  "United States": "United States of America",
  USA: "United States of America",
  "United Kingdom": "United Kingdom",
  England: "United Kingdom",
  Scotland: "United Kingdom",
  Wales: "United Kingdom",
  "Northern Ireland": "United Kingdom",
  "Czech Republic": "Czechia",
  "Ivory Coast": "Ivory Coast",
  "Cote d'Ivoire": "Ivory Coast",
  "Cape Verde": "Cape Verde",
  "DR Congo": "Democratic Republic of the Congo",
  "Congo DR": "Democratic Republic of the Congo",
  "North Macedonia": "North Macedonia",
  "Bosnia-Herzegovina": "Bosnia and Herzegovina",
  "Bosnia and Herzegovina": "Bosnia and Herzegovina",
  "Trinidad and Tobago": "Trinidad and Tobago",
  "Saint Lucia": "Saint Lucia",
};

function iso2Of(feat: any): string | null {
  const p = feat?.properties || {};
  return p.ISO_A2_EH || p.ISO_A2 || p.WB_A2 || null;
}
function iso3Of(feat: any): string | null {
  const p = feat?.properties || {};
  return p.ADM0_A3 || p.ISO_A3 || p.ISO_A3_EH || p.SOV_A3 || null;
}
function nameOf(feat: any): string {
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

// Geometric centroid of a country feature for placing pins
function geomCentroid(geom: any): [number, number] | null {
  if (!geom) return null;
  const rings: number[][][] =
    geom.type === "Polygon"
      ? geom.coordinates
      : geom.type === "MultiPolygon"
      ? geom.coordinates.flat()
      : [];
  let sx = 0,
    sy = 0,
    n = 0;
  for (const r of rings) {
    for (const pt of r) {
      sx += pt[0];
      sy += pt[1];
      n++;
    }
  }
  if (!n) return null;
  return [sy / n, sx / n];
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
  const [suggestions, setSuggestions] = useState<TeamHit[]>([]);
  const [team, setTeam] = useState<TeamHit | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
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

  // Autocomplete — TheSportsDB, soccer-only
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `${TSDB}/searchteams.php?t=${encodeURIComponent(query)}`
        );
        const d = await r.json();
        const teams: TeamHit[] = (d.teams || [])
          .filter((t: any) => t.strSport === "Soccer")
          .slice(0, 8)
          .map((t: any) => ({
            idTeam: t.idTeam,
            strTeam: t.strTeam,
            strLeague: t.strLeague,
            strCountry: t.strCountry,
            strSport: t.strSport,
            strBadge: t.strBadge,
            strStadium: t.strStadium,
            strManager: t.strManager,
          }));
        setSuggestions(teams);
      } catch {}
    }, 300);
  }, [query]);

  const pickTeam = async (hit: TeamHit) => {
    setQuery(hit.strTeam);
    setSuggestions([]);
    setLoading(true);
    setError(null);
    setTeam(hit);
    setPlayers([]);
    try {
      const r = await fetch(`${TSDB}/lookup_all_players.php?id=${hit.idTeam}`);
      const d = await r.json();
      const list: Player[] = (d.player || []).map((p: any) => ({
        idPlayer: p.idPlayer,
        strPlayer: p.strPlayer,
        strNationality: p.strNationality,
        strPosition: p.strPosition,
        strCutout: p.strCutout,
        strThumb: p.strThumb,
      }));
      if (list.length === 0) {
        setError(
          locale === "tr"
            ? "Bu takım için kadro bulunamadı."
            : "No squad found for this team."
        );
      }
      setPlayers(list);
    } catch {
      setError(
        locale === "tr" ? "Veri alınamadı." : "Failed to fetch squad."
      );
    } finally {
      setLoading(false);
    }
  };

  // Country lookup (by name) — returns centroid/iso
  const countryIndex = useMemo(() => {
    const m = new Map<string, CountryHit>();
    features.forEach((f) => {
      const nm = nameOf(f);
      const c = geomCentroid(f.geometry);
      if (!c) return;
      const entry: CountryHit = {
        name: nm,
        iso2: iso2Of(f),
        iso3: iso3Of(f),
        lat: c[0],
        lng: c[1],
      };
      m.set(nm.toLowerCase(), entry);
      const p = f.properties || {};
      if (p.NAME_LONG) m.set(String(p.NAME_LONG).toLowerCase(), entry);
      if (p.ADMIN) m.set(String(p.ADMIN).toLowerCase(), entry);
    });
    return m;
  }, [features]);

  function resolveCountry(nationality: string | null): CountryHit | null {
    if (!nationality) return null;
    const alias = COUNTRY_ALIAS[nationality] || nationality;
    return (
      countryIndex.get(alias.toLowerCase()) ||
      countryIndex.get(nationality.toLowerCase()) ||
      null
    );
  }

  const h = w * 0.5;

  // Pins — one per country nationality, clustered
  const pins = useMemo(() => {
    const byCountry = new Map<string, { hit: CountryHit; players: Player[] }>();
    players.forEach((p) => {
      const c = resolveCountry(p.strNationality);
      if (!c) return;
      const key = c.iso3 || c.name;
      if (!byCountry.has(key)) byCountry.set(key, { hit: c, players: [] });
      byCountry.get(key)!.players.push(p);
    });
    return Array.from(byCountry.entries()).map(([key, v]) => {
      const [x, y] = project(v.hit.lat, v.hit.lng, w, h);
      return { key, x, y, hit: v.hit, players: v.players };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, countryIndex, w]);

  // Country → player count (for map highlight)
  const memberIso = useMemo(() => {
    const s = new Set<string>();
    pins.forEach((p) => p.hit.iso3 && s.add(p.hit.iso3));
    return s;
  }, [pins]);

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

  // Country breakdown
  const byNat = useMemo(() => {
    const m = new Map<string, Player[]>();
    players.forEach((p) => {
      const n = p.strNationality || "?";
      if (!m.has(n)) m.set(n, []);
      m.get(n)!.push(p);
    });
    return Array.from(m.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [players]);

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
            {locale === "tr" ? "§ Güncel kadro" : "§ Current squad"}
          </div>
          <h1 className="font-serif font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.98] tracking-tight">
            {locale === "tr" ? "Kadro" : "Squad"}{" "}
            <span className="italic" style={{ color: "var(--accent)" }}>
              {locale === "tr" ? "Haritası." : "Map."}
            </span>
          </h1>
          <p className="mt-3 text-[14px] md:text-[16px] text-[var(--text-2)] max-w-xl">
            {locale === "tr"
              ? "Bir futbol takımı yaz — güncel kadro ve oyuncuların millilikleri dünya haritasında."
              : "Type a football team — current squad and players' nationalities on a world map."}
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
                ? "Örn: Fenerbahçe, Real Madrid, Liverpool…"
                : "e.g. Fenerbahçe, Real Madrid, Liverpool…"
            }
            className="w-full max-w-xl px-5 py-3 rounded-full border border-[var(--line-2)] bg-transparent text-[15px] focus:outline-none focus:border-[var(--accent)]"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-20 top-full left-0 mt-2 max-w-xl w-full rounded-md border border-[var(--line-2)] bg-[var(--bg)] shadow-2xl max-h-[380px] overflow-auto">
              {suggestions.map((s) => (
                <button
                  key={s.idTeam}
                  onClick={() => pickTeam(s)}
                  className="flex items-center gap-3 w-full text-left px-3 py-2.5 hover:bg-[var(--line)] transition border-b border-[var(--line)] last:border-b-0"
                >
                  <span className="w-10 h-10 flex-shrink-0 rounded-md bg-white/90 flex items-center justify-center overflow-hidden">
                    {s.strBadge ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.strBadge}
                        alt=""
                        className="w-full h-full object-contain p-0.5"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-[var(--muted)] text-sm">⚽</span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-serif truncate">
                      {s.strTeam}
                    </div>
                    <div className="text-[11px] text-[var(--muted)] line-clamp-1 mt-0.5">
                      {s.strLeague} · {s.strCountry}
                    </div>
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

      {team && !loading && players.length > 0 && (
        <section className="px-5 md:px-10 pb-12">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
            {/* Map */}
            <div className="md:col-span-8">
              <div className="mb-3 flex items-center gap-3">
                {team.strBadge && (
                  <span className="w-14 h-14 rounded-lg bg-white/95 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={team.strBadge}
                      alt=""
                      className="w-full h-full object-contain p-1"
                    />
                  </span>
                )}
                <div className="min-w-0">
                  <div className="font-serif text-2xl md:text-3xl leading-tight">
                    {team.strTeam}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mt-1">
                    {team.strLeague} · {team.strCountry} · {players.length}{" "}
                    {locale === "tr" ? "oyuncu" : "players"}
                    {team.strManager && (
                      <>
                        {" · "}
                        {locale === "tr" ? "TD" : "Manager"}:{" "}
                        <span className="text-[var(--text-2)]">
                          {team.strManager}
                        </span>
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
                      const ic3 = iso3Of(f);
                      const isMember = ic3 && memberIso.has(ic3);
                      const isHover =
                        hoveredCountry === nameOf(f) && isMember;
                      return (
                        <path
                          key={i}
                          d={geomToPath(f.geometry, w, h)}
                          fill={
                            isMember
                              ? isHover
                                ? "rgba(52,211,153,0.8)"
                                : "rgba(52,211,153,0.5)"
                              : "rgba(255,255,255,0.05)"
                          }
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth={0.4 / zoom.scale}
                          onMouseEnter={() => setHoveredCountry(nameOf(f))}
                          onMouseLeave={() => setHoveredCountry(null)}
                        />
                      );
                    })}
                    {pins.map((p) => (
                      <g key={p.key}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={(7 + p.players.length * 1.2) / zoom.scale + 3}
                          fill="#34d399"
                          fillOpacity="0.3"
                        />
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={(4 + p.players.length * 0.6) / zoom.scale + 2}
                          fill="#34d399"
                          stroke="#064e3b"
                          strokeWidth={0.8 / zoom.scale}
                        />
                        <text
                          x={p.x}
                          y={p.y + 2 / zoom.scale}
                          textAnchor="middle"
                          fontSize={9 / zoom.scale + 2}
                          fill="#000"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {p.players.length}
                        </text>
                      </g>
                    ))}
                  </g>
                </svg>

                <div className="absolute right-2 top-2 flex flex-col gap-1 z-10">
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

              <div className="mt-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] mb-2">
                  {locale === "tr" ? "Millilik dağılımı" : "By nationality"}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {byNat.map(([nat, list]) => {
                    const c = resolveCountry(nat);
                    return (
                      <span
                        key={nat}
                        className="font-mono text-[11px] px-2.5 py-1 rounded-md border border-[var(--line-2)] bg-[var(--line)] flex items-center gap-1.5"
                      >
                        <span>{flagFor(c?.iso2 || null)}</span>
                        <span>{nat}</span>
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
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--muted)] mb-2">
                  {locale === "tr" ? "Oyuncular" : "Players"} · {players.length}
                </div>
                <ul className="space-y-1 max-h-[70vh] overflow-auto pr-1">
                  {players.map((p) => {
                    const c = resolveCountry(p.strNationality);
                    return (
                      <li
                        key={p.idPlayer}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-[var(--line)]"
                      >
                        {p.strCutout ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.strCutout}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover bg-[var(--line)] flex-shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <span className="w-8 h-8 rounded-full bg-[var(--line)] flex-shrink-0 flex items-center justify-center text-[14px]">
                            👤
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[13px] text-[var(--text)] truncate">
                              {p.strPlayer}
                            </span>
                            <span className="text-sm">{flagFor(c?.iso2 || null)}</span>
                          </div>
                          <div className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.12em]">
                            {p.strNationality}
                            {p.strPosition && ` · ${p.strPosition}`}
                          </div>
                        </div>
                      </li>
                    );
                  })}
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
                  ? "Bir futbol takımı yaz — Fenerbahçe, Real Madrid, Bayern, Arsenal…"
                  : "Type a football team — Fenerbahçe, Real Madrid, Bayern, Arsenal…"}
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {[
                  "Fenerbahce",
                  "Galatasaray",
                  "Real Madrid",
                  "Barcelona",
                  "Bayern",
                  "Arsenal",
                  "Liverpool",
                  "PSG",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuery(q)}
                    className="px-3 py-1.5 rounded-full border border-[var(--line-2)] text-[12px] font-mono uppercase tracking-[0.15em] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {q}
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
          {locale === "tr" ? "Veri · TheSportsDB" : "Data · TheSportsDB"}
        </span>
      </footer>
    </div>
  );
}
