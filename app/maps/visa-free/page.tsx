"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import SiteLogo from "@/components/SiteLogo";
import { useEffect, useMemo, useRef, useState } from "react";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const COUNTRIES_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

type StatusKind =
  | "same"
  | "visa-free"
  | "visa-on-arrival"
  | "e-visa"
  | "eta"
  | "visa-required"
  | "no-admission"
  | "unknown";

type Status =
  | { kind: Exclude<StatusKind, "visa-free"> }
  | { kind: "visa-free"; days?: number };

function parseCell(raw: string): Status {
  const v = raw.trim();
  if (v === "-1" || v === "") return { kind: "same" };
  if (/^\d+$/.test(v)) return { kind: "visa-free", days: parseInt(v, 10) };
  const lower = v.toLowerCase();
  if (lower.startsWith("visa free")) return { kind: "visa-free" };
  if (lower === "visa on arrival") return { kind: "visa-on-arrival" };
  if (lower === "e-visa") return { kind: "e-visa" };
  if (lower === "eta") return { kind: "eta" };
  if (lower === "visa required") return { kind: "visa-required" };
  if (lower === "no admission") return { kind: "no-admission" };
  return { kind: "unknown" };
}

const STATUS: Record<
  StatusKind,
  { color: string; label: string; icon: string; oneLiner: string }
> = {
  "same": {
    color: "#ffffff",
    label: "Your country",
    icon: "◉",
    oneLiner: "Your passport country",
  },
  "visa-free": {
    color: "#16a34a",
    label: "Visa-free",
    icon: "✓",
    oneLiner: "Just your passport — no paperwork",
  },
  "visa-on-arrival": {
    color: "#eab308",
    label: "Visa on arrival",
    icon: "✈",
    oneLiner: "Buy your visa at the airport / border",
  },
  "e-visa": {
    color: "#06b6d4",
    label: "eVisa",
    icon: "⌨",
    oneLiner: "Apply online before you travel",
  },
  "eta": {
    color: "#8b5cf6",
    label: "ETA",
    icon: "⊙",
    oneLiner: "Quick online pre-approval",
  },
  "visa-required": {
    color: "#f97316",
    label: "Visa required",
    icon: "✉",
    oneLiner: "Apply at the embassy before travel",
  },
  "no-admission": {
    color: "#dc2626",
    label: "No admission",
    icon: "✕",
    oneLiner: "Entry not permitted for this passport",
  },
  "unknown": {
    color: "rgba(255,255,255,0.1)",
    label: "No data",
    icon: "?",
    oneLiner: "Verify with the destination's embassy",
  },
};

function colorFor(s: Status): string {
  if (s.kind === "visa-free" && s.days !== undefined) {
    if (s.days >= 180) return "#166534";
    if (s.days >= 60) return "#16a34a";
    return "#4ade80";
  }
  return STATUS[s.kind].color;
}

function iso3(feat: any): string | null {
  const p = feat?.properties || {};
  return p.ADM0_A3 || p.ISO_A3 || p.ISO_A3_EH || p.SOV_A3 || null;
}

function countryName(feat: any): string {
  const p = feat?.properties || {};
  return p.NAME || p.ADMIN || p.NAME_LONG || "—";
}

