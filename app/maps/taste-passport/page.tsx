"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteLogo from "@/components/SiteLogo";
import { LocaleToggle } from "@/components/LocaleProvider";
import {
  Country,
  PassportData,
  TasteStatus,
  countryProgress,
  loadProgress,
} from "./lib";

export default function TastePassportHome() {
  const [data, setData] = useState<PassportData | null>(null);
  const [progress, setProgress] = useState<Record<string, TasteStatus>>({});
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/data/taste-passport.json")
      .then((r) => r.json())
      .then(setData);
    setProgress(loadProgress());
    const onStorage = () => setProgress(loadProgress());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!q.trim()) return data.countries;
    const needle = q.toLowerCase();
    return data.countries.filter((c) => c.name.toLowerCase().includes(needle));
  }, [data, q]);

  const totals = useMemo(() => {
    if (!data) return { tasted: 0, want: 0, total: 0, started: 0, completed: 0 };
    let tasted = 0,
      want = 0,
      total = 0,
      started = 0,
      completed = 0;
    for (const c of data.countries) {
      const p = countryProgress(c, progress);
      tasted += p.tasted;
      want += p.want;
      total += p.total;
      if (p.tasted > 0) started++;
      if (p.tasted === p.total) completed++;
    }
    return { tasted, want, total, started, completed };
  }, [data, progress]);

  return (
    <div className="relative min-h-screen grain">
      <header className="relative z-30 flex justify-between items-center px-5 md:px-10 py-4 md:py-5 hair-b">
        <SiteLogo theme="light" />
        <div className="flex items-center gap-4">
          <LocaleToggle theme="light" />
          <span className="hidden md:inline font-serif text-[18px] tracking-tight">
            Taste Passport
          </span>
        </div>
      </header>

      <section className="px-6 md:px-10 pt-14 pb-10">
        <div className="max-w-[1100px] mx-auto text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] mb-4">
            § A bucket list for your tastebuds
          </div>
          <h1 className="font-serif font-light text-5xl md:text-7xl leading-[0.95] tracking-tight">
            Have you <span className="italic" style={{ color: "var(--accent)" }}>tasted the world?</span>
          </h1>
          <p className="mt-6 text-[16px] md:text-[18px] leading-relaxed text-[var(--text-2)] max-w-xl mx-auto">
            Pick a country, mark the dishes you've tried. Collect stamps for every country completed.
          </p>
        </div>

        {/* progress bar */}
        {data && (
          <div className="mt-10 max-w-[900px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-[10px] uppercase tracking-[0.18em]">
            <Stat label="Dishes tasted" value={`${totals.tasted} / ${totals.total}`} />
            <Stat label="Want to try" value={`${totals.want}`} />
            <Stat label="Countries started" value={`${totals.started} / ${data.countries.length}`} />
            <Stat label="Countries completed" value={`${totals.completed}`} accent />
          </div>
        )}

        <div className="mt-10 max-w-[500px] mx-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a country…"
            className="w-full px-4 py-3 rounded-full border border-[var(--line-2)] bg-transparent text-[15px] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
      </section>

      <section className="px-6 md:px-10 pb-24">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => {
            const p = countryProgress(c, progress);
            const pct = Math.round((p.tasted / p.total) * 100);
            const complete = p.tasted === p.total;
            return (
              <Link
                key={c.slug}
                href={`/maps/taste-passport/${c.slug}`}
                className="tile group block relative overflow-hidden rounded-xl border border-[var(--line-2)] hover:border-[var(--accent)] transition p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="text-5xl leading-none">{c.flag}</div>
                  {complete && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] border border-[var(--accent)] rounded-full px-2 py-0.5">
                      Stamped
                    </span>
                  )}
                </div>
                <h3 className="mt-5 font-serif text-2xl md:text-3xl tracking-tight">
                  {c.name}
                </h3>
                <p className="mt-2 text-[var(--text-2)] text-sm leading-relaxed min-h-[42px]">
                  {c.blurb}
                </p>
                <div className="mt-5">
                  <div className="flex justify-between items-baseline mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                    <span>
                      {p.tasted} / {p.total} tasted
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[var(--line)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: "var(--accent)",
                      }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {data && filtered.length === 0 && (
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)] mt-10">
            No country matches “{q}”.
          </p>
        )}
      </section>

      <footer className="px-6 md:px-10 py-8 hair-t flex flex-wrap justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>© {new Date().getFullYear()} GeographicHub</span>
        <span>Text & images · Wikipedia / Wikimedia Commons (CC BY-SA)</span>
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 items-center">
      <span className="text-[var(--muted)]">{label}</span>
      <span
        className="normal-case font-sans text-lg tracking-tight"
        style={{ color: accent ? "var(--accent)" : "inherit" }}
      >
        {value}
      </span>
    </div>
  );
}
