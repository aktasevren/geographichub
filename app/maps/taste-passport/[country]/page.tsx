"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Country,
  DishTag,
  PassportData,
  TasteStatus,
  WikiSummary,
  countryProgress,
  dishKey,
  fetchSummary,
  loadProgress,
  saveStatus,
} from "../lib";

const TAG_META: Record<DishTag | "all", { label: string; icon: string }> = {
  all:      { label: "All",      icon: "∀" },
  iconic:   { label: "Iconic",   icon: "★" },
  everyday: { label: "Everyday", icon: "🏠" },
  street:   { label: "Street",   icon: "🥡" },
  dessert:  { label: "Dessert",  icon: "🍰" },
  drink:    { label: "Drink",    icon: "🥤" },
};

const TAG_ORDER: (DishTag | "all")[] = ["all", "everyday", "iconic", "street", "dessert", "drink"];

export default function CountryPage() {
  const params = useParams<{ country: string }>();
  const slug = params?.country;
  const [data, setData] = useState<PassportData | null>(null);
  const [progress, setProgress] = useState<Record<string, TasteStatus>>({});
  const [summaries, setSummaries] = useState<Record<string, WikiSummary>>({});
  const [justStamped, setJustStamped] = useState<string | null>(null);
  const [filter, setFilter] = useState<DishTag | "all">("all");

  useEffect(() => {
    fetch("/data/taste-passport.json")
      .then((r) => r.json())
      .then(setData);
    setProgress(loadProgress());
  }, []);

  const country: Country | undefined = useMemo(
    () => data?.countries.find((c) => c.slug === slug),
    [data, slug]
  );

  useEffect(() => {
    if (!country) return;
    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled(
        country.dishes.map((d) =>
          fetchSummary(d.wikiTitle).then((s) => [d.id, s] as const)
        )
      );
      if (cancelled) return;
      const next: Record<string, WikiSummary> = {};
      for (const r of results) {
        if (r.status === "fulfilled") {
          const [id, s] = r.value;
          next[id] = s;
        }
      }
      setSummaries(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [country]);

  if (data && !country) notFound();

  const setStatus = (dishId: string, status: TasteStatus) => {
    if (!country) return;
    const k = dishKey(country.slug, dishId);
    const current = progress[k] ?? null;
    const nextStatus = current === status ? null : status;
    saveStatus(k, nextStatus);
    setProgress((p) => ({ ...p, [k]: nextStatus }));
    if (nextStatus === "tasted") {
      setJustStamped(dishId);
      setTimeout(() => setJustStamped((v) => (v === dishId ? null : v)), 900);
    }
  };

  const p = country ? countryProgress(country, progress) : null;
  const pct = p ? Math.round((p.tasted / p.total) * 100) : 0;
  const complete = p && p.tasted === p.total;

  return (
    <div className="relative min-h-screen grain">
      <header className="relative z-30 flex justify-between items-center px-6 md:px-10 py-5 hair-b">
        <Link
          href="/maps/taste-passport"
          className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--text-2)] hover:text-[var(--text)]"
        >
          ← All countries
        </Link>
        <span className="font-serif text-[18px] tracking-tight">Taste Passport</span>
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--muted)] hover:text-[var(--text)]"
        >
          GeographicHub
        </Link>
      </header>

      {country && (
        <>
          <section className="relative px-6 md:px-10 pt-14 pb-8">
            <div className="max-w-[1100px] mx-auto">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <div className="text-7xl md:text-8xl leading-none mb-4">
                    {country.flag}
                  </div>
                  <h1 className="font-serif font-light text-5xl md:text-7xl leading-[0.95] tracking-tight">
                    {country.name}
                  </h1>
                  <p className="mt-4 text-[16px] md:text-[18px] leading-relaxed text-[var(--text-2)] max-w-xl">
                    {country.blurb}
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3 min-w-[240px]">
                  {complete && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--accent)] border border-[var(--accent)] rounded-full px-3 py-1">
                      ★ Passport stamped
                    </span>
                  )}
                  <div className="w-full">
                    <div className="flex justify-between mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                      <span>Progress</span>
                      <span>
                        {p?.tasted} / {p?.total} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[var(--line)] rounded-full overflow-hidden">
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
              </div>
            </div>
          </section>

          {/* Filter chips */}
          <section className="px-6 md:px-10 pb-4">
            <div className="max-w-[1100px] mx-auto flex flex-wrap gap-2">
              {TAG_ORDER.map((t) => {
                const meta = TAG_META[t];
                const count =
                  t === "all"
                    ? country.dishes.length
                    : country.dishes.filter((d) => d.tags?.includes(t as DishTag)).length;
                const on = filter === t;
                return (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`px-3 py-1.5 rounded-full border text-[12px] font-mono uppercase tracking-[0.15em] transition flex items-center gap-1.5 ${
                      on
                        ? "bg-[var(--accent)] text-black border-[var(--accent)]"
                        : "bg-transparent text-[var(--text-2)] border-[var(--line-2)] hover:border-[var(--text-2)]"
                    }`}
                  >
                    <span className="text-[14px]">{meta.icon}</span>
                    {meta.label}
                    <span className="opacity-60 tabular-nums">{count}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="px-6 md:px-10 pb-20">
            <div className="max-w-[1100px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {country.dishes
                .filter((d) =>
                  filter === "all" ? true : d.tags?.includes(filter as DishTag)
                )
                .map((d) => {
                const k = dishKey(country.slug, d.id);
                const st = progress[k] ?? null;
                const s = summaries[d.id];
                const stamped = justStamped === d.id;
                return (
                  <article
                    key={d.id}
                    className={`relative overflow-hidden rounded-xl border bg-[var(--bg-2,transparent)] transition ${
                      st === "tasted"
                        ? "border-[var(--accent)]"
                        : "border-[var(--line-2)]"
                    }`}
                  >
                    <div className="relative aspect-square bg-[var(--line)] overflow-hidden">
                      {s?.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.thumbnail}
                          alt={d.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--muted)] font-mono text-[9px] uppercase tracking-[0.2em]">
                          …
                        </div>
                      )}
                      {st === "tasted" && (
                        <div className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center bg-[var(--accent)] text-black rounded-full font-bold text-[14px]" title="Tasted">
                          ✓
                        </div>
                      )}
                      {st === "want" && (
                        <div className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center bg-black/80 text-white rounded-full text-[13px]" title="Want to try">
                          ★
                        </div>
                      )}
                      {stamped && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div
                            className="font-serif text-white text-5xl tracking-tight"
                            style={{
                              animation: "stamp 900ms ease-out forwards",
                              textShadow: "0 4px 30px rgba(0,0,0,0.6)",
                            }}
                          >
                            ✓
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h3 className="font-serif text-[16px] leading-tight tracking-tight mb-1.5 line-clamp-2 min-h-[38px]">
                        {d.name}
                      </h3>
                      <div className="grid grid-cols-3 gap-1">
                        <IconBtn
                          active={st === "tasted"}
                          kind="tasted"
                          onClick={() => setStatus(d.id, "tasted")}
                          title="Tasted"
                        />
                        <IconBtn
                          active={st === "want"}
                          kind="want"
                          onClick={() => setStatus(d.id, "want")}
                          title="Want to try"
                        />
                        <IconBtn
                          active={st === null}
                          kind="neutral"
                          onClick={() => setStatus(d.id, null)}
                          title="Not yet"
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]">
              Photos & descriptions · Wikipedia / Wikimedia Commons (CC BY-SA) · Your progress is saved on this device only
            </p>
          </section>
        </>
      )}

      <style jsx>{`
        @keyframes stamp {
          0% { transform: scale(2.4); opacity: 0; }
          40% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function IconBtn({
  kind,
  active,
  onClick,
  title,
}: {
  kind: "tasted" | "want" | "neutral";
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  const icon = kind === "tasted" ? "✓" : kind === "want" ? "★" : "○";
  const base =
    "h-7 rounded font-mono text-[13px] border transition flex items-center justify-center";
  const styles = active
    ? kind === "tasted"
      ? "bg-[var(--accent)] text-black border-[var(--accent)]"
      : kind === "want"
      ? "bg-black/80 text-white border-black/80"
      : "bg-[var(--line)] text-[var(--text)] border-[var(--line-2)]"
    : "bg-transparent text-[var(--text-2)] border-[var(--line-2)] hover:border-[var(--text-2)]";
  return (
    <button
      onClick={onClick}
      className={`${base} ${styles}`}
      title={title}
      aria-label={title}
    >
      {icon}
    </button>
  );
}

function Btn({
  children,
  active,
  activeStyle,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  activeStyle: "tasted" | "want" | "neutral";
  onClick: () => void;
}) {
  const base =
    "py-2 rounded-md font-mono text-[10px] uppercase tracking-[0.18em] border transition";
  const styles = active
    ? activeStyle === "tasted"
      ? "bg-[var(--accent)] text-black border-[var(--accent)]"
      : activeStyle === "want"
      ? "bg-black/80 text-white border-black/80"
      : "bg-[var(--line)] text-[var(--text)] border-[var(--line-2)]"
    : "bg-transparent text-[var(--text-2)] border-[var(--line-2)] hover:border-[var(--text-2)]";
  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}
