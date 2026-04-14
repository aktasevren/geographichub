"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SiteLogo from "@/components/SiteLogo";
import { LocaleToggle, useLocale } from "@/components/LocaleProvider";

const COUNTRIES_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

const WP = "https://en.wikipedia.org";

type TeamHit = {
  key: string; // URL key
  title: string;
  description: string | null;
  thumbnail?: string | null;
};

type Player = {
  no: string | null;
  name: string;
  nat: string; // FIFA code (3 letters usually)
  pos: string | null;
  loan: string | null;
};

type CountryHit = {
  name: string;
  iso2: string | null;
  iso3: string | null;
  lat: number;
  lng: number;
};

// FIFA 3-letter code → Natural Earth country NAME
const FIFA_TO_COUNTRY: Record<string, string> = {
  ENG: "United Kingdom",
  SCO: "United Kingdom",
  WAL: "United Kingdom",
  NIR: "United Kingdom",
  GBR: "United Kingdom",
  USA: "United States of America",
  TUR: "Turkey",
  GER: "Germany",
  NED: "Netherlands",
  POR: "Portugal",
  SUI: "Switzerland",
  DEN: "Denmark",
  CRO: "Croatia",
  SRB: "Serbia",
  SVK: "Slovakia",
  SVN: "Slovenia",
  BUL: "Bulgaria",
  POL: "Poland",
  RUS: "Russia",
  UKR: "Ukraine",
  CZE: "Czechia",
  GRE: "Greece",
  ESP: "Spain",
  FRA: "France",
  ITA: "Italy",
  BEL: "Belgium",
  AUT: "Austria",
  IRL: "Ireland",
  HUN: "Hungary",
  ROU: "Romania",
  ALB: "Albania",
  BIH: "Bosnia and Herzegovina",
  MKD: "North Macedonia",
  MNE: "Montenegro",
  ISL: "Iceland",
  FIN: "Finland",
  SWE: "Sweden",
  NOR: "Norway",
  ARM: "Armenia",
  AZE: "Azerbaijan",
  GEO: "Georgia",
  ARG: "Argentina",
  BRA: "Brazil",
  URU: "Uruguay",
  PAR: "Paraguay",
  CHI: "Chile",
  COL: "Colombia",
  ECU: "Ecuador",
  PER: "Peru",
  VEN: "Venezuela",
  BOL: "Bolivia",
  MEX: "Mexico",
  CAN: "Canada",
  CRC: "Costa Rica",
  HON: "Honduras",
  PAN: "Panama",
  JAM: "Jamaica",
  HAI: "Haiti",
  DOM: "Dominican Republic",
  TRI: "Trinidad and Tobago",
  CUB: "Cuba",
  NGA: "Nigeria",
  CMR: "Cameroon",
  GHA: "Ghana",
  CIV: "Ivory Coast",
  SEN: "Senegal",
  MLI: "Mali",
  BFA: "Burkina Faso",
  MAR: "Morocco",
  ALG: "Algeria",
  TUN: "Tunisia",
  EGY: "Egypt",
  KEN: "Kenya",
  ETH: "Ethiopia",
  RSA: "South Africa",
  ANG: "Angola",
  ZAM: "Zambia",
  ZIM: "Zimbabwe",
  COD: "Democratic Republic of the Congo",
  CGO: "Republic of the Congo",
  CPV: "Cape Verde",
  GUI: "Guinea",
  GNB: "Guinea-Bissau",
  GAB: "Gabon",
  BEN: "Benin",
  TOG: "Togo",
  SLE: "Sierra Leone",
  LBR: "Liberia",
  UGA: "Uganda",
  MOZ: "Mozambique",
  NAM: "Namibia",
  SDN: "Sudan",
  SSD: "South Sudan",
  MRT: "Mauritania",
  LBY: "Libya",
  MAD: "Madagascar",
  KSA: "Saudi Arabia",
  UAE: "United Arab Emirates",
  IRN: "Iran",
  IRQ: "Iraq",
  ISR: "Israel",
  JOR: "Jordan",
  LBN: "Lebanon",
  SYR: "Syria",
  PLE: "Palestine",
  QAT: "Qatar",
  KUW: "Kuwait",
  BHR: "Bahrain",
  OMA: "Oman",
  YEM: "Yemen",
  JPN: "Japan",
  KOR: "South Korea",
  PRK: "North Korea",
  CHN: "China",
  IND: "India",
  PAK: "Pakistan",
  AFG: "Afghanistan",
  THA: "Thailand",
  VIE: "Vietnam",
  IDN: "Indonesia",
  MAS: "Malaysia",
  SGP: "Singapore",
  PHI: "Philippines",
  AUS: "Australia",
  NZL: "New Zealand",
  FIJ: "Fiji",
  UZB: "Uzbekistan",
  KAZ: "Kazakhstan",
  KGZ: "Kyrgyzstan",
  TJK: "Tajikistan",
  TKM: "Turkmenistan",
  COM: "Comoros",
  EQG: "Equatorial Guinea",
  GAM: "Gambia",
  MWI: "Malawi",
  BDI: "Burundi",
  RWA: "Rwanda",
  TAN: "United Republic of Tanzania",
  NIG: "Niger",
  CHA: "Chad",
  CTA: "Central African Republic",
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
      sx += pt[0]; sy += pt[1]; n++;
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

// Parse a {{Fs player|...}} template body into named params
function parseFsParams(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  const parts = body.split("|");
  for (const p of parts) {
    const eq = p.indexOf("=");
    if (eq < 0) continue;
    const k = p.slice(0, eq).trim().toLowerCase();
    const v = p.slice(eq + 1).trim();
    out[k] = v;
  }
  return out;
}

// Strip [[wiki|links]] to plain text
function stripWikiLinks(s: string): string {
  return s
    .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, "$2")
    .replace(/<ref[\s\S]*?<\/ref>/g, "")
    .replace(/<ref[^/]*\/>/g, "")
    .replace(/'{2,}/g, "")
    .trim();
}

function parseSquad(wikitext: string): Player[] {
  const re = /\{\{[Ff]s player\s*\|([^}]+)\}\}/g;
  const out: Player[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(wikitext)) !== null) {
    const params = parseFsParams(m[1]);
    const name = stripWikiLinks(params.name || "");
    if (!name) continue;
    out.push({
      no: params.no || null,
      name,
      nat: (params.nat || "").toUpperCase(),
      pos: (params.pos || "").toUpperCase() || null,
      loan: params.other ? stripWikiLinks(params.other) : null,
    });
  }
  return out;
}

