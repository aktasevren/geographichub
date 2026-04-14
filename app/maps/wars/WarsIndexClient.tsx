"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useLocale } from "@/components/LocaleProvider";
import {
  type WarIndexEntry,
  type WarEra,
  type WarRegion,
  ERA_LABEL,
  REGION_LABEL,
} from "@/lib/wars-types";

export default function WarsIndexClient({ wars }: { wars: WarIndexEntry[] }) {
  const { t, locale } = useLocale();
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

  // Group filtered wars by era
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

  return (
    <div className="min-h-screen grain">
      <PageHeader
        theme="light"
        breadcrumbs={[
          { label: t("common.home"), href: "/" },
          { label: t("wars.title") },
        ]}
      />

      <section className="max-w-[1100px] mx-auto px-5 md:px-10 pt-8 md:pt-12 pb-4">
        <h1 className="font-serif font-light text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight">
          {t("wars.indexHeroA")}{" "}
          <span className="italic" style={{ color: "var(--accent)" }}>
            {t("wars.indexHeroB")}
          </span>
        </h1>
      </section>

      {/* Search + filter chips */}
      <section className="max-w-[1100px] mx-auto px-5 md:px-10 pt-4 pb-8">
        <div className="flex flex-col gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={locale === "tr" ? "Savaş ara…" : "Search wars…"}
            className="w-full px-4 py-3 rounded-full border border-[var(--line-2)] bg-transparent text-[15px] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
          />

          {presentEras.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              <Chip active={era === "all"} onClick={() => setEra("all")}>
                {locale === "tr" ? "Tüm dönemler" : "All eras"}
              </Chip>
              {presentEras.map((e) => (
                <Chip key={e} active={era === e} onClick={() => setEra(e)}>
                  {ERA_LABEL[e][locale as "tr" | "en"]}
                </Chip>
              ))}
            </div>
          )}

          {presentRegions.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              <Chip active={region === "all"} onClick={() => setRegion("all")}>
                {locale === "tr" ? "Tüm bölgeler" : "All regions"}
              </Chip>
              {presentRegions.map((r) => (
                <Chip key={r} active={region === r} onClick={() => setRegion(r)}>
                  {REGION_LABEL[r][locale as "tr" | "en"]}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Grouped war list */}
      <section className="max-w-[1100px] mx-auto px-5 md:px-10 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-12 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            {locale === "tr" ? "Eşleşen savaş yok." : "No matching wars."}
          </div>
        ) : (
          grouped.map(({ era: eraKey, wars: list }) => (
            <div key={eraKey} className="mb-10">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] mb-3">
                {eraKey === "other"
                  ? locale === "tr"
                    ? "Diğer"
                    : "Other"
                  : ERA_LABEL[eraKey as WarEra][locale as "tr" | "en"]}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {list.map((w) => (
                  <Link
                    key={w.slug}
                    href={`/maps/wars/${w.slug}`}
                    className="group block relative overflow-hidden rounded-xl border border-[var(--line-2)] hover:border-[var(--accent)] transition p-5 md:p-6 min-h-[180px]"
                  >
                    <div
                      className="absolute inset-0 opacity-35 group-hover:opacity-55 transition-opacity pointer-events-none"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 25% 30%, rgba(220,38,38,0.25), transparent 45%), radial-gradient(circle at 75% 70%, rgba(245,158,11,0.2), transparent 45%)",
                      }}
                    />
                    <div className="relative">
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] mb-2">
                        {w.startYear}–{w.endYear} · {w.eventCount}{" "}
                        {t("wars.eventsLabel")}
                        {w.region && (
                          <>
                            {" · "}
                            {REGION_LABEL[w.region][locale as "tr" | "en"]}
                          </>
                        )}
                      </div>
                      <h3 className="font-serif text-xl md:text-2xl leading-tight tracking-tight mb-2">
                        {locale === "tr" && w.nameTr ? w.nameTr : w.name}
                      </h3>
                      <span className="inline-flex items-center gap-2 mt-3 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[var(--accent)] group-hover:gap-3 transition-all">
                        {t("wars.openMap")}
                        <span className="inline-block h-px w-5 bg-[var(--accent)] group-hover:w-8 transition-all" />
                        <span>→</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Coming next teaser */}
        <div className="relative overflow-hidden rounded-xl border border-dashed border-[var(--line-2)] p-5 md:p-6 text-center mt-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] mb-2">
            {t("wars.comingNext")}
          </div>
          <p className="font-serif text-lg text-[var(--text-2)] italic">
            {t("wars.comingNextDesc")}
          </p>
        </div>
      </section>

      <footer className="px-5 md:px-10 py-6 hair-t flex flex-wrap justify-between gap-4 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        <span className="hidden md:inline">{t("wars.dataCredit")}</span>
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
      className={`px-3 py-1.5 rounded-full border text-[11px] font-mono uppercase tracking-[0.15em] transition ${
        active
          ? "bg-[var(--accent)] text-black border-[var(--accent)]"
          : "bg-transparent text-[var(--text-2)] border-[var(--line-2)] hover:border-[var(--text-2)]"
      }`}
    >
      {children}
    </button>
  );
}
