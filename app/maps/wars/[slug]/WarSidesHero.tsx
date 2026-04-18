"use client";

import { useLocale } from "@/components/LocaleProvider";
import FlagStrip from "@/components/wars-noir/FlagStrip";
import type { War, WarSide as SharedWarSide } from "@/lib/wars-types";

function asFlagSide(s: SharedWarSide) {
  return s as unknown as Parameters<typeof FlagStrip>[0]["side"];
}

export default function WarSidesHero({ war }: { war: War }) {
  const { locale } = useLocale();
  const [sideA, sideB] = war.sides;
  const name = locale === "tr" && war.nameTr ? war.nameTr : war.name;

  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US").format(n);

  return (
    <section
      data-map="wars"
      className="px-4 md:px-8 py-3 md:py-4"
      style={{
        background: "var(--war-ink)",
        borderBottom: "1px solid var(--war-rule)",
      }}
    >
      <div className="max-w-[1200px] mx-auto flex flex-wrap items-center gap-x-6 gap-y-2">
        {/* Title + meta */}
        <div className="min-w-0 flex-1">
          <div
            className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.25em]"
            style={{ color: "var(--war-paper-3)" }}
          >
            § {war.startYear}–{war.endYear} · {war.events.length}{" "}
            {locale === "tr" ? "olay" : "events"}
          </div>
          <h1
            className="font-serif font-light italic text-[18px] md:text-[22px] leading-[1.1] mt-0.5"
            style={{ color: "var(--war-paper)" }}
          >
            {name}
          </h1>
        </div>

        {/* Flags (compact) */}
        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
          {sideA && (
            <FlagStrip
              side={asFlagSide(sideA)}
              align="left"
              locale={locale as "tr" | "en"}
              compact
              maxFlags={3}
            />
          )}
          <span
            className="font-serif italic"
            style={{ color: "var(--war-gold)", fontSize: 18 }}
          >
            vs
          </span>
          {sideB && (
            <FlagStrip
              side={asFlagSide(sideB)}
              align="right"
              locale={locale as "tr" | "en"}
              compact
              maxFlags={3}
            />
          )}
        </div>

        {/* Casualties pill */}
        <div
          className="flex-shrink-0 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.22em] flex items-center gap-2"
          style={{ color: "var(--war-paper-3)" }}
        >
          <span style={{ color: "var(--war-blood)", fontSize: 13 }}>
            {fmt(war.casualties.militaryDead)}
          </span>
          <span>{locale === "tr" ? "asker ölü" : "mil. dead"}</span>
        </div>
      </div>
    </section>
  );
}