// Extract manager/head coach from infobox
function parseManager(wikitext: string): string | null {
  const m = wikitext.match(
    /\|\s*(?:manager|head coach|headcoach|coach)\s*=\s*([^\n|}]+)/i
  );
  if (!m) return null;
  const v = stripWikiLinks(m[1]).trim();
  return v || null;
}

export default function SquadPage() {
  const { t, locale } = useLocale();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<TeamHit[]>([]);
  const [team, setTeam] = useState<TeamHit | null>(null);
  const [manager, setManager] = useState<string | null>(null);
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

  // Autocomplete — Wikipedia search, filtered to football clubs
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `${WP}/w/rest.php/v1/search/title?q=${encodeURIComponent(
            query
          )}&limit=15`
        );
        const d = await r.json();
        const pages: any[] = d.pages || [];
        const clubs = pages
          .filter((p) => {
            const desc = (p.description || "").toLowerCase();
            const title = (p.title || "").toLowerCase();
            const isClub =
              /football|soccer/.test(desc) &&
              /(club|team|f\.c\.|s\.k\.|cf|association)/.test(
                desc + " " + title
              );
            const isExcluded =
              /(season|players|manager|supporter|kit|history|rival|derb|statistic|record)/.test(
                title
              ) ||
              /season|manager|supporter/.test(desc);
            return isClub && !isExcluded;
          })
          .slice(0, 8)
          .map((p) => ({
            key: p.key,
            title: p.title,
            description: p.description,
          }));
        setSuggestions(clubs);

        // Fetch thumbnails in parallel
        clubs.forEach(async (c) => {
          try {
            const s = await fetch(
              `${WP}/api/rest_v1/page/summary/${encodeURIComponent(c.key)}`
            );
            const sd = await s.json();
            const thumb = sd?.thumbnail?.source || null;
            setSuggestions((prev) =>
              prev.map((x) => (x.key === c.key ? { ...x, thumbnail: thumb } : x))
            );
          } catch {}
        });
      } catch {}
    }, 350);
  }, [query]);

  const pickTeam = async (hit: TeamHit) => {
    setQuery(hit.title);
    setSuggestions([]);
    setLoading(true);
    setError(null);
    setTeam(hit);
    setPlayers([]);
    setManager(null);
    try {
      // Find "Current squad" section
      const secR = await fetch(
        `${WP}/w/api.php?action=parse&page=${encodeURIComponent(
          hit.key
        )}&prop=sections&format=json&origin=*`
      );
      const secD = await secR.json();
      const sections: any[] = secD?.parse?.sections || [];
      const squadSec = sections.find((s) =>
        /current squad|first-team squad|first team squad|squad/i.test(s.line)
      );

      // Fetch section 0 for manager + logo fallback
      const headR = await fetch(
        `${WP}/w/api.php?action=parse&page=${encodeURIComponent(
          hit.key
        )}&prop=wikitext&section=0&format=json&origin=*`
      );
      const headD = await headR.json();
      const headText: string = headD?.parse?.wikitext?.["*"] || "";
      setManager(parseManager(headText));

      // Ensure team thumbnail
      if (!hit.thumbnail) {
        try {
          const s = await fetch(
            `${WP}/api/rest_v1/page/summary/${encodeURIComponent(hit.key)}`
          );
          const sd = await s.json();
          if (sd?.thumbnail?.source) {
            setTeam({ ...hit, thumbnail: sd.thumbnail.source });
          }
        } catch {}
      }

      if (!squadSec) {
        setError(
          locale === "tr"
            ? "Bu sayfada 'Current squad' bölümü bulunamadı."
            : "No 'Current squad' section on this page."
        );
        setLoading(false);
        return;
      }

      const sqR = await fetch(
        `${WP}/w/api.php?action=parse&page=${encodeURIComponent(
          hit.key
        )}&prop=wikitext&section=${squadSec.index}&format=json&origin=*`
      );
      const sqD = await sqR.json();
      const sqText: string = sqD?.parse?.wikitext?.["*"] || "";
      const list = parseSquad(sqText);

      if (list.length === 0) {
        setError(
          locale === "tr"
            ? "Kadro şablonu okunamadı."
            : "Could not parse squad template."
        );
      }
      setPlayers(list);
    } catch {
      setError(locale === "tr" ? "Veri alınamadı." : "Failed to fetch squad.");
    } finally {
      setLoading(false);
    }
  };

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

  function resolveCountry(fifa: string | null): CountryHit | null {
    if (!fifa) return null;
    const name = FIFA_TO_COUNTRY[fifa.toUpperCase()];
    if (name) {
      const hit = countryIndex.get(name.toLowerCase());
      if (hit) return hit;
    }
    // Fallback: direct country name input
    return countryIndex.get(fifa.toLowerCase()) || null;
  }

  function fifaLabel(fifa: string): string {
    return FIFA_TO_COUNTRY[fifa.toUpperCase()] || fifa;
  }

  const h = w * 0.5;

  const pins = useMemo(() => {
    const byCountry = new Map<string, { hit: CountryHit; players: Player[] }>();
    players.forEach((p) => {
      const c = resolveCountry(p.nat);
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

  const memberIso = useMemo(() => {
    const s = new Set<string>();
    pins.forEach((p) => p.hit.iso3 && s.add(p.hit.iso3));
    return s;
  }, [pins]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const ds = dragStart.current;
      const el = containerRef.current;
      if (!ds || !el) return;
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - ds.x) / rect.width / zoom.scale;
      const dy = (e.clientY - ds.y) / rect.height / zoom.scale;
      setZoom((z) => ({
        ...z,
        cx: Math.max(0, Math.min(1, ds.cx - dx)),
        cy: Math.max(0, Math.min(1, ds.cy - dy)),
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

  // Wheel-based zoom on map container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      setZoom((z) => {
        const factor = e.deltaY > 0 ? 1 / 1.18 : 1.18;
        const next = Math.max(1, Math.min(8, z.scale * factor));
        if (next === z.scale) return z;
        // Zoom toward pointer
        return {
          scale: next,
          cx: Math.max(0, Math.min(1, z.cx + (px - z.cx) * (1 - z.scale / next))),
          cy: Math.max(0, Math.min(1, z.cy + (py - z.cy) * (1 - z.scale / next))),
        };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, [team]);

  const byNat = useMemo(() => {
    const m = new Map<string, Player[]>();
    players.forEach((p) => {
      const n = p.nat || "?";
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
                  key={s.key}
                  onClick={() => pickTeam(s)}
                  className="flex items-center gap-3 w-full text-left px-3 py-2.5 hover:bg-[var(--line)] transition border-b border-[var(--line)] last:border-b-0"
                >
                  <span className="w-10 h-10 flex-shrink-0 rounded-md bg-white/90 flex items-center justify-center overflow-hidden">
                    {s.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.thumbnail}
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
                      {s.title}
                    </div>
                    <div className="text-[11px] text-[var(--muted)] line-clamp-1 mt-0.5">
                      {s.description}
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
          <div className="max-w-[1500px] mx-auto">
            {/* Team banner */}
            <div className="mb-4 flex items-center gap-4 flex-wrap">
              {team.thumbnail && (
                <span className="w-16 h-16 rounded-lg bg-white/95 flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-emerald-500/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={team.thumbnail}
                    alt=""
                    className="w-full h-full object-contain p-1"
                  />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-serif text-2xl md:text-4xl leading-tight">
                  {team.title}
                </div>
                <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[var(--muted)] mt-1.5">
                  {players.length} {locale === "tr" ? "oyuncu" : "players"}
                  {" · "}
                  {byNat.length} {locale === "tr" ? "ülke" : "countries"}
                  {manager && (
                    <>
                      {" · "}
                      {locale === "tr" ? "TD" : "Manager"}:{" "}
                      <span className="text-[var(--text-2)] normal-case tracking-normal">
                        {manager}
                      </span>
                    </>
                  )}
                  {" · "}
                  <a
                    href={`${WP}/wiki/${encodeURIComponent(team.key)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[var(--accent)]"
                  >
                    Wikipedia ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Kim nereli? — country summary chips */}
            <div className="mb-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] mb-2.5">
                {locale === "tr" ? "§ Kim nereli?" : "§ Who's from where?"}
              </div>
              <div className="flex flex-wrap gap-2">
                {byNat.map(([nat, list]) => {
                  const c = resolveCountry(nat);
                  return (
                    <div
                      key={nat}
                      className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30"
                    >
                      <span className="text-lg leading-none">
                        {flagFor(c?.iso2 || null)}
                      </span>
                      <span className="font-serif text-[13px] md:text-[14px] text-[var(--text)]">
                        {fifaLabel(nat)}
                      </span>
                      <span className="font-mono text-[10px] tabular-nums px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {list.length}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map — full width, taller */}
            <div
              ref={containerRef}
              className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#071912] via-[#0a0a0c] to-[#0e1a12] overflow-hidden relative select-none shadow-2xl"
              style={{
                height: "clamp(420px, 62vh, 720px)",
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
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#0a1b14" />
                    <stop offset="100%" stopColor="#060a08" />
                  </radialGradient>
                  <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width={w} height={h} fill="url(#oceanGrad)" />
                <g
                  style={{
                    transformOrigin: `${zoom.cx * w}px ${zoom.cy * h}px`,
                    transform: `scale(${zoom.scale})`,
                    transition: dragging ? "none" : "transform 400ms ease",
                  }}
                >
                  {features.map((f, i) => {
                    const ic3 = iso3Of(f);
                    const count = ic3
                      ? pins.find((p) => p.hit.iso3 === ic3)?.players.length || 0
                      : 0;
                    const isMember = count > 0;
                    const isHover =
                      hoveredCountry === nameOf(f) && isMember;
                    // Graduated fill based on player count
                    let fill = "rgba(255,255,255,0.04)";
                    if (isMember) {
                      const intensity = Math.min(1, 0.35 + count * 0.12);
                      fill = `rgba(52,211,153,${isHover ? Math.min(1, intensity + 0.25) : intensity})`;
                    }
                    return (
                      <path
                        key={i}
                        d={geomToPath(f.geometry, w, h)}
                        fill={fill}
                        stroke={
                          isMember
                            ? "rgba(110,231,183,0.55)"
                            : "rgba(255,255,255,0.10)"
                        }
                        strokeWidth={(isMember ? 0.6 : 0.35) / zoom.scale}
                        onMouseEnter={() => setHoveredCountry(nameOf(f))}
                        onMouseLeave={() => setHoveredCountry(null)}
                      />
                    );
                  })}
                  {pins.map((p) => {
                    const r1 = (10 + p.players.length * 1.6) / zoom.scale + 3;
                    const r2 = (5 + p.players.length * 0.8) / zoom.scale + 2.2;
                    return (
                      <g key={p.key}>
                        <circle cx={p.x} cy={p.y} r={r1 * 1.6} fill="url(#pinGlow)" />
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={r1}
                          fill="#34d399"
                          fillOpacity="0.35"
                        />
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={r2}
                          fill="#10b981"
                          stroke="#064e3b"
                          strokeWidth={1 / zoom.scale}
                        />
                        <text
                          x={p.x}
                          y={p.y + 2.2 / zoom.scale}
                          textAnchor="middle"
                          fontSize={10 / zoom.scale + 2}
                          fill="#052e1b"
                          fontWeight="800"
                          fontFamily="monospace"
                        >
                          {p.players.length}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>

              <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-10">
                <button
                  onClick={() =>
                    setZoom((z) => ({ ...z, scale: Math.min(8, z.scale * 1.5) }))
                  }
                  className="w-9 h-9 rounded-full border border-emerald-500/30 bg-black/70 backdrop-blur text-white hover:border-emerald-400 hover:bg-black/80 text-base"
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button
                  onClick={() =>
                    setZoom((z) => ({ ...z, scale: Math.max(1, z.scale / 1.5) }))
                  }
                  className="w-9 h-9 rounded-full border border-emerald-500/30 bg-black/70 backdrop-blur text-white hover:border-emerald-400 hover:bg-black/80 text-base"
                  aria-label="Zoom out"
                >
                  −
                </button>
                <button
                  onClick={() => setZoom({ scale: 1, cx: 0.5, cy: 0.5 })}
                  className="w-9 h-9 rounded-full border border-emerald-500/30 bg-black/70 backdrop-blur text-white hover:border-emerald-400 text-[11px]"
                  aria-label="Reset"
                >
                  ⟲
                </button>
              </div>
              <div className="absolute left-3 bottom-3 font-mono text-[9px] uppercase tracking-[0.22em] text-white/45 pointer-events-none">
                {locale === "tr"
                  ? "sürükle · tekerlek = zoom"
                  : "drag · wheel to zoom"}
              </div>
              {hoveredCountry && (
                <div className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300 bg-black/60 backdrop-blur px-2.5 py-1 rounded pointer-events-none">
                  {hoveredCountry}
                </div>
              )}
            </div>

            {/* Player list — grid below map */}
            <div className="mt-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] mb-3">
                {locale === "tr" ? "§ Kadro" : "§ Squad"} · {players.length}
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {players.map((p, i) => {
                  const c = resolveCountry(p.nat);
                  return (
                    <li
                      key={`${p.name}-${i}`}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-[var(--line)] bg-[var(--line)]/40 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition"
                    >
                      <span className="w-9 h-9 rounded-full bg-black/60 flex-shrink-0 flex items-center justify-center font-mono text-[12px] tabular-nums text-emerald-300 border border-emerald-500/20">
                        {p.no || "–"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] text-[var(--text)] truncate font-serif">
                            {p.name}
                          </span>
                          <span className="text-base leading-none">
                            {flagFor(c?.iso2 || null)}
                          </span>
                        </div>
                        <div className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.12em] truncate">
                          {fifaLabel(p.nat)}
                          {p.pos && ` · ${p.pos}`}
                          {p.loan && (
                            <span className="text-amber-500"> · {p.loan}</span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
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
          {locale === "tr" ? "Veri · Wikipedia" : "Data · Wikipedia"}
        </span>
      </footer>
    </div>
  );
}
