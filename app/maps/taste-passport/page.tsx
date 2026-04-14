"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useLocale } from "@/components/LocaleProvider";
import {
  Country,
  PassportData,
  TasteStatus,
  countryProgress,
  loadProgress,
} from "./lib";

export default function TastePassportHome() {
  const { t } = useLocale();
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
      <PageHeader
        theme="light"
        breadcrumbs={[
          { label: t("common.home"), href: "/" },
          { label: t("taste.title") },
        ]}
      />

      <section className="px-5 md:px-10 pt-10 md:pt-14 pb-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] mb-4">
            {t("taste.heroTag")}
          </div>
          <h1 className="font-serif font-light text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.98] tracking-tight">
            {t("taste.heroA")}{" "}
            <span className="italic" style={{ color: "var(--accent)" }}>
              {t("taste.heroB")}
            </span>
          </h1>
          <p className="mt-5 text-[15px] md:text-[17px] leading-relaxed text-[var(--text-2)] max-w-xl">
            {t("taste.heroBody")}
          </p>
        </div>

        {data && (
          <div className="mt-8 max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Stat
              n={`${totals.tasted}`}
              suffix={` / ${totals.total}`}
              label={t("taste.statTasted")}
              color="var(--accent)"
            />
            <Stat n={`${totals.want}`} label={t("taste.statWant")} />
            <Stat
              n={`${totals.started}`}
              suffix={` / ${data.countries.length}`}
              label={t("taste.statStarted")}
            />
            <Stat
              n={`${totals.completed}`}
              label={t("taste.statCompleted")}
              color="var(--accent)"
              accent
            />
          </div>
        )}
      </section>

      <section className="px-5 md:px-10 pt-2 pb-4">
        <div className="max-w-[1100px] mx-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("taste.searchCountry")}
            className="w-full max-w-xl px-4 py-3 rounded-full border border-[var(--line-2)] bg-transparent text-[15px] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
      </section>

      <section className="px-5 md:px-10 pb-20">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filtered.map((c) => {
            const p = countryProgress(c, progress);
            const pct = Math.round((p.tasted / p.total) * 100);
            const complete = p.tasted === p.total;
            return (
              <Link
                key={c.slug}
                href={`/maps/taste-passport/${c.slug}`}
                className="tile group block relative overflow-hidden rounded-2xl border border-[var(--line-2)] hover:border-[var(--accent)] transition-all duration-500 p-5 md:p-6"
              >
                <div
                  className="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 25% 30%, rgba(255,180,100,0.18), transparent 50%), radial-gradient(circle at 80% 70%, rgba(251,113,133,0.14), transparent 50%)",
                  }}
                />
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-5xl md:text-6xl leading-none">
                      {c.flag}
                    </div>
                    {complete && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] border border-[var(--accent)] rounded-full px-2 py-0.5">
                        ★ {t("taste.stamped")}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-[22px] md:text-2xl leading-tight tracking-tight mb-1">
                    {c.name}
                  </h3>
                  <p className="text-[var(--text-2)] text-[13px] leading-relaxed line-clamp-2 min-h-[36px]">
                    {c.blurb}
                  </p>
                  <div className="mt-4">
                    <div className="flex justify-between items-baseline mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em]">
                      <span className="text-[var(--muted)]">
                        {p.tasted} / {p.total} {t("taste.tastedOf")}
                      </span>
                      <span style={{ color: "var(--accent)" }}>{pct}%</span>
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
                </div>
              </Link>
            );
          })}
        </div>
        {data && filtered.length === 0 && (
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)] mt-10">
            {t("taste.noCountry", { q })}
          </p>
        )}
      </section>

      <footer className="px-5 md:px-10 py-6 hair-t flex flex-wrap justify-between gap-4 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        <span className="hidden md:inline">{t("taste.creditNote")}</span>
      </footer>
    </div>
  );
}

function Stat({
  n,
  suffix,
  label,
  color,
  accent,
}: {
  n: string;
  suffix?: string;
  label: string;
  color?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-1">
        <span
          className="font-serif text-3xl md:text-4xl leading-none tracking-tight tabular-nums"
          style={{ color: color || "var(--text)" }}
        >
          {n}
        </span>
        {suffix && (
          <span className="font-serif text-lg text-[var(--text-2)] tabular-nums">
            {suffix}
          </span>
        )}
      </div>
      <span
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]"
        style={accent ? { color: "var(--accent)" } : {}}
      >
        {label}
      </span>
    </div>
  );
}
