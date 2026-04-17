"use client";

import { useLocale } from "@/components/LocaleProvider";
import KindIcon from "@/components/wars-noir/KindIcon";
import {
  formatFuzzyDate,
  kindLabel,
  sideLabel,
  type WarEvent,
} from "@/lib/wars-types";

export default function EventHero({ event }: { event: WarEvent }) {
  const { locale } = useLocale();
  return (
    <header className="flex items-start gap-4 mb-4">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-[14px]"
        style={{
          border: "1px solid var(--war-gold)",
          color: "var(--war-gold)",
          background: "var(--war-ink)",
        }}
      >
        {event.order}
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="font-mono text-[10px] uppercase tracking-[0.22em] flex items-center gap-2 flex-wrap"
          style={{ color: "var(--war-paper-3)" }}
        >
          <KindIcon kind={event.kind} size={12} />
          <span>{formatFuzzyDate(event.date)}</span>
          {event.dateEnd && <span>– {formatFuzzyDate(event.dateEnd)}</span>}
          <span>· {kindLabel(event.kind, locale)}</span>
          <span>· {sideLabel(event.side, locale)}</span>
        </div>
        <h2
          className="font-serif text-[22px] leading-tight mt-1"
          style={{ color: "var(--war-paper)" }}
        >
          {locale === "tr" && event.nameTr ? event.nameTr : event.name}
        </h2>
      </div>
    </header>
  );
}
