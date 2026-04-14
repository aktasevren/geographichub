"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import SiteLogo from "@/components/SiteLogo";
import { useEffect, useMemo, useRef, useState } from "react";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

type Spawn = {
  lat: number;
  lng: number;
  country: string | null; // null => ocean
  label: string;
};

const HEADING_DEG = 90; // due east — equator circumnavigation
const HOP_KM = 1500;
const EARTH_CIRC_KM = 40075;
const MAX_WRONG = 3;
const COUNTRIES_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

const HINT_COST = { continent: 2, letter: 1, hemisphere: 1 };

function buildMask(target: string): boolean[] {
  // true = revealed; false = hidden. Non-letters always revealed.
  const out: boolean[] = target.split("").map((ch) => !/[a-zA-ZÀ-ÿ]/.test(ch));
  // reveal one random letter index
  const hiddenIdx: number[] = [];
  for (let i = 0; i < out.length; i++) if (!out[i]) hiddenIdx.push(i);
  if (hiddenIdx.length > 0) {
    const pick = hiddenIdx[Math.floor(Math.random() * hiddenIdx.length)];
    out[pick] = true;
  }
  return out;
}

function renderMask(target: string, mask: boolean[]): string {
  return target
    .split("")
    .map((ch, i) => (mask[i] ? ch : /[a-zA-ZÀ-ÿ]/.test(ch) ? "_" : ch))
    .join(" ");
}

// great-circle destination given start, bearing, distance (km)
function advance(lat: number, lng: number, bearing: number, distanceKm: number) {
  const R = 6371;
  const brng = (bearing * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;
  const d = distanceKm / R;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );
  let lngDeg = (lng2 * 180) / Math.PI;
  while (lngDeg > 180) lngDeg -= 360;
  while (lngDeg < -180) lngDeg += 360;
  return { lat: (lat2 * 180) / Math.PI, lng: lngDeg };
}

