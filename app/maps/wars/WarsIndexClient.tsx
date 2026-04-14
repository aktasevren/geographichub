"use client";

import Link from "next/link";
import SiteLogo from "@/components/SiteLogo";
import RelatedMaps from "@/components/RelatedMaps";
import { useLocale, LocaleToggle } from "@/components/LocaleProvider";
import type { WarIndexEntry } from "@/lib/wars-types";

export default function WarsIndexClient({ wars }: { wars: WarIndexEntry[] }) {
  const { t, locale } = useLocale();

  return (
    <div className="min-h-screen grain">
      <header className="flex justify-between items-center px-6 md:px-10 py-5 hair-b">
        <SiteLogo theme="light" />
        <div className="flex items-center gap-5">
          <LocaleToggle theme="light" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            {t("wars.title")}
          </span>
        </div>
      </header>

      <section className="max-w-[1100px] mx-auto px-6 md:px-10 pt-10 md:pt-14 pb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] mb-4">
          {t("wars.indexTag")}
        </div>
        <h1 className="font-serif font-light text-4xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight">
          {t("wars.indexHeroA")}{" "}
          <span className="italic" style={{ color: "var(--accent)" }}>
            {t("wars.indexHeroB")}
          </span>
        </h1>
        <p className="mt-6 text-[17px] md:text-[19px] leading-relaxed text-[var(--text-2)] max-w-2xl">
          {t("wars.indexBlurb")}
        </p>
      </section>

      <section className="max-w-[1100px] mx-auto px-6 md:px-10 pb-20">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--muted)] mb-4">
          {t("wars.pickWar")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {wars.map((w) => (
            <Link
              key={w.slug}
              href={`/maps/wars/${w.slug}`}
              className="group block relative overflow-hidden rounded-xl border border-[var(--line-2)] hover:border-[var(--accent)] transition-all duration-500 p-6 md:p-8 min-h-[220px]"
            >
              <div
                className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 25% 30%, rgba(220,38,38,0.25), transparent 45%), radial-gradient(circle at 75% 70%, rgba(245,158,11,0.2), transparent 45%)",
                }}
              />
              <div className="relative">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] mb-2">
                  {w.startYear}–{w.endYear} · {w.eventCount} {t("wars.eventsLabel")}
                </div>
                <h3 className="font-serif text-2xl md:text-[28px] leading-tight tracking-tight mb-3">
                  {locale === "tr" && w.nameTr ? w.nameTr : w.name}
                </h3>
                <p className="text-[14px] leading-relaxed text-[var(--text-2)] max-w-lg">
                  {locale === "tr" && w.blurbTr ? w.blurbTr : w.blurb}
                </p>
                <span className="inline-flex items-center gap-2 mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent)] group-hover:gap-3 transition-all">
                  {t("wars.openMap")}
                  <span className="inline-block h-px w-6 bg-[var(--accent)] group-hover:w-10 transition-all" />
                  <span>→</span>
                </span>
              </div>
            </Link>
          ))}

          <div className="relative overflow-hidden rounded-xl border border-dashed border-[var(--line-2)] p-6 md:p-8 min-h-[220px] flex items-center justify-center text-center">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] mb-2">
                {t("wars.comingNext")}
              </div>
              <p className="font-serif text-xl text-[var(--text-2)] italic">
                {t("wars.comingNextDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-6 md:px-10 py-8 hair-t flex flex-wrap justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        <span className="hidden md:inline">{t("wars.dataCredit")}</span>
      </footer>
    </div>
  );
}