export default function VisaFreePage() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [features, setFeatures] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Record<string, Status>>>({});
  const [passport, setPassport] = useState<string>("TUR");
  const [search, setSearch] = useState("");
  const [clicked, setClicked] = useState<any>(null);
  const [hovered, setHovered] = useState<any>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const globeRef = useRef<any>(null);

  useEffect(() => {
    fetch(COUNTRIES_URL)
      .then((r) => r.json())
      .then((d) => setFeatures(d.features || []))
      .catch(() => {});

    fetch("/data/visa-matrix.csv")
      .then((r) => r.text())
      .then((text) => {
        const lines = text.trim().split("\n");
        const header = lines[0].split(",");
        const dests = header.slice(1);
        const mat: Record<string, Record<string, Status>> = {};
        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split(",");
          const pass = cells[0];
          const row: Record<string, Status> = {};
          for (let j = 0; j < dests.length; j++) {
            row[dests[j]] = parseCell(cells[j + 1] ?? "");
          }
          mat[pass] = row;
        }
        setMatrix(mat);
      });

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
      c.autoRotateSpeed = 0.18;
      c.enableDamping = true;
    }
  }, [size.w, features.length]);

  const codeToName = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of features) {
      const code = iso3(f);
      if (code) m.set(code, countryName(f));
    }
    return m;
  }, [features]);

  const passportOptions = useMemo(() => {
    const list = Object.keys(matrix)
      .map((code) => ({ code, name: codeToName.get(code) || code }))
      .sort((a, b) => a.name.localeCompare(b.name));
    if (!search.trim()) return list;
    const s = search.toLowerCase();
    return list.filter(
      (o) => o.name.toLowerCase().includes(s) || o.code.toLowerCase().includes(s)
    );
  }, [matrix, codeToName, search]);

  const row = matrix[passport];

  const totals = useMemo(() => {
    if (!row)
      return { "visa-free": 0, "visa-on-arrival": 0, "e-visa": 0, "eta": 0, "visa-required": 0, "no-admission": 0, "unknown": 0, "same": 0 } as Record<StatusKind, number>;
    const counts: Record<StatusKind, number> = {
      "same": 0,
      "visa-free": 0,
      "visa-on-arrival": 0,
      "e-visa": 0,
      "eta": 0,
      "visa-required": 0,
      "no-admission": 0,
      "unknown": 0,
    };
    for (const code of Object.keys(row)) counts[row[code].kind]++;
    return counts;
  }, [row]);

  const freeTotal =
    (totals["visa-free"] || 0) +
    (totals["visa-on-arrival"] || 0) +
    (totals["e-visa"] || 0) +
    (totals["eta"] || 0);

  const polygonColor = (feat: any) => {
    const code = iso3(feat);
    if (!code) return STATUS.unknown.color;
    if (code === passport) return "#ffffff";
    const s = row?.[code];
    if (!s) return STATUS.unknown.color;
    return colorFor(s);
  };

  const polygonLabel = (feat: any) => {
    const code = iso3(feat);
    const cn = countryName(feat);
    if (!code || code === passport) {
      return `<div style="background:rgba(0,0,0,0.92);color:#fff;padding:10px 14px;border-radius:8px;font-size:13px;font-family:ui-sans-serif;"><b>${cn}</b><br/><span style="color:#ffffff80">Your passport country</span></div>`;
    }
    const s = row?.[code];
    if (!s) {
      return `<div style="background:rgba(0,0,0,0.92);color:#fff;padding:10px 14px;border-radius:8px;font-size:13px;font-family:ui-sans-serif;"><b>${cn}</b><br/><span style="color:#ffffff80">No data</span></div>`;
    }
    const meta = STATUS[s.kind];
    const days = s.kind === "visa-free" && s.days ? `<div style="font-size:12px;color:#ffffffcc;margin-top:4px">Up to ${s.days} days</div>` : "";
    return `<div style="background:rgba(0,0,0,0.94);color:#fff;padding:12px 16px;border-radius:10px;font-size:13px;font-family:ui-sans-serif;border-left:3px solid ${colorFor(s)};min-width:200px">
      <div style="font-weight:600;font-size:15px">${cn}</div>
      <div style="margin-top:6px;display:flex;align-items:center;gap:8px">
        <span style="color:${colorFor(s)};font-size:18px">${meta.icon}</span>
        <span style="color:${colorFor(s)};font-weight:600">${meta.label}</span>
      </div>
      <div style="margin-top:4px;color:#ffffff90;font-size:12px;line-height:1.3">${meta.oneLiner}</div>
      ${days}
    </div>`;
  };

  const clickedInfo = useMemo(() => {
    if (!clicked || !row) return null;
    const code = iso3(clicked);
    if (!code) return null;
    return {
      code,
      name: countryName(clicked),
      status: row[code] || ({ kind: "unknown" } as Status),
    };
  }, [clicked, row]);

  const passportName = codeToName.get(passport) || passport;
  const hasClicked = !!clickedInfo;

  const LEGEND_ORDER: StatusKind[] = [
    "visa-free",
    "visa-on-arrival",
    "e-visa",
    "eta",
    "visa-required",
    "no-admission",
  ];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center px-5 md:px-8 py-4 bg-gradient-to-b from-black/80 to-transparent">
        <SiteLogo />
        <h1 className="hidden md:block font-serif text-lg md:text-xl">
          Visa-Free Atlas
        </h1>
        <Link
          href="/maps/visa-free/ranking"
          className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300/80 hover:text-emerald-300"
        >
          Passport ranking →
        </Link>
      </header>

      {/* Globe */}
      {size.w > 0 && features.length > 0 && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="#061410"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          atmosphereColor="#8ab4ff"
          atmosphereAltitude={0.15}
          polygonsData={features}
          polygonCapColor={polygonColor as any}
          polygonSideColor={() => "rgba(15,15,15,0.9)"}
          polygonStrokeColor={() => "rgba(255,255,255,0.15)"}
          polygonAltitude={(d: any) => (d === hovered || d === clicked ? 0.02 : 0.007)}
          polygonLabel={polygonLabel as any}
          polygonsTransitionDuration={300}
          onPolygonHover={setHovered as any}
          onPolygonClick={(d: any) => setClicked(d)}
        />
      )}

      {/* TOP-LEFT: HERO stat card with passport picker */}
      <aside className="absolute top-[72px] left-4 md:left-6 z-20 w-[320px] md:w-[360px] rounded-2xl border border-white/15 bg-black/65 backdrop-blur-md overflow-hidden shadow-2xl">
        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="w-full text-left p-5 hover:bg-white/5 transition"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 mb-1">
            § Your passport
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-serif text-[22px] md:text-2xl leading-tight">
              {passportName}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
              {pickerOpen ? "close ▴" : "change ▾"}
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-2">
            <span className="font-serif text-5xl md:text-6xl leading-none text-emerald-400 tabular-nums">
              {freeTotal}
            </span>
            <span className="text-[12px] font-mono uppercase tracking-[0.18em] text-white/60 leading-tight">
              destinations<br />without an<br />embassy visa
            </span>
          </div>

          <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            {totals["visa-free"]} visa-free · {totals["visa-on-arrival"]} VOA · {totals["e-visa"]} eVisa
          </div>
        </button>

        {pickerOpen && (
          <div className="border-t border-white/10 p-4 bg-black/40">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country…"
              className="w-full px-3 py-2 rounded-md border border-white/15 bg-white/5 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 mb-2"
            />
            <div className="max-h-[40vh] overflow-y-auto pr-1">
              {passportOptions.map((o) => (
                <button
                  key={o.code}
                  onClick={() => {
                    setPassport(o.code);
                    setClicked(null);
                    setPickerOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-md transition font-sans text-[13px] ${
                    o.code === passport
                      ? "bg-emerald-500/20 text-emerald-100"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {o.name}
                </button>
              ))}
              {passportOptions.length === 0 && (
                <div className="px-3 py-2 font-mono text-[11px] text-white/40">
                  No country matches.
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* TOP-RIGHT: Clicked country detail OR onboarding nudge */}
      {hasClicked ? (
        <aside className="absolute top-[72px] right-4 md:right-6 z-20 w-[300px] md:w-[340px] rounded-2xl border border-white/15 bg-black/65 backdrop-blur-md p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">
                Destination
              </div>
              <div className="font-serif text-2xl leading-tight">
                {clickedInfo!.name}
              </div>
            </div>
            <button
              onClick={() => setClicked(null)}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white/80"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <StatusBlock s={clickedInfo!.status} />

          <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40 leading-relaxed">
            Always confirm with the embassy before you fly.
          </div>
        </aside>
      ) : (
        <aside className="absolute top-[72px] right-4 md:right-6 z-20 w-[280px] md:w-[320px] rounded-2xl border border-white/10 bg-black/45 backdrop-blur-md p-5 pointer-events-none">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">
            § How to use
          </div>
          <ol className="space-y-2.5 text-[13px] text-white/80 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-emerald-400 font-mono">1.</span>
              Set your passport in the top-left card.
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400 font-mono">2.</span>
              The globe colors every country by your visa requirement.
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400 font-mono">3.</span>
              Click any country for details and days allowed.
            </li>
          </ol>
          <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300/80 animate-pulse">
            ← Start with your passport
          </div>
        </aside>
      )}

      {/* BOTTOM: permanent legend strip */}
      <div className="absolute left-0 right-0 bottom-0 z-20 px-4 md:px-6 pb-4 pt-8 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
        <div className="max-w-[1200px] mx-auto">
          <div className="rounded-xl border border-white/10 bg-black/65 backdrop-blur-md px-4 py-3 flex flex-wrap gap-x-5 gap-y-2 justify-between items-center pointer-events-auto">
            {LEGEND_ORDER.map((k) => {
              const meta = STATUS[k];
              return (
                <div key={k} className="flex items-center gap-2 min-w-0">
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-md text-white text-[13px] font-semibold flex-shrink-0"
                    style={{ background: meta.color }}
                    aria-hidden
                  >
                    {meta.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="font-sans text-[12px] leading-tight">
                      {meta.label}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/40 truncate">
                      {meta.oneLiner}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
            Data · passport-index-dataset (MIT) · Wikipedia · Natural Earth
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBlock({ s }: { s: Status }) {
  const meta = STATUS[s.kind];
  const color = colorFor(s);
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: `${color}55`, background: `${color}12` }}
    >
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-[18px] font-bold text-white"
          style={{ background: color }}
          aria-hidden
        >
          {meta.icon}
        </span>
        <div>
          <div
            className="font-semibold text-[16px] leading-tight"
            style={{ color }}
          >
            {meta.label}
          </div>
          <div className="text-white/75 text-[12px] leading-snug">
            {meta.oneLiner}
          </div>
        </div>
      </div>
      {s.kind === "visa-free" && s.days !== undefined && (
        <div className="mt-3 pt-3 border-t border-white/10 text-[13px]">
          <span className="text-white/60">Stay up to </span>
          <span className="font-semibold text-white">{s.days} days</span>
          <span className="text-white/60"> without a visa.</span>
        </div>
      )}
    </div>
  );
}