async function geocode(lat: number, lng: number): Promise<Spawn> {
  try {
    const r = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat.toFixed(
        3
      )}&longitude=${lng.toFixed(3)}&localityLanguage=en`
    );
    const d = await r.json();
    if (d?.countryName) {
      return {
        lat,
        lng,
        country: d.countryName,
        label: d.city || d.locality || d.countryName,
      };
    }
    return { lat, lng, country: null, label: oceanNameFor(lat, lng) };
  } catch {
    return { lat, lng, country: null, label: "Somewhere" };
  }
}

// Named seas (small regional bodies) — checked before open oceans
const SEAS: { name: string; latMin: number; latMax: number; lngMin: number; lngMax: number }[] = [
  { name: "Mediterranean Sea", latMin: 30, latMax: 46, lngMin: -5, lngMax: 36 },
  { name: "Black Sea",         latMin: 41, latMax: 47, lngMin: 27, lngMax: 42 },
  { name: "Caspian Sea",       latMin: 36, latMax: 47, lngMin: 46, lngMax: 55 },
  { name: "Red Sea",           latMin: 12, latMax: 30, lngMin: 32, lngMax: 44 },
  { name: "Persian Gulf",      latMin: 24, latMax: 30, lngMin: 48, lngMax: 57 },
  { name: "Arabian Sea",       latMin: 8,  latMax: 25, lngMin: 55, lngMax: 75 },
  { name: "Bay of Bengal",     latMin: 5,  latMax: 22, lngMin: 80, lngMax: 95 },
  { name: "South China Sea",   latMin: 0,  latMax: 25, lngMin: 105, lngMax: 121 },
  { name: "East China Sea",    latMin: 25, latMax: 34, lngMin: 122, lngMax: 131 },
  { name: "Sea of Japan",      latMin: 34, latMax: 52, lngMin: 128, lngMax: 142 },
  { name: "Philippine Sea",    latMin: 5,  latMax: 26, lngMin: 125, lngMax: 145 },
  { name: "Coral Sea",         latMin: -30, latMax: -8, lngMin: 142, lngMax: 165 },
  { name: "Tasman Sea",        latMin: -46, latMax: -30, lngMin: 150, lngMax: 170 },
  { name: "Baltic Sea",        latMin: 54, latMax: 66, lngMin: 10, lngMax: 30 },
  { name: "North Sea",         latMin: 51, latMax: 61, lngMin: -4, lngMax: 9 },
  { name: "Norwegian Sea",     latMin: 62, latMax: 75, lngMin: -10, lngMax: 20 },
  { name: "Bering Sea",        latMin: 52, latMax: 66, lngMin: 160, lngMax: 180 },
  { name: "Gulf of Mexico",    latMin: 18, latMax: 31, lngMin: -98, lngMax: -80 },
  { name: "Caribbean Sea",     latMin: 9,  latMax: 22, lngMin: -88, lngMax: -60 },
  { name: "Hudson Bay",        latMin: 51, latMax: 63, lngMin: -95, lngMax: -75 },
];

function oceanNameFor(lat: number, lng: number) {
  for (const s of SEAS) {
    if (lat >= s.latMin && lat <= s.latMax && lng >= s.lngMin && lng <= s.lngMax)
      return s.name;
  }
  if (lat < -60) return "Southern Ocean";
  if (lat > 66) return "Arctic Ocean";
  if (lng > -70 && lng < 20) return lat > 0 ? "North Atlantic Ocean" : "South Atlantic Ocean";
  if (lng >= 20 && lng < 100) return lat > 0 ? "Arabian Sea / Indian Ocean" : "Indian Ocean";
  if ((lng >= 100 && lng <= 180) || (lng >= -180 && lng <= -70))
    return lat > 0 ? "North Pacific Ocean" : "South Pacific Ocean";
  return "Open Ocean";
}

function continentFor(lat: number, lng: number): string {
  // coarse continental bounds
  if (lat > 10 && lng > -170 && lng < -50) return "North America";
  if (lat <= 12 && lat > -56 && lng > -82 && lng < -34) return "South America";
  if (lat > 35 && lng > -10 && lng < 60) return "Europe";
  if (lat > -35 && lat <= 35 && lng > -20 && lng < 55) return "Africa";
  if (lat > 0 && lng >= 55 && lng < 180) return "Asia";
  if (lat < 0 && lng > 100 && lng < 180) return "Oceania";
  if (lat < -60) return "Antarctica";
  return "Open waters";
}

function randomLatLng(): { lat: number; lng: number } {
  // uniform on sphere
  const u = Math.random();
  const v = Math.random();
  const lat = Math.asin(2 * u - 1) * (180 / Math.PI);
  const lng = v * 360 - 180;
  return { lat, lng };
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

const COUNTRY_ALIASES: Record<string, string[]> = {
  "united states": ["usa", "us", "america", "united states of america"],
  "united kingdom": ["uk", "great britain", "britain", "england"],
  "south korea": ["korea"],
  "north korea": ["korea"],
  "czech republic": ["czechia"],
  "myanmar": ["burma"],
  "türkiye": ["turkey"],
  "turkey": ["türkiye", "turkiye"],
};

function matchGuess(guess: string, target: string, isOcean: boolean): boolean {
  const g = normalize(guess);
  if (!g) return false;
  const t = normalize(target);
  if (isOcean) {
    // Need to match the specific ocean/sea — generic "ocean" or "sea" not enough
    // Strip generic suffixes so "atlantic" matches "north atlantic ocean"
    const tStripped = t
      .replace(/\b(north|south|east|west)\b/g, "")
      .replace(/\b(ocean|sea|bay|gulf)\b/g, "")
      .trim();
    const gStripped = g
      .replace(/\b(north|south|east|west)\b/g, "")
      .replace(/\b(ocean|sea|bay|gulf)\b/g, "")
      .trim();
    if (!gStripped || gStripped.length < 3) return false;
    return (
      t.includes(g) ||
      g.includes(tStripped) ||
      tStripped.includes(gStripped) ||
      gStripped === tStripped
    );
  }
  if (g === t) return true;
  if (t.includes(g) && g.length > 3) return true;
  if (g.includes(t)) return true;
  const aliases = COUNTRY_ALIASES[t] || [];
  if (aliases.some((a) => normalize(a) === g)) return true;
  for (const [k, v] of Object.entries(COUNTRY_ALIASES)) {
    if (normalize(k) === t && v.some((a) => normalize(a) === g)) return true;
  }
  return false;
}

export default function PilotGame() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [spawn, setSpawn] = useState<Spawn | null>(null);
  const [trail, setTrail] = useState<{ lat: number; lng: number }[]>([]);
  const [guess, setGuess] = useState("");
  const [status, setStatus] = useState<"playing" | "correct" | "wrong" | "lost" | "won">("playing");
  const [wrong, setWrong] = useState(0);
  const [score, setScore] = useState(0);
  const [hops, setHops] = useState(0);
  const [kmTravelled, setKmTravelled] = useState(0);
  const [startPos, setStartPos] = useState<{ lat: number; lng: number } | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [hints, setHints] = useState<string[]>([]);
  const [mask, setMask] = useState<boolean[]>([]);
  const globeRef = useRef<any>(null);

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

  const newGame = async () => {
    const p = randomLatLng();
    const s = await geocode(p.lat, p.lng);
    setSpawn(s);
    setTrail([p]);
    setStartPos(p);
    setGuess("");
    setStatus("playing");
    setWrong(0);
    setScore(0);
    setHops(0);
    setKmTravelled(0);
    setRevealing(false);
    setHints([]);
    const target = s.country || s.label;
    setMask(buildMask(target));
  };

  const buyHint = (kind: "continent" | "letter" | "hemisphere") => {
    if (!spawn || revealing) return;
    const cost = HINT_COST[kind];
    if (score < cost) return;
    const target = spawn.country || spawn.label;
    if (kind === "letter") {
      // reveal one additional random hidden letter in the mask
      const hidden: number[] = [];
      for (let i = 0; i < mask.length; i++)
        if (!mask[i] && /[a-zA-ZÀ-ÿ]/.test(target[i])) hidden.push(i);
      if (hidden.length === 0) return;
      const pick = hidden[Math.floor(Math.random() * hidden.length)];
      setMask((m) => {
        const next = [...m];
        next[pick] = true;
        return next;
      });
      setScore((s) => s - cost);
      return;
    }
    setScore((s) => s - cost);
    let hint = "";
    if (kind === "continent") {
      hint = `Continent / region · ${continentFor(spawn.lat, spawn.lng)}`;
    } else {
      hint = `Hemisphere · ${spawn.lat >= 0 ? "Northern" : "Southern"}, ${
        spawn.lng >= 0 ? "Eastern" : "Western"
      }`;
    }
    setHints((h) => (h.includes(hint) ? h : [...h, hint]));
  };

  useEffect(() => {
    newGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!globeRef.current || !spawn) return;
    globeRef.current.pointOfView(
      { lat: spawn.lat, lng: spawn.lng, altitude: 1.8 },
      900
    );
  }, [spawn]);

  const submitGuess = async () => {
    if (!spawn || status !== "playing") return;
    const target = spawn.country || spawn.label; // label carries ocean/sea when country is null
    const ok = matchGuess(guess, target, !spawn.country);
    if (ok) {
      setStatus("correct");
      setScore((s) => s + 10);
      setRevealing(true);
      // advance after a beat
      setTimeout(async () => {
        const next = advance(spawn.lat, spawn.lng, HEADING_DEG, HOP_KM);
        const newKm = kmTravelled + HOP_KM;
        setKmTravelled(newKm);
        setHops((h) => h + 1);
        setTrail((t) => [...t, next]);
        if (newKm >= EARTH_CIRC_KM) {
          setStatus("won");
          return;
        }
        const s = await geocode(next.lat, next.lng);
        setSpawn(s);
        setGuess("");
        setStatus("playing");
        setRevealing(false);
        setHints([]);
        setMask(buildMask(s.country || s.label));
      }, 1500);
    } else {
      const nextWrong = wrong + 1;
      setWrong(nextWrong);
      if (nextWrong >= MAX_WRONG) {
        setStatus("lost");
        setRevealing(true);
      } else {
        setStatus("wrong");
        setTimeout(() => setStatus("playing"), 900);
      }
    }
  };

  const progressPct = Math.min(100, (kmTravelled / EARTH_CIRC_KM) * 100);

  const marker =
    spawn && [
      {
        lat: spawn.lat,
        lng: spawn.lng,
        alt: 0.04,
      },
    ];

  const pathsData = useMemo(() => {
    const out: any[] = [];
    // Travelled trail
    if (trail.length > 1) {
      out.push({
        _kind: "trail",
        points: trail.map((p) => [p.lat, p.lng, 0.01]),
      });
    }
    // Forward ghost: where the plane WILL go if correct
    if (spawn) {
      const segs: [number, number, number][] = [];
      const steps = 30;
      for (let i = 0; i <= steps; i++) {
        const d = (HOP_KM * i) / steps;
        const q = advance(spawn.lat, spawn.lng, HEADING_DEG, d);
        segs.push([q.lat, q.lng, 0.012]);
      }
      out.push({ _kind: "forward", points: segs });
    }
    return out;
  }, [trail, spawn]);

  const planeHtml = () => {
    const el = document.createElement("div");
    el.innerHTML = `
      <div style="position:relative;width:40px;height:40px;transform:translate(-50%,-50%);pointer-events:none;">
        <div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle, rgba(34,197,94,0.35) 0%, rgba(34,197,94,0) 65%);animation:planePulse 1.4s ease-out infinite;"></div>
        <svg viewBox="0 0 32 32" width="40" height="40" style="position:relative;filter:drop-shadow(0 0 6px rgba(34,197,94,0.8))">
          <g transform="rotate(90 16 16)" fill="#22c55e">
            <path d="M16 3 L19 13 L28 15 L28 17 L19 19 L17 27 L15 27 L13 19 L4 17 L4 15 L13 13 Z" stroke="#0a5e2d" stroke-width="0.6" stroke-linejoin="round"/>
          </g>
        </svg>
      </div>
      <style>@keyframes planePulse{0%{transform:scale(0.6);opacity:.9}100%{transform:scale(1.9);opacity:0}}</style>
    `;
    return el;
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center px-5 md:px-8 py-4 bg-gradient-to-b from-black/85 to-transparent">
        <SiteLogo />
        <h1 className="hidden md:block font-serif text-lg md:text-xl">
          Pilot Game · <span className="italic text-white/60">guess where you are</span>
        </h1>
        <span className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
          Circle the Earth
        </span>
      </header>

      {size.w > 0 && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="#0a1a2e"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
          atmosphereColor="#8ab4ff"
          atmosphereAltitude={0.18}
          polygonsData={countries}
          polygonCapColor={() => "rgba(255,255,255,0.02)"}
          polygonSideColor={() => "rgba(0,0,0,0.3)"}
          polygonStrokeColor={() => "rgba(255,255,255,0.5)"}
          polygonAltitude={0.006}
          htmlElementsData={marker || []}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude="alt"
          htmlElement={planeHtml}
          pathsData={pathsData}
          pathPoints={(d: any) => d.points}
          pathPointLat={(p: any) => p[0]}
          pathPointLng={(p: any) => p[1]}
          pathPointAlt={(p: any) => p[2]}
          pathColor={(d: any) =>
            d._kind === "forward"
              ? ["rgba(255,204,51,0.9)", "rgba(255,204,51,0.2)"]
              : ["rgba(34,197,94,0.9)", "rgba(34,197,94,0.25)"]
          }
          pathStroke={(d: any) => (d._kind === "forward" ? 1.2 : 1.6)}
          pathDashLength={(d: any) => (d._kind === "forward" ? 0.04 : 0.03)}
          pathDashGap={(d: any) => (d._kind === "forward" ? 0.02 : 0.02)}
          pathDashAnimateTime={(d: any) =>
            d._kind === "forward" ? 2000 : 4000
          }
        />
      )}

      {/* Top-right HUD */}
      <aside className="absolute top-[70px] right-4 md:right-6 z-20 w-[280px] rounded-2xl border border-white/15 bg-black/65 backdrop-blur-md p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 mb-3">
          § Progress
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-serif text-4xl text-emerald-400 tabular-nums">
            {progressPct.toFixed(0)}%
          </span>
          <span className="text-[12px] font-mono uppercase tracking-[0.18em] text-white/60">
            of Earth
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-4">
          <div
            className="h-full bg-emerald-400 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-[0.18em]">
          <HudStat label="Score" value={score.toString()} accent="#22c55e" />
          <HudStat label="Hops" value={hops.toString()} />
          <HudStat label="Wrong" value={`${wrong}/${MAX_WRONG}`} accent="#f87171" />
        </div>
        <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
          {kmTravelled.toLocaleString()} / {EARTH_CIRC_KM.toLocaleString()} km
        </div>
      </aside>

      {/* Bottom guess panel */}
      <div className="absolute left-0 right-0 bottom-0 z-20 px-4 md:px-8 pb-5 pt-10 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="max-w-[700px] mx-auto">
          <div className="rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md p-5">
            {status === "won" && (
              <div className="text-center">
                <div className="font-serif text-3xl md:text-4xl text-emerald-400 mb-2">
                  🎉 You circled the Earth
                </div>
                <div className="text-white/70 mb-4">
                  Score {score} · {hops} hops · {wrong} mistakes
                </div>
                <button
                  onClick={newGame}
                  className="px-6 py-2.5 rounded-full bg-emerald-400 text-black font-mono text-[11px] uppercase tracking-[0.22em]"
                >
                  Play again
                </button>
              </div>
            )}

            {status === "lost" && (
              <div className="text-center">
                <div className="font-serif text-3xl text-red-400 mb-1">
                  Out of attempts
                </div>
                <div className="text-white/70 mb-4">
                  You were over{" "}
                  <span className="text-white font-semibold">
                    {spawn?.country || spawn?.label}
                  </span>
                  . Score {score} · {hops} correct hops
                </div>
                <button
                  onClick={newGame}
                  className="px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[11px] uppercase tracking-[0.22em]"
                >
                  New game
                </button>
              </div>
            )}

            {(status === "playing" || status === "wrong" || status === "correct") && spawn && (
              <>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 mb-2">
                  § Where are you, pilot?
                </div>
                <div className="text-[15px] text-white/85 mb-3 leading-relaxed">
                  You're flying due east at {spawn.lat.toFixed(1)}°,{" "}
                  {spawn.lng.toFixed(1)}°.
                  {!spawn.country && !revealing && (
                    <span className="text-white/50 italic"> (you're over water — which sea?)</span>
                  )}
                  {revealing && status === "correct" && (
                    <span className="text-emerald-400 font-semibold">
                      {" "}
                      ✓ {spawn.label}!
                    </span>
                  )}
                </div>

                {/* Masked answer — hangman-style */}
                {mask.length > 0 && (
                  <div className="mb-3 p-3 rounded-md bg-white/5 border border-white/15">
                    <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40 mb-2">
                      Answer · {(spawn.country || spawn.label).replace(/[^a-zA-ZÀ-ÿ]/g, "").length} letters
                    </div>
                    <div className="font-mono text-[17px] md:text-[19px] tracking-[0.2em] text-white leading-tight break-words">
                      {renderMask(spawn.country || spawn.label, mask)}
                    </div>
                  </div>
                )}

                {hints.length > 0 && (
                  <ul className="mb-3 space-y-1">
                    {hints.map((h, i) => (
                      <li
                        key={i}
                        className="font-mono text-[11px] text-[#ffcc33] border-l-2 border-[#ffcc33]/60 pl-2"
                      >
                        💡 {h}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <HintBtn
                    label="Continent"
                    cost={HINT_COST.continent}
                    disabled={score < HINT_COST.continent || revealing}
                    onClick={() => buyHint("continent")}
                  />
                  <HintBtn
                    label="Reveal letter"
                    cost={HINT_COST.letter}
                    disabled={score < HINT_COST.letter || revealing}
                    onClick={() => buyHint("letter")}
                  />
                  <HintBtn
                    label="Hemisphere"
                    cost={HINT_COST.hemisphere}
                    disabled={score < HINT_COST.hemisphere || revealing}
                    onClick={() => buyHint("hemisphere")}
                  />
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitGuess();
                  }}
                  className="flex gap-2"
                >
                  <input
                    autoFocus
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Country name — or 'ocean' if you're over water"
                    className="flex-1 px-4 py-2.5 rounded-md border border-white/20 bg-white/5 text-[15px] text-white placeholder-white/35 focus:outline-none focus:border-emerald-400"
                    disabled={revealing}
                  />
                  <button
                    type="submit"
                    disabled={revealing || !guess.trim()}
                    className="px-5 py-2.5 rounded-md bg-emerald-400 hover:bg-emerald-300 text-black font-mono text-[11px] uppercase tracking-[0.22em] disabled:opacity-40"
                  >
                    Fly
                  </button>
                </form>
                {status === "wrong" && (
                  <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-red-400">
                    ✕ Not quite. {MAX_WRONG - wrong} attempt{MAX_WRONG - wrong === 1 ? "" : "s"} left.
                  </div>
                )}
                {status === "correct" && (
                  <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400">
                    ✓ Moving {HOP_KM} km east…
                  </div>
                )}
              </>
            )}
          </div>
          <div className="text-center mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
            Data · BigDataCloud · Natural Earth · NASA Blue Marble
          </div>
        </div>
      </div>
    </div>
  );
}

function HintBtn({
  label,
  cost,
  disabled,
  onClick,
}: {
  label: string;
  cost: number;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="px-2.5 py-1 rounded-full border border-[#ffcc33]/30 bg-[#ffcc33]/10 text-[#ffcc33] font-mono text-[10px] uppercase tracking-[0.18em] hover:bg-[#ffcc33]/20 disabled:opacity-30 disabled:cursor-not-allowed"
    >
      💡 {label} <span className="opacity-60">−{cost}</span>
    </button>
  );
}

function HudStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-white/40">{label}</span>
      <span
        className="normal-case font-sans text-base tabular-nums"
        style={{ color: accent || "#fff" }}
      >
        {value}
      </span>
    </div>
  );
}
