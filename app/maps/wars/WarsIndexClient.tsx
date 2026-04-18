"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteLogo from "@/components/SiteLogo";
import { LocaleToggle, useLocale } from "@/components/LocaleProvider";
import WarCard from "@/components/wars-noir/WarCard";
import {
  type WarIndexEntry,
  type WarEra,
  type WarRegion,
  ERA_LABEL,
  REGION_LABEL,
} from "@/lib/wars-types";

export default function WarsIndexClient({ wars }: { wars: WarIndexEntry[] }) {
  const { locale } = useLocale();
  const [q, setQ] = useState("");
  const [era, setEra] = useState<WarEra | "all">("all");
  const [region, setRegion] = useState<WarRegion | "all">("all");

  const presentEras = useMemo(() => {
    const s = new Set<WarEra>();
    wars.forEach((w) => w.era && s.add(w.era));
    return Array.from(s);
  }, [wars]);

  const presentRegions = useMemo(() => {
    const s = new Set<WarRegion>();
    wars.forEach((w) => w.region && s.add(w.region));
    return Array.from(s);
  }, [wars]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return wars.filter((w) => {
      if (era !== "all" && w.era !== era) return false;
      if (region !== "all" && w.region !== region) return false;
      if (!needle) return true;
      return (
        w.name.toLowerCase().includes(needle) ||
        (w.nameTr || "").toLowerCase().includes(needle) ||
        (w.tags || []).some((tag) => tag.toLowerCase().includes(needle))
      );
    });
  }, [wars, q, era, region]);

  const grouped = useMemo(() => {
    const m = new Map<WarEra | "other", WarIndexEntry[]>();
    filtered.forEach((w) => {
      const key = w.era || "other";
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(w);
    });
    const order: (WarEra | "other")[] = [
      "ancient",
      "medieval",
      "early-modern",
      "19th-century",
      "20th-century",
      "21st-century",
      "other",
    ];
    return order
      .filter((k) => m.has(k))
      .map((k) => ({ era: k, wars: m.get(k)! }));
  }, [filtered]);

  const totalEvents = wars.reduce((s, w) => s + w.eventCount, 0);

  return (
    <div
      data-map="wars"
      className="min-h-screen"
      style={{ background: "var(--war-ink)", color: "var(--war-paper)" }}
    >
      {/* Noir header */}
      <header
        className="sticky top-0 z-40"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,10,0.95), rgba(10,10,10,0.75))",
          borderBottom: "1px solid var(--war-rule)",
        }}
      >
        <div className="flex justify-between items-center px-4 md:px-8 py-3 md:py-4 max-w-[1100px] mx-auto">
          <SiteLogo />
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: "var(--war-paper-2)" }}
            >
              {locale === "tr" ? "← Anasayfa" : "← Home"}
            </Link>
            <LocaleToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1100px] mx-auto px-5 md:px-10 pt-10 md:pt-14 pb-4">
        <h1
          className="font-serif font-light italic text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight"
          style={{ color: "var(--war-paper)" }}
        >
          {locale === "tr" ? (
            <>
              Savaşın{" "}
              <span style={{ color: "var(--war-gold)" }}>kırılım noktaları</span>
            </>
          ) : (
            <>
              The{" "}
              <span style={{ color: "var(--war-gold)" }}>turning points</span>{" "}
              of war
            </>
          )}
        </h1>
        <div
          className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em]"
          style={{ color: "var(--war-paper-3)" }}
        >
          § {wars.length} {locale === "tr" ? "savaş" : "wars"} · {totalEvents}{" "}
          {locale === "tr" ? "olay" : "events"}
        </div>
      </section>

      {/* Search + filters */}
      <section className="max-w-[1100px] mx-auto px-5 md:px-10 pt-6 pb-8">
        <div className="flex flex-col gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={locale === "tr" ? "Savaş ara…" : "Search wars…"}
            className="w-full px-4 py-3 rounded-full bg-transparent text-[14px] focus:outline-none"
            style={{
              border: "1px solid var(--war-rule)",
              color: "var(--war-paper)",
            }}
          />

          {presentEras.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              <Chip active={era === "all"} onClick={() => setEra("all")}>
                {locale === "tr" ? "Tüm dönemler" : "All eras"}
              </Chip>
              {presentEras.map((e) => (
                <Chip
                  key={e}
                  active={era === e}
                  onClick={() => setEra(e)}
                >
                  {ERA_LABEL[e][locale as "tr" | "en"]}
                </Chip>
              ))}
            </div>
          )}

          {presentRegions.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              <Chip
                active={region === "all"}
                onClick={() => setRegion("all")}
              >
                {locale === "tr" ? "Tüm bölgeler" : "All regions"}
              </Chip>
              {presentRegions.map((r) => (
                <Chip
                  key={r}
                  active={region === r}
                  onClick={() => setRegion(r)}
                >
                  {REGION_LABEL[r][locale as "tr" | "en"]}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Grouped list */}
      <section className="max-w-[1100px] mx-auto px-5 md:px-10 pb-20">
        {filtered.length === 0 ? (
          <div
            className="text-center py-12 font-mono text-[11px] uppercase tracking-[0.2em]"
            style={{ color: "var(--war-paper-3)" }}
          >
            {locale === "tr" ? "Eşleşen savaş yok." : "No matching wars."}
          </div>
        ) : (
          grouped.map(({ era: eraKey, wars: list }) => (
            <div key={eraKey} className="mb-10">
              <div
                className="font-mono text-[10px] uppercase tracking-[0.3em] mb-3"
                style={{ color: "var(--war-paper-3)" }}
              >
                {eraKey === "other"
                  ? locale === "tr"
                    ? "Diğer"
                    : "Other"
                  : ERA_LABEL[eraKey as WarEra][locale as "tr" | "en"]}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {list.map((w) => (
                  <WarCard
                    key={w.slug}
                    war={w}
                    locale={locale as "tr" | "en"}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <footer
        className="px-5 md:px-10 py-6 flex flex-wrap justify-between gap-4 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em]"
        style={{
          color: "var(--war-paper-3)",
          borderTop: "1px solid var(--war-rule)",
        }}
      >
        <span>
          © {new Date().getFullYear()} GeographicHub
        </span>
        <span className="hidden md:inline">
          {locale === "tr"
            ? "Wikipedia, Wikidata (CC BY-SA)"
            : "Wikipedia, Wikidata (CC BY-SA)"}
        </span>
      </footer>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.15em] transition"
      style={{
        background: active ? "var(--war-gold)" : "transparent",
        color: active ? "var(--war-ink)" : "var(--war-paper-2)",
        border: `1px solid ${active ? "var(--war-gold)" : "var(--war-rule)"}`,
      }}
    >
      {children}
    </button>
  );
}
