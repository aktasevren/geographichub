import * as React from "react";
import Link from "next/link";
import { wn } from "./theme";

// Local minimal index-entry shape. The sideA/sideB flag URL hints are
// extended fields the real WarIndexEntry may or may not carry yet — the
// card degrades gracefully when they are missing.
export type WarIndexEntry = {
  slug: string;
  name: string;
  nameTr?: string;
  startYear: number;
  endYear: number;
  eventCount: number;
  blurb: string;
  blurbTr?: string;
  era?: string;
  region?: string;
  tags?: string[];
  sideAFlagUrl?: string;
  sideBFlagUrl?: string;
  militaryDead?: number;
};

type Props = {
  war: WarIndexEntry;
  locale?: "tr" | "en";
  className?: string;
};

function pickName(w: WarIndexEntry, locale: "tr" | "en"): string {
  return locale === "tr" && w.nameTr ? w.nameTr : w.name;
}
function pickBlurb(w: WarIndexEntry, locale: "tr" | "en"): string {
  return locale === "tr" && w.blurbTr ? w.blurbTr : w.blurb;
}

function formatNumber(n: number, locale: "tr" | "en"): string {
  try {
    return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US").format(n);
  } catch {
    return String(n);
  }
}

/**
 * Selection-page tile per spec §6.
 * - Grayscale side-A vs side-B flags (if the index provides URLs)
 * - Mono meta line: "§ YEAR–YEAR · N EVENTS"
 * - Fraunces italic title
 * - Optional gold military-dead count
 * - Uses next/link to /maps/wars/<slug>
 */
function WarCard({ war, locale = "en", className }: Props) {
  const eventsLabel = locale === "tr" ? "olay" : "events";
  const deadLabel =
    locale === "tr" ? "Askeri Kayıp" : "Military Dead";
  const openLabel = locale === "tr" ? "Haritayı Aç" : "Open Map";

  return (
    <Link
      href={`/maps/wars/${war.slug}`}
      className={wn(
        "group block no-underline",
        className,
      )}
      style={{ color: "inherit" }}
    >
      <article
        className={wn(
          "war-flag-group",
          "flex flex-col gap-4 p-5 sm:p-6",
          "transition-colors",
        )}
        style={{
          background: "var(--war-ink-2)",
          border: "1px solid var(--war-rule)",
          minHeight: 260,
        }}
      >
        {/* Flags strip — only renders if we have at least one URL. */}
        <div
          className="flex items-center gap-2"
          style={{ minHeight: 32 }}
        >
          {war.sideAFlagUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={war.sideAFlagUrl}
              alt=""
              className="war-flag"
              loading="lazy"
              decoding="async"
              width={48}
              height={32}
            />
          ) : null}
          {(war.sideAFlagUrl || war.sideBFlagUrl) && (
            <span
              aria-hidden
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 10,
                letterSpacing: "0.25em",
                color: "var(--war-paper-3)",
              }}
            >
              VS
            </span>
          )}
          {war.sideBFlagUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={war.sideBFlagUrl}
              alt=""
              className="war-flag"
              loading="lazy"
              decoding="async"
              width={48}
              height={32}
            />
          ) : null}
        </div>

        {/* Meta line */}
        <div
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 10,
            letterSpacing: "0.25em",
            color: "var(--war-paper-3)",
            textTransform: "uppercase",
          }}
        >
          <span style={{ color: "var(--war-gold)" }}>§ </span>
          {war.startYear}&ndash;{war.endYear}
          <span> · </span>
          {war.eventCount} {eventsLabel}
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: "var(--font-serif, serif)",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: 28,
            lineHeight: 1.1,
            color: "var(--war-paper)",
            margin: 0,
          }}
        >
          {pickName(war, locale)}
        </h3>

        {/* Blurb */}
        <p
          style={{
            fontFamily: "var(--font-sans, sans-serif)",
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--war-paper-2)",
            margin: 0,
          }}
        >
          {pickBlurb(war, locale)}
        </p>

        {/* Footer: dead count + CTA */}
        <div
          className="flex items-center justify-between mt-auto pt-3 war-hair-t"
          style={{ borderTopWidth: 1, borderTopStyle: "solid" }}
        >
          {typeof war.militaryDead === "number" ? (
            <div className="flex flex-col">
              <span
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 9,
                  letterSpacing: "0.25em",
                  color: "var(--war-paper-3)",
                  textTransform: "uppercase",
                }}
              >
                {deadLabel}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 18,
                  color: "var(--war-gold)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatNumber(war.militaryDead, locale)}
              </span>
            </div>
          ) : (
            <span />
          )}

          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 10,
              letterSpacing: "0.25em",
              color: "var(--war-paper-2)",
              textTransform: "uppercase",
            }}
            className="group-hover:text-[var(--war-gold)] transition-colors"
          >
            {openLabel} &rarr;
          </span>
        </div>
      </article>
    </Link>
  );
}

export default WarCard;
