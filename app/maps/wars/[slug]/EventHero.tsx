"use client";

import { useLocale } from "@/components/LocaleProvider";
import KindIcon from "@/components/wars-noir/KindIcon";
import {
  formatFuzzyDate,
  kindLabel,
  type War,
  type WarEvent,
  type WarSide,
} from "@/lib/wars-types";

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

/**
 * Outcome line: names which side won (and by implication which lost), or
 * flags a political/armistice/treaty event where there is no victor.
 */
function OutcomeLine({
  event,
  war,
  locale,
}: {
  event: WarEvent;
  war: War;
  locale: "tr" | "en";
}) {
  const sideA = war.sides[0];
  const sideB = war.sides[1];
  if (!sideA || !sideB) return null;

  if (event.side === "victory-a" || event.side === "victory-b") {
    const winner = event.side === "victory-a" ? sideA : sideB;
    const loser = event.side === "victory-a" ? sideB : sideA;
    return (
      <div
        className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em]"
        style={{ color: "var(--war-paper-3)" }}
      >
        <span
          className="inline-flex items-center gap-1.5"
          style={{ color: "var(--war-gold)" }}
        >
          <MiniFlag side={winner} />
          <span>{pickSideLabel(winner, locale)}</span>
          <span style={{ color: "var(--war-paper-3)" }}>
            · {locale === "tr" ? "galip" : "victor"}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MiniFlag side={loser} />
          <span style={{ color: "var(--war-paper-2)" }}>
            {pickSideLabel(loser, locale)}
          </span>
          <span>· {locale === "tr" ? "yenildi" : "defeated"}</span>
        </span>
      </div>
    );
  }

  const outcome: Record<string, { tr: string; en: string }> = {
    draw: { tr: "Kararsız", en: "Indecisive" },
    political: { tr: "Siyasi olay", en: "Political event" },
    occupation: { tr: "İşgal", en: "Occupation" },
    armistice: { tr: "Mütareke", en: "Armistice" },
    treaty: { tr: "Antlaşma", en: "Treaty" },
  };
  const label = outcome[event.side]?.[locale] ?? "";
  return (
    <div
      className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em]"
      style={{ color: "var(--war-paper-2)" }}
    >
      <MiniFlag side={sideA} />
      <MiniFlag side={sideB} />
      <span>· {label}</span>
    </div>
  );
}

export default function EventHero({
  event,
  war,
}: {
  event: WarEvent;
  war: War;
}) {
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
        </div>
        <h2
          className="font-serif text-[22px] leading-tight mt-1"
          style={{ color: "var(--war-paper)" }}
        >
          {locale === "tr" && event.nameTr ? event.nameTr : event.name}
        </h2>
        <OutcomeLine
          event={event}
          war={war}
          locale={locale as "tr" | "en"}
        />
      </div>
    </header>
  );
}
