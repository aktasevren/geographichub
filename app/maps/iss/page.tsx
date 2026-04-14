"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import SiteLogo from "@/components/SiteLogo";
import { LocaleToggle } from "@/components/LocaleProvider";
import { useEffect, useRef, useState } from "react";
import * as satellite from "satellite.js";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

type ISS = {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: number;
};

const ISS_ID = 25544;
const API = `https://api.wheretheiss.at/v1/satellites/${ISS_ID}`;

// shortest-path longitude interpolation
function lerpLng(a: number, b: number, t: number) {
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  let v = a + d * t;
  if (v > 180) v -= 360;
  if (v < -180) v += 360;
  return v;
}

// Kepler orbital period (minutes) from altitude (km)
function orbitalPeriodMin(altKm: number) {
  const GM = 398600.4418; // km^3/s^2
  const r = 6371 + altKm;
  const T = 2 * Math.PI * Math.sqrt((r * r * r) / GM);
  return T / 60;
}

// approximate subsolar point + daylight at lat/lng
function daylightInfo(lat: number, lng: number, now = new Date()) {
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const day = (now.getTime() - start) / 86400000;
  const decl = 23.44 * Math.sin(((2 * Math.PI) / 365) * (day - 81));
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const subLng = -((utcHours - 12) * 15);
  const subLat = decl;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const cosAng =
    Math.sin(toRad(lat)) * Math.sin(toRad(subLat)) +
    Math.cos(toRad(lat)) * Math.cos(toRad(subLat)) * Math.cos(toRad(lng - subLng));
  const ang = (Math.acos(Math.max(-1, Math.min(1, cosAng))) * 180) / Math.PI;
  return { daylight: ang < 90, angle: ang };
}

function terminatorPoints(now = new Date()) {
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const day = (now.getTime() - start) / 86400000;
  const decl = 23.44 * Math.sin(((2 * Math.PI) / 365) * (day - 81));
  const utcHours =
    now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const subLng = -((utcHours - 12) * 15);
  const subLat = decl;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const lat1 = toRad(subLat);
  const lng1 = toRad(subLng);
  const d = Math.PI / 2; // 90° great-circle distance = terminator
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 180; i++) {
    const theta = (i / 180) * 2 * Math.PI;
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(d) +
        Math.cos(lat1) * Math.sin(d) * Math.cos(theta)
    );
    const lng2 =
      lng1 +
      Math.atan2(
        Math.sin(theta) * Math.sin(d) * Math.cos(lat1),
        Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
      );
    let lngDeg = toDeg(lng2);
    while (lngDeg > 180) lngDeg -= 360;
    while (lngDeg < -180) lngDeg += 360;
    pts.push([toDeg(lat2), lngDeg, 0.004]);
  }
  return pts;
}

