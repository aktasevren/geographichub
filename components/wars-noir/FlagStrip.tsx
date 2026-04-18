import * as React from "react";
import { wn } from "./theme";

// Local minimal types — only the fields needed by FlagStrip. The shared
// WarSide in lib/wars-types.ts will absorb this shape during the migration.
type FlagFallback = "coat" | "emblem";

type WarSideCountry = {
  name: string;
  nameTr: string;
  flagUrl?: string;
  flagFallback?: FlagFallback;
};

export type WarSide = {
  id: "A" | "B" | "C";
  label: string;
  labelTr: string;
  countries: WarSideCountry[];
  commanders: string[];
  result: "victor" | "defeated" | "withdrew" | "dissolved";
};

type Props = {
  side: WarSide;
  align?: "left" | "right";
  locale?: "tr" | "en";
  className?: string;
};

/**
 * Gold-stroke coat fallback — used when a flag has no period-accurate
 * image. Renders a simple shield outline with a two-letter monogram.
 */
function CoatFallback({ monogram }: { monogram: string }) {
  return (
    <svg
      viewBox="0 0 48 32"
      width={48}
      height={32}
      role="img"
      aria-label={`${monogram} coat`}
      className="war-flag block"
      style={{
        aspectRatio: "3 / 2",
        background: "var(--war-ink-2)",
      }}
    >
      {/* Shield outline */}
      <path
        d="M24 3 L42 8 V16 C42 22 34 28 24 30 C14 28 6 22 6 16 V8 Z"
        fill="none"
        stroke="var(--war-gold)"
        strokeWidth={1.2}
      />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fontFamily="var(--font-mono, monospace)"
        fontSize="10"
        fill="var(--war-gold)"
        letterSpacing="1"
      >
        {monogram}
      </text>
    </svg>
  );
}

function pickName(c: WarSideCountry, locale: "tr" | "en"): string {
  return locale === "tr" && c.nameTr ? c.nameTr : c.name;
}

function pickLabel(side: WarSide, locale: "tr" | "en"): string {
  return locale === "tr" && side.labelTr ? side.labelTr : side.label;
}

function resultLabel(
  r: WarSide["result"],
  locale: "tr" | "en",
): string {
  const tr: Record<WarSide["result"], string> = {
    victor: "GALİP",
    defeated: "MAĞLUP",
    withdrew: "ÇEKİLDİ",
    dissolved: "DAĞILDI",
  };
  const en: Record<WarSide["result"], string> = {
    victor: "VICTOR",
    defeated: "DEFEATED",
    withdrew: "WITHDREW",
    dissolved: "DISSOLVED",
  };
  return (locale === "tr" ? tr : en)[r];
}

/**
 * Grayscale flags + country name(s) + commander list (§4.5).
 * Hovering the group lifts the grayscale filter over 300ms.
 * `flagFallback === "coat"` renders a gold-stroke SVG monogram instead
 * of an <img>.
 */
function FlagStrip({
  side,
  align = "left",
  locale = "en",
  className,
}: Props) {
  const isRight = align === "right";

  return (
    <div
      className={wn(
        "war-flag-group flex flex-col gap-3",
        isRight ? "items-end text-right" : "items-start text-left",
        className,
      )}
    >
      {/* Flag row */}
      <div
        className={wn(
          "flex items-center gap-2",
          isRight ? "flex-row-reverse" : "flex-row",
        )}
      >
        {side.countries.map((c, i) => {
          const monogram = c.name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "??";
          if (c.flagFallback === "coat" || !c.flagUrl) {
            return <CoatFallback key={`${c.name}-${i}`} monogram={monogram} />;
          }
          return (
            // Using <img> intentionally — Wikimedia SVG flags do not benefit
            // from next/image optimization and we need the grayscale filter
            // on the raw element.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${c.name}-${i}`}
              src={c.flagUrl}
              alt={`${pickName(c, locale)} flag`}
              className="war-flag"
              loading="lazy"
              decoding="async"
              width={48}
              height={32}
            />
          );
        })}
      </div>

      {/* Side label + result badge */}
      <div
        className={wn(
          "flex items-baseline gap-2",
          isRight ? "flex-row-reverse" : "flex-row",
        )}
      >
        <span
          style={{
            fontFamily: "var(--font-serif, serif)",
            fontStyle: "italic",
            fontWeight: 300,
            color: "var(--war-paper)",
            fontSize: 20,
            lineHeight: 1.15,
          }}
        >
          {pickLabel(side, locale)}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 10,
            letterSpacing: "0.25em",
            color:
              side.result === "victor"
                ? "var(--war-gold)"
                : "var(--war-paper-3)",
            textTransform: "uppercase",
          }}
        >
          {resultLabel(side.result, locale)}
        </span>
      </div>

      {/* Country names list */}
      <ul
        className={wn(
          "flex flex-wrap gap-x-3 gap-y-1",
          isRight ? "justify-end" : "justify-start",
        )}
        style={{
          fontFamily: "var(--font-sans, sans-serif)",
          color: "var(--war-paper-2)",
          fontSize: 13,
        }}
      >
        {side.countries.map((c, i) => (
          <li key={`n-${c.name}-${i}`}>{pickName(c, locale)}</li>
        ))}
      </ul>

      {/* Commanders */}
      {side.commanders.length > 0 && (
        <div
          className={wn("flex flex-col gap-0.5", isRight ? "items-end" : "items-start")}
        >
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 10,
              letterSpacing: "0.25em",
              color: "var(--war-paper-3)",
              textTransform: "uppercase",
            }}
          >
            {locale === "tr" ? "Komutanlar" : "Commanders"}
          </span>
          <ul
            className={wn("flex flex-col gap-0.5")}
            style={{
              fontFamily: "var(--font-serif, serif)",
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--war-paper)",
              fontSize: 14,
            }}
          >
            {side.commanders.map((cmd, i) => (
              <li key={`c-${i}-${cmd}`}>{cmd}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FlagStrip;
