"use client";

import { Fragment } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { War, WarEvent, WarSide } from "@/lib/wars-types";

type Row = { label: string; a: string; b: string; blood?: boolean };

function MiniFlag({ side }: { side: WarSide }) {
  const country = side.countries[0];
  if (!country) return null;
  const mono =
    country.name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "??";
  if (country.flagFallback === "coat" || !country.flagUrl) {
    return (
      <span
        className="inline-flex items-center justify-center"
        style={{
          width: 22,
          height: 15,
          border: "1px solid var(--war-gold)",
          color: "var(--war-gold)",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 8,
          letterSpacing: "0.05em",
          background: "var(--war-ink-2)",
        }}
      >
        {mono}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={country.flagUrl}
      alt=""
      width={22}
      height={15}
      style={{
        filter: "grayscale(100%) contrast(1.08) brightness(0.92)",
        border: "1px solid var(--war-rule)",
      }}
    />
  );
}

function pickSideLabel(s: WarSide, locale: "tr" | "en"): string {
  return locale === "tr" && s.labelTr ? s.labelTr : s.label;
}

export default function EventStats({
  event,
  war,
}: {
  event: WarEvent;
  war: War;
}) {
  const { locale } = useLocale();
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US").format(n);

  if (!event.forces && !event.casualties && !event.commanders) return null;

  const sideA = war.sides[0];
  const sideB = war.sides[1];

  const rows: Row[] = [];
  if (event.forces) {
    rows.push({
      label: locale === "tr" ? "Savaşan" : "Forces",
      a: fmt(event.forces.sideA),
      b: fmt(event.forces.sideB),
    });
  }
  if (event.casualties) {
    rows.push({
      label: locale === "tr" ? "Kayıp" : "Casualties",
      a: fmt(event.casualties.sideA),
      b: fmt(event.casualties.sideB),
      blood: true,
    });
  }
  if (event.commanders) {
    rows.push({
      label: locale === "tr" ? "Komutan" : "Commander",
      a: event.commanders.sideA.join(", ") || "—",
      b: event.commanders.sideB.join(", ") || "—",
    });
  }

  return (
    <div
      className="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-1.5 font-mono text-[11px] mb-4 pb-4 border-b"
      style={{ borderColor: "var(--war-rule)" }}
    >
      {/* Header row: flag + side label */}
      <div />
      <div
        className="flex items-center gap-2 pb-1 border-b uppercase tracking-[0.2em]"
        style={{
          color: "var(--war-paper)",
          borderColor: "var(--war-rule)",
          fontSize: 10,
        }}
      >
        {sideA && <MiniFlag side={sideA} />}
        {sideA && (
          <span
            className="truncate"
            style={{
              color:
                event.side === "victory-a"
                  ? "var(--war-gold)"
                  : "var(--war-paper-2)",
            }}
          >
            {pickSideLabel(sideA, locale as "tr" | "en")}
          </span>
        )}
      </div>
      <div
        className="flex items-center gap-2 pb-1 border-b uppercase tracking-[0.2em]"
        style={{
          color: "var(--war-paper)",
          borderColor: "var(--war-rule)",
          fontSize: 10,
        }}
      >
        {sideB && <MiniFlag side={sideB} />}
        {sideB && (
          <span
            className="truncate"
            style={{
              color:
                event.side === "victory-b"
                  ? "var(--war-gold)"
                  : "var(--war-paper-2)",
            }}
          >
            {pickSideLabel(sideB, locale as "tr" | "en")}
          </span>
        )}
      </div>

      {rows.map((r) => (
        <Fragment key={r.label}>
          <div
            className="uppercase tracking-[0.2em]"
            style={{ color: "var(--war-paper-3)" }}
          >
            {r.label}
          </div>
          <div
            style={{
              color: r.blood ? "var(--war-blood)" : "var(--war-paper)",
            }}
          >
            {r.a}
          </div>
          <div
            style={{
              color: r.blood ? "var(--war-blood)" : "var(--war-paper)",
            }}
          >
            {r.b}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
