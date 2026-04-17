"use client";

import { Fragment } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { WarEvent } from "@/lib/wars-types";

type Row = { label: string; a: string; b: string; blood?: boolean };

export default function EventStats({ event }: { event: WarEvent }) {
  const { locale } = useLocale();
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US").format(n);

  if (!event.forces && !event.casualties && !event.commanders) return null;

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
