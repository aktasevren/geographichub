"use client";

import { useLocale } from "@/components/LocaleProvider";
import FlagStrip from "@/components/wars-noir/FlagStrip";
import type { War, WarSide as SharedWarSide } from "@/lib/wars-types";

/**
 * The FlagStrip primitive has its own local WarSide type. Our shared
 * type (from lib/wars-types.ts) is structurally compatible, so pass-through
 * works — we cast narrowly rather than duplicate the shape.
 */
function asFlagSide(s: SharedWarSide) {
  return s as unknown as Parameters<typeof FlagStrip>[0]["side"];
}

export default function WarSidesHero({ war }: { war: War }) {
  const { locale } = useLocale();
  const [sideA, sideB] = war.sides;
  const name = locale === "tr" && war.nameTr ? war.nameTr : war.name;
  const opening = locale === "tr" ? war.openingTr : war.opening;

  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US").format(n);

  return (
    <section
      data-map="wars"
      className="absolute z-30 top-[58px] left-0 right-0 px-4 md:px-8 pt-4 pb-4"
      style={{
        background:
          "linear-gradient(to bottom, rgba(10,10,10,0.92), rgba(10,10,10,0))",
      }}
    >
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0 md:max-w-[560px]">
          <div
            className="font-mono text-[10px] uppercase tracking-[0.25em]"
            style={{ color: "var(--war-paper-3)" }}
          >
            § {war.startYear}–{war.endYear} · {war.events.length}{" "}
            {locale === "tr" ? "olay" : "events"}
          </div>
          <h1
            className="font-serif font-light italic text-[24px] md:text-[34px] leading-[1.05] mt-1"
            style={{ color: "var(--war-paper)" }}
          >
            {name}
          </h1>
          <p
            className="font-sans text-[13px] leading-relaxed mt-2 md:max-w-[520px]"
            style={{ color: "var(--war-paper-2)" }}
          >
            {opening}
          </p>
        </div>

        <div className="flex items-start gap-5">
          {sideA && (
            <FlagStrip
              side={asFlagSide(sideA)}
              align="left"
              locale={locale as "tr" | "en"}
            />
          )}
          <div
            className="font-serif italic text-[22px] pt-1"
            style={{ color: "var(--war-gold)" }}
          >
            vs
          </div>
          {sideB && (
            <FlagStrip
              side={asFlagSide(sideB)}
              align="right"
              locale={locale as "tr" | "en"}
            />
          )}
        </div>
      </div>

      <div
        className="max-w-[1100px] mx-auto mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em]"
        style={{ color: "var(--war-paper-3)" }}
      >
        <span>
          <span style={{ color: "var(--war-blood)" }}>
            {fmt(war.casualties.militaryDead)}
          </span>{" "}
          {locale === "tr" ? "asker ölü" : "military dead"}
        </span>
        {war.casualties.civilianDead != null && (
          <span>
            <span style={{ color: "var(--war-blood)" }}>
              {fmt(war.casualties.civilianDead)}
            </span>{" "}
            {locale === "tr" ? "sivil ölü" : "civilian dead"}
          </span>
        )}
        {war.casualties.source && (
          <span className="italic normal-case tracking-normal">
            · {war.casualties.source}
          </span>
        )}
      </div>
    </section>
  );
}