function localTimeAt(lng: number, now = new Date()) {
  const utcMin = now.getUTCHours() * 60 + now.getUTCMinutes();
  const local = (utcMin + lng * 4 + 1440) % 1440;
  const h = Math.floor(local / 60);
  const m = Math.floor(local % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

type Pass = { start: Date; end: Date; maxElevation: number; maxAt: Date };

function computePasses(
  tle1: string,
  tle2: string,
  lat: number,
  lng: number,
  hours = 72
): Pass[] {
  const satrec = satellite.twoline2satrec(tle1, tle2);
  const observer = {
    latitude: (lat * Math.PI) / 180,
    longitude: (lng * Math.PI) / 180,
    height: 0,
  };
  const passes: Pass[] = [];
  const startT = Date.now();
  const endT = startT + hours * 3600 * 1000;
  const step = 20 * 1000;
  let inPass = false;
  let passStart: Date | null = null;
  let passMaxEl = 0;
  let passMaxAt: Date | null = null;
  for (let t = startT; t <= endT; t += step) {
    const d = new Date(t);
    const pv = satellite.propagate(satrec, d);
    const pos = pv?.position;
    if (!pos || typeof pos === "boolean") continue;
    const gmst = satellite.gstime(d);
    const ecf = satellite.eciToEcf(pos as any, gmst);
    const look = satellite.ecfToLookAngles(observer, ecf as any);
    const elDeg = (look.elevation * 180) / Math.PI;
    if (elDeg > 0) {
      if (!inPass) {
        inPass = true;
        passStart = d;
        passMaxEl = elDeg;
        passMaxAt = d;
      } else if (elDeg > passMaxEl) {
        passMaxEl = elDeg;
        passMaxAt = d;
      }
    } else if (inPass) {
      inPass = false;
      if (passStart && passMaxAt && passMaxEl > 10) {
        passes.push({
          start: passStart,
          end: d,
          maxElevation: passMaxEl,
          maxAt: passMaxAt,
        });
        if (passes.length >= 5) break;
      }
      passStart = null;
      passMaxEl = 0;
      passMaxAt = null;
    }
  }
  return passes;
}

// Slant range: straight-line distance from user on surface to ISS at altitude
function slantKm(
  userLat: number,
  userLng: number,
  issLat: number,
  issLng: number,
  issAltKm: number
) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  // surface distance
  const φ1 = toRad(userLat);
  const φ2 = toRad(issLat);
  const Δφ = toRad(issLat - userLat);
  const Δλ = toRad(issLng - userLng);
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const surface = R * c;
  // approximate slant range using Pythagorean with altitude
  return Math.sqrt(surface * surface + issAltKm * issAltKm);
}

function oceanByLngLat(lat: number, lng: number) {
  if (lat < -60) return "Southern Ocean";
  if (lat > 66) return "Arctic Ocean";
  if (lng > -70 && lng < 20) return lat > 0 ? "North Atlantic Ocean" : "South Atlantic Ocean";
  if (lng >= 20 && lng < 100) return lat > 0 ? "Arabian Sea / Indian Ocean" : "Indian Ocean";
  if ((lng >= 100 && lng <= 180) || (lng >= -180 && lng <= -70))
    return lat > 0 ? "North Pacific Ocean" : "South Pacific Ocean";
  return "Open Ocean";
}

export default function ISSPage() {
  const [display, setDisplay] = useState<ISS | null>(null);
  const [track, setTrack] = useState<[number, number][]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [err, setErr] = useState<string | null>(null);
  const [place, setPlace] = useState<string>("—");
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [, tick] = useState(0);
  const [tle, setTle] = useState<[string, string] | null>(null);
  const [passQuery, setPassQuery] = useState("");
  const [passLoc, setPassLoc] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [passes, setPasses] = useState<Pass[] | null>(null);
  const [passBusy, setPassBusy] = useState(false);
  const [passErr, setPassErr] = useState<string | null>(null);
  const [futurePath, setFuturePath] = useState<[number, number, number][]>([]);
  const [crew, setCrew] = useState<{ name: string; craft: string }[] | null>(null);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [terminator, setTerminator] = useState<[number, number, number][]>(
    []
  );
  const globeRef = useRef<any>(null);

  const prevRef = useRef<ISS | null>(null);
  const nextRef = useRef<ISS | null>(null);
  const prevAtRef = useRef<number>(0);
  const nextAtRef = useRef<number>(0);
  const lastGeoRef = useRef<{ lat: number; lng: number; at: number }>({
    lat: 999,
    lng: 999,
    at: 0,
  });

  useEffect(() => {
    const onResize = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight - 64 });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Update sun terminator curve every minute
  useEffect(() => {
    const compute = () => setTerminator(terminatorPoints());
    compute();
    const id = setInterval(compute, 60000);
    return () => clearInterval(id);
  }, []);

  // Fetch current crew aboard the ISS
  useEffect(() => {
    fetch("https://corsproxy.io/?url=http://api.open-notify.org/astros.json")
      .then((r) => r.json())
      .then((d) => {
        if (d?.people) {
          setCrew(
            d.people.map((p: any) => ({ name: p.name, craft: p.craft }))
          );
        }
      })
      .catch(() => setCrew(null));
  }, []);

  // Compute ~95-min forward trajectory from TLE, refresh every 60s
  useEffect(() => {
    if (!tle) return;
    const compute = () => {
      const satrec = satellite.twoline2satrec(tle[0], tle[1]);
      const pts: [number, number, number][] = [];
      const now = Date.now();
      const total = 95 * 60 * 1000;
      const step = 30 * 1000;
      for (let t = 0; t <= total; t += step) {
        const d = new Date(now + t);
        const pv = satellite.propagate(satrec, d);
        const pos = pv?.position;
        if (!pos || typeof pos === "boolean") continue;
        const gmst = satellite.gstime(d);
        const geo = satellite.eciToGeodetic(pos as any, gmst);
        const lat = (geo.latitude * 180) / Math.PI;
        const lng = (geo.longitude * 180) / Math.PI;
        pts.push([lat, lng, 0.06]);
      }
      setFuturePath(pts);
    };
    compute();
    const id = setInterval(compute, 60000);
    return () => clearInterval(id);
  }, [tle]);

  // Fetch ISS TLE once
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(
          "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE"
        );
        if (!r.ok) throw new Error();
        const text = await r.text();
        const lines = text.trim().split("\n").map((l) => l.trim());
        const t1 = lines.find((l) => l.startsWith("1 "));
        const t2 = lines.find((l) => l.startsWith("2 "));
        if (t1 && t2) setTle([t1, t2]);
      } catch {
        // silent; passes panel will show error when used
      }
    })();
  }, []);

  const runPasses = async (lat: number, lng: number, name: string) => {
    if (!tle) {
      setPassErr("Orbital data not loaded yet.");
      return;
    }
    setPassBusy(true);
    setPassErr(null);
    try {
      const result = computePasses(tle[0], tle[1], lat, lng, 96);
      setPasses(result);
      setPassLoc({ name, lat, lng });
    } catch {
      setPassErr("Could not compute passes.");
    } finally {
      setPassBusy(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setPassErr("Geolocation not available.");
      return;
    }
    setPassBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLoc({ lat: latitude, lng: longitude });
        let name = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
        try {
          const r = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude.toFixed(
              3
            )}&longitude=${longitude.toFixed(3)}&localityLanguage=en`
          );
          const d = await r.json();
          if (d.city || d.locality) name = d.city || d.locality;
          if (d.countryName) name += `, ${d.countryName}`;
        } catch {}
        runPasses(latitude, longitude, name);
      },
      () => {
        setPassBusy(false);
        setPassErr("Location permission denied.");
      },
      { timeout: 10000 }
    );
  };

  const searchCity = async (q: string) => {
    if (!q.trim()) return;
    setPassBusy(true);
    setPassErr(null);
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          q
        )}`,
        { headers: { "Accept-Language": "en" } }
      );
      const d = await r.json();
      if (!d || !d.length) {
        setPassErr("City not found.");
        setPassBusy(false);
        return;
      }
      const { lat, lon, display_name } = d[0];
      const shortName = display_name.split(",").slice(0, 2).join(",");
      runPasses(parseFloat(lat), parseFloat(lon), shortName);
    } catch {
      setPassErr("Search failed.");
      setPassBusy(false);
    }
  };

  useEffect(() => {
    let stop = false;

    const reverseGeocode = async (lat: number, lng: number) => {
      try {
        const r = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat.toFixed(
            3
          )}&longitude=${lng.toFixed(3)}&localityLanguage=en`
        );
        if (!r.ok) throw new Error();
        const d = await r.json();
        const country = d.countryName;
        const locality = d.city || d.locality || d.principalSubdivision;
        if (country) {
          setPlace(locality ? `${locality}, ${country}` : country);
        } else {
          setPlace(oceanByLngLat(lat, lng));
        }
      } catch {
        setPlace(oceanByLngLat(lat, lng));
      }
    };

    const fetchIss = async () => {
      try {
        const r = await fetch(API);
        if (!r.ok) throw new Error("api");
        const d = await r.json();
        if (stop) return;
        const point: ISS = {
          latitude: d.latitude,
          longitude: d.longitude,
          altitude: d.altitude,
          velocity: d.velocity,
          timestamp: d.timestamp,
        };
        const now = performance.now();
        prevRef.current = nextRef.current ?? point;
        nextRef.current = point;
        prevAtRef.current = nextAtRef.current || now;
        nextAtRef.current = now;
        setLastUpdate(Date.now());
        setTrack((t) => {
          const next: [number, number][] = [
            ...t,
            [point.latitude, point.longitude],
          ];
          return next.length > 120 ? next.slice(next.length - 120) : next;
        });
        setErr(null);

        // throttle reverse geocode
        const last = lastGeoRef.current;
        const moved =
          Math.abs(last.lat - point.latitude) +
            Math.abs(last.lng - point.longitude) >
          2;
        if (moved || Date.now() - last.at > 15000) {
          lastGeoRef.current = {
            lat: point.latitude,
            lng: point.longitude,
            at: Date.now(),
          };
          reverseGeocode(point.latitude, point.longitude);
        }
      } catch {
        setErr("Connection lost — retrying…");
      }
    };

    fetchIss();
    const id = setInterval(fetchIss, 3000);

    let raf = 0;
    const loop = () => {
      const prev = prevRef.current;
      const next = nextRef.current;
      if (prev && next) {
        const span = Math.max(nextAtRef.current - prevAtRef.current, 1);
        const t = Math.min((performance.now() - nextAtRef.current) / span + 1, 1.4);
        const clamp = Math.max(0, Math.min(1, t));
        setDisplay({
          latitude: prev.latitude + (next.latitude - prev.latitude) * clamp,
          longitude: lerpLng(prev.longitude, next.longitude, clamp),
          altitude: prev.altitude + (next.altitude - prev.altitude) * clamp,
          velocity: prev.velocity + (next.velocity - prev.velocity) * clamp,
          timestamp: next.timestamp,
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const clockId = setInterval(() => tick((n) => n + 1), 1000);

    return () => {
      stop = true;
      clearInterval(id);
      clearInterval(clockId);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls?.();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.25;
      controls.enableDamping = true;
    }
  }, [size.w]);

  const satData = display
    ? [{ lat: display.latitude, lng: display.longitude, alt: 0.06 }]
    : [];

  const satMarker = () => {
    const el = document.createElement("div");
    el.innerHTML = `
      <div style="position:relative;width:52px;height:52px;transform:translate(-50%,-50%);pointer-events:none;">
        <div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle, rgba(255,204,51,0.35) 0%, rgba(255,204,51,0) 65%);animation:issPulse 2.2s ease-out infinite;"></div>
        <svg viewBox="0 0 64 64" width="52" height="52" style="position:relative;filter:drop-shadow(0 0 6px rgba(255,204,51,0.7));">
          <g stroke="#ffcc33" stroke-width="1.6" fill="none" stroke-linecap="round">
            <rect x="26" y="26" width="12" height="12" rx="2" fill="#2a2a2a"/>
            <rect x="6"  y="22" width="16" height="20" fill="#1a2a4a"/>
            <rect x="42" y="22" width="16" height="20" fill="#1a2a4a"/>
            <line x1="10" y1="22" x2="10" y2="42"/>
            <line x1="14" y1="22" x2="14" y2="42"/>
            <line x1="18" y1="22" x2="18" y2="42"/>
            <line x1="46" y1="22" x2="46" y2="42"/>
            <line x1="50" y1="22" x2="50" y2="42"/>
            <line x1="54" y1="22" x2="54" y2="42"/>
            <line x1="22" y1="32" x2="26" y2="32"/>
            <line x1="38" y1="32" x2="42" y2="32"/>
            <line x1="32" y1="20" x2="32" y2="26"/>
            <circle cx="32" cy="16" r="2.4" fill="#ffcc33"/>
          </g>
        </svg>
      </div>
      <style>@keyframes issPulse{0%{transform:scale(0.7);opacity:.9}100%{transform:scale(1.8);opacity:0}}</style>
    `;
    return el;
  };

  const groundPath =
    track.length > 1 ? [track.map(([lat, lng]) => [lat, lng])] : [];

  const sun = display ? daylightInfo(display.latitude, display.longitude) : null;
  const period = display ? orbitalPeriodMin(display.altitude) : null;
  const localT = display ? localTimeAt(display.longitude) : "—";
  const secSince = Math.max(0, Math.floor((Date.now() - lastUpdate) / 1000));

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/85 to-transparent">
        <div className="flex justify-between items-center px-4 md:px-8 py-3 md:py-4">
          <SiteLogo />
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/maps/iss/how-to-spot"
              className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.22em] text-[#ffcc33]/80 hover:text-[#ffcc33]"
            >
              Spotting guide →
            </Link>
            <span className="hidden md:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              {lastUpdate ? `${secSince}s` : "…"}
            </span>
            <LocaleToggle />
          </div>
        </div>
        <div className="px-4 md:px-8 pb-3 md:pb-4">
          <h1 className="font-serif text-lg md:text-xl">
            ISS · <span className="italic text-white/60">Live</span>
          </h1>
        </div>
      </header>

      {size.w > 0 && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          atmosphereColor="#8ab4ff"
          atmosphereAltitude={0.18}
          htmlElementsData={satData}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude="alt"
          htmlElement={satMarker}
          pathsData={futurePath.length > 1 ? [futurePath] : []}
          pathPoints={(d: any) => d}
          pathPointLat={(p: any) => p[0]}
          pathPointLng={(p: any) => p[1]}
          pathPointAlt={(p: any) => p[2]}
          pathColor={() => ["rgba(255,204,51,0.85)", "rgba(255,204,51,0.05)"]}
          pathStroke={1.5}
          pathDashLength={0.05}
          pathDashGap={0.02}
          pathDashAnimateTime={8000}
          pathTransitionDuration={0}
        />
      )}

      {/* Info panel */}
      <aside className="absolute z-20 rounded-xl border border-white/10 bg-black/70 backdrop-blur-md p-4 md:p-5 text-white
        top-[112px] left-3 right-3 md:left-6 md:right-auto md:w-[320px] md:top-[112px]
        max-w-[calc(100vw-24px)] md:max-w-none">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 mb-4">
          § Live Telemetry
        </div>

        <Section title="Currently Over">
          <div className="font-serif text-xl md:text-2xl leading-tight">
            {place}
          </div>
          <div className="font-mono text-[11px] tracking-[0.1em] text-white/50 mt-1">
            {display
              ? `${display.latitude.toFixed(2)}°, ${display.longitude.toFixed(2)}°`
              : "—"}
          </div>
        </Section>

        <Divider />

        <Row
          label="Altitude"
          value={display ? `${display.altitude.toFixed(1)} km` : "—"}
          hint="above sea level"
        />
        <Row
          label="Velocity"
          value={display ? `${Math.round(display.velocity).toLocaleString()} km/h` : "—"}
          hint="≈ 7.66 km/s"
        />
        <Row
          label="Orbital period"
          value={period ? `${period.toFixed(1)} min` : "—"}
          hint="one full orbit"
        />
        <Row
          label="Local time below"
          value={localT}
          hint="solar / ground"
        />
        <Row
          label="Sunlight"
          value={sun ? (sun.daylight ? "In daylight" : "In Earth's shadow") : "—"}
          hint={sun ? `sun angle ${sun.angle.toFixed(0)}°` : ""}
          accent={sun?.daylight ? "#ffcc33" : "#8ab4ff"}
        />
        {userLoc && display && (
          <Row
            label="Distance from you"
            value={`${Math.round(
              slantKm(
                userLoc.lat,
                userLoc.lng,
                display.latitude,
                display.longitude,
                display.altitude
              )
            ).toLocaleString()} km`}
            hint="straight line to the station"
            accent="#8ab4ff"
          />
        )}

        {crew && crew.length > 0 && (
          <div className="mt-5">
            <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/40 mb-2">
              On board right now · {crew.filter((p) => p.craft === "ISS").length}
            </div>
            <ul className="space-y-1">
              {crew
                .filter((p) => p.craft === "ISS")
                .map((p) => (
                  <li
                    key={p.name}
                    className="text-[13px] text-white/85 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffcc33]" />
                    {p.name}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {err && (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-red-400/80">
            {err}
          </p>
        )}
      </aside>

      {/* Passes over your location */}
      <aside className="absolute z-20 rounded-xl border border-white/10 bg-black/75 backdrop-blur-md p-4 md:p-5 text-white
        bottom-3 left-3 right-3 md:bottom-auto md:top-[112px] md:right-6 md:left-auto md:w-[340px]
        max-h-[55vh] md:max-h-[calc(100vh-130px)] overflow-y-auto">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 mb-3">
          § Passes Over You
        </div>
        <p className="text-[12px] text-white/60 leading-relaxed mb-4">
          When will the ISS fly over your area next? We compute upcoming visible passes (≥ 10° above horizon) from live orbital data.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={useMyLocation}
            disabled={passBusy || !tle}
            className="w-full px-3 py-2 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 font-mono text-[10px] uppercase tracking-[0.2em] transition disabled:opacity-40"
          >
            {passBusy ? "Working…" : "Use my location"}
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              searchCity(passQuery);
            }}
            className="flex gap-2"
          >
            <input
              value={passQuery}
              onChange={(e) => setPassQuery(e.target.value)}
              placeholder="or type a city"
              className="flex-1 px-3 py-2 rounded-md border border-white/15 bg-white/5 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-[#ffcc33]"
            />
            <button
              type="submit"
              disabled={passBusy || !tle}
              className="px-3 py-2 rounded-md border border-[#ffcc33]/40 bg-[#ffcc33]/10 hover:bg-[#ffcc33]/20 text-[#ffcc33] font-mono text-[10px] uppercase tracking-[0.15em] disabled:opacity-40"
            >
              Go
            </button>
          </form>
        </div>

        {passErr && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-red-400/80">
            {passErr}
          </p>
        )}

        {!tle && (
          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
            Loading orbital data…
          </p>
        )}

        {passes && passLoc && (
          <div className="mt-5">
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40 mb-2">
              Next passes over
            </div>
            <div className="font-serif text-[15px] leading-tight mb-3">
              {passLoc.name}
            </div>
            {passes.length === 0 ? (
              <p className="text-[12px] text-white/50">
                No visible passes in the next 96 hours.
              </p>
            ) : (
              <ul className="space-y-2 max-h-[260px] overflow-auto pr-1">
                {passes.map((p, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-start gap-3 py-2 border-b border-white/5 last:border-b-0"
                  >
                    <div>
                      <div className="font-sans text-[13px] text-white">
                        {p.start.toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="font-mono text-[11px] text-white/60">
                        {p.start.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        →{" "}
                        {p.end.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
                        Max alt
                      </div>
                      <div
                        className="font-sans text-[14px]"
                        style={{
                          color:
                            p.maxElevation > 60
                              ? "#ffcc33"
                              : p.maxElevation > 30
                              ? "#fff"
                              : "#8ab4ff",
                        }}
                      >
                        {p.maxElevation.toFixed(0)}°
                      </div>
                      <div className="font-mono text-[9px] text-white/40">
                        {Math.round((p.end.getTime() - p.start.getTime()) / 60000)} min
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </aside>

      <div className="absolute bottom-3 left-0 right-0 z-10 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-white/35">
        Data · Where The ISS At? · CelesTrak TLE · Nominatim · BigDataCloud
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/40 mb-1.5">
        {title}
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-white/10 my-4" />;
}

function Row({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="flex justify-between items-baseline gap-3 py-2 border-b border-white/5 last:border-b-0">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
          {label}
        </div>
        {hint && (
          <div className="font-mono text-[9px] tracking-[0.1em] text-white/30 mt-0.5">
            {hint}
          </div>
        )}
      </div>
      <div
        className="font-sans text-[15px] tracking-[0.02em] text-right"
        style={{ color: accent || "#fff" }}
      >
        {value}
      </div>
    </div>
  );
}
