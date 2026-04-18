"use client";

import * as React from "react";
import KindIcon from "@/components/wars-noir/KindIcon";
import NumberedMarker from "@/components/wars-noir/NumberedMarker";
import FlagStrip, { type WarSide } from "@/components/wars-noir/FlagStrip";
import BottomSheet from "@/components/wars-noir/BottomSheet";
import WarCard, { type WarIndexEntry } from "@/components/wars-noir/WarCard";

// --- Mock data ---------------------------------------------------------

const MOCK_WAR_SIDE_A: WarSide = {
  id: "A",
  label: "Entente Powers",
  labelTr: "İtilaf Devletleri",
  countries: [
    {
      name: "France",
      nameTr: "Fransa",
      flagUrl:
        "https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg",
    },
    {
      name: "United Kingdom",
      nameTr: "Birleşik Krallık",
      flagUrl:
        "https://upload.wikimedia.org/wikipedia/commons/a/ae/Flag_of_the_United_Kingdom.svg",
    },
    {
      name: "Russian Empire",
      nameTr: "Rus İmparatorluğu",
      flagFallback: "coat",
    },
  ],
  commanders: ["Joffre", "Haig", "Brusilov"],
  result: "victor",
};

const MOCK_WAR_SIDE_B: WarSide = {
  id: "B",
  label: "Central Powers",
  labelTr: "İttifak Devletleri",
  countries: [
    {
      name: "German Empire",
      nameTr: "Alman İmparatorluğu",
      flagFallback: "coat",
    },
    {
      name: "Austria-Hungary",
      nameTr: "Avusturya-Macaristan",
      flagFallback: "coat",
    },
    {
      name: "Ottoman Empire",
      nameTr: "Osmanlı İmparatorluğu",
      flagFallback: "coat",
    },
  ],
  commanders: ["Hindenburg", "Conrad", "Enver Paşa"],
  result: "defeated",
};

const MOCK_EVENT = {
  id: "somme-1916",
  order: 3,
  kind: "battle" as const,
  name: "Battle of the Somme",
  nameTr: "Somme Muharebesi",
  date: "1916-07-01",
  summary:
    "First-day British casualties: 57,470 — the bloodiest single day in the history of the British Army.",
};

const MOCK_INDEX_ENTRY: WarIndexEntry = {
  slug: "world-war-1",
  name: "The Great War",
  nameTr: "Büyük Savaş",
  startYear: 1914,
  endYear: 1918,
  eventCount: 28,
  blurb:
    "Four empires fell. The map of Europe, the Middle East, and global order were redrawn in blood and ink.",
  blurbTr:
    "Dört imparatorluk çöktü. Avrupa, Orta Doğu ve küresel düzenin haritası kanla yeniden çizildi.",
  era: "20th-century",
  region: "global",
  sideAFlagUrl:
    "https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg",
  sideBFlagUrl:
    "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_the_German_Empire.svg",
  militaryDead: 9700000,
};

const MARKER_PREVIEW = [
  { order: 1, kind: "landing" as const, casualtyScale: 0.2, active: false },
  { order: 2, kind: "battle" as const, casualtyScale: 0.6, active: true },
  { order: 3, kind: "treaty" as const, casualtyScale: 0.9, active: false },
];

const KIND_PREVIEW = [
  "battle",
  "siege",
  "congress",
  "treaty",
  "occupation",
  "liberation",
  "armistice",
  "landing",
  "event",
] as const;

// --- Page --------------------------------------------------------------

export default function MockupClient() {
  const [open, setOpen] = React.useState<boolean>(true);
  const [locale, setLocale] = React.useState<"tr" | "en">("en");

  return (
    <div
      data-map="wars"
      className="min-h-screen war-grain war-vignette"
      style={{
        background: "var(--war-ink)",
        color: "var(--war-paper)",
      }}
    >
      {/* Header band */}
      <header
        className="war-hair-b"
        style={{
          borderBottomWidth: 1,
          borderBottomStyle: "solid",
          padding: "32px 32px 24px",
        }}
      >
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--war-paper-3)",
              }}
            >
              § WARS-NOIR · DEV MOCKUP
            </div>
            <h1
              style={{
                fontFamily: "var(--font-serif, serif)",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: 48,
                lineHeight: 1.05,
                color: "var(--war-paper)",
                margin: "6px 0 0",
              }}
            >
              Turning Points <span style={{ color: "var(--war-gold)" }}>·</span>{" "}
              Black &amp; White
            </h1>
            <p
              style={{
                fontFamily: "var(--font-sans, sans-serif)",
                color: "var(--war-paper-2)",
                fontSize: 14,
                marginTop: 8,
                maxWidth: 620,
              }}
            >
              Component playground for the noir upgrade. Hover any flag to
              watch it bleed back into color. Click the marker with the gold
              ring to feel the pulse.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 10,
                letterSpacing: "0.25em",
                color: "var(--war-paper-3)",
                textTransform: "uppercase",
              }}
            >
              Locale
            </span>
            <button
              type="button"
              onClick={() => setLocale("en")}
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 11,
                letterSpacing: "0.25em",
                color: locale === "en" ? "var(--war-gold)" : "var(--war-paper-3)",
                background: "transparent",
                border: 0,
                cursor: "pointer",
              }}
            >
              EN
            </button>
            <span style={{ color: "var(--war-paper-3)" }}>/</span>
            <button
              type="button"
              onClick={() => setLocale("tr")}
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 11,
                letterSpacing: "0.25em",
                color: locale === "tr" ? "var(--war-gold)" : "var(--war-paper-3)",
                background: "transparent",
                border: 0,
                cursor: "pointer",
              }}
            >
              TR
            </button>
          </div>
        </div>
      </header>

      <main style={{ padding: "40px 32px 80px" }} className="flex flex-col gap-16">
        {/* KindIcon gallery */}
        <section>
          <SectionTitle
            number="01"
            title="KindIcon"
            caption="Nine stroke-only glyphs — stroke='currentColor'"
          />
          <div className="flex flex-wrap gap-8 mt-6">
            {KIND_PREVIEW.map((k) => (
              <div
                key={k}
                className="flex flex-col items-center gap-2"
                style={{ minWidth: 72 }}
              >
                <div
                  style={{
                    color: "var(--war-paper)",
                    padding: 12,
                    border: "1px solid var(--war-rule)",
                    background: "var(--war-ink-2)",
                  }}
                >
                  <KindIcon kind={k} size={28} />
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: 10,
                    letterSpacing: "0.25em",
                    color: "var(--war-paper-3)",
                    textTransform: "uppercase",
                  }}
                >
                  {k}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* NumberedMarker trio */}
        <section>
          <SectionTitle
            number="02"
            title="NumberedMarker"
            caption="32–56px scaled by casualties · active gets gold pulse"
          />
          <div className="flex flex-wrap gap-12 mt-8 items-end">
            {MARKER_PREVIEW.map((m) => (
              <div key={m.order} className="flex flex-col items-center gap-3">
                <NumberedMarker
                  order={m.order}
                  kind={m.kind}
                  active={m.active}
                  casualtyScale={m.casualtyScale}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: 10,
                    letterSpacing: "0.25em",
                    color: "var(--war-paper-3)",
                    textTransform: "uppercase",
                  }}
                >
                  scale {m.casualtyScale.toFixed(1)}
                  {m.active ? " · active" : ""}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* FlagStrip pair */}
        <section>
          <SectionTitle
            number="03"
            title="FlagStrip"
            caption="Grayscale belligerents · hover reveals color"
          />
          <div
            className="grid gap-10 mt-8"
            style={{
              gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)",
              alignItems: "start",
            }}
          >
            <FlagStrip side={MOCK_WAR_SIDE_A} align="left" locale={locale} />
            <div
              style={{
                fontFamily: "var(--font-serif, serif)",
                fontStyle: "italic",
                color: "var(--war-paper-3)",
                fontSize: 24,
                alignSelf: "center",
              }}
            >
              vs.
            </div>
            <FlagStrip side={MOCK_WAR_SIDE_B} align="right" locale={locale} />
          </div>
        </section>

        {/* WarCard sample */}
        <section>
          <SectionTitle
            number="04"
            title="WarCard"
            caption="Selection-page tile · links to /maps/wars/<slug>"
          />
          <div
            className="grid gap-6 mt-8"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            }}
          >
            <WarCard war={MOCK_INDEX_ENTRY} locale={locale} />
            <WarCard
              war={{
                ...MOCK_INDEX_ENTRY,
                slug: "ww2",
                name: "Second World War",
                nameTr: "İkinci Dünya Savaşı",
                startYear: 1939,
                endYear: 1945,
                eventCount: 42,
                militaryDead: 25000000,
              }}
              locale={locale}
            />
            <WarCard
              war={{
                ...MOCK_INDEX_ENTRY,
                slug: "cold-war",
                name: "Cold War",
                nameTr: "Soğuk Savaş",
                startYear: 1947,
                endYear: 1991,
                eventCount: 18,
                militaryDead: undefined,
                sideAFlagUrl: undefined,
                sideBFlagUrl: undefined,
              }}
              locale={locale}
            />
          </div>
        </section>

        {/* BottomSheet */}
        <section>
          <SectionTitle
            number="05"
            title="BottomSheet"
            caption="Generic primitive · ESC closes · swipe-down on mobile"
          />
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 11,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--war-paper)",
                background: "var(--war-ink-2)",
                border: "1px solid var(--war-gold-dim)",
                padding: "10px 18px",
                cursor: "pointer",
              }}
            >
              {open ? "Close Sheet" : "Open Sheet"}
            </button>
          </div>
        </section>
      </main>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        ariaLabel="Event detail mockup"
      >
        <div className="flex flex-col gap-4 pt-2" style={{ maxWidth: 720 }}>
          <div
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--war-gold)",
            }}
          >
            § 01 JUL 1916 · NORTHERN FRANCE
          </div>
          <h2
            style={{
              fontFamily: "var(--font-serif, serif)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: 36,
              color: "var(--war-paper)",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {MOCK_EVENT.name}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans, sans-serif)",
              fontSize: 15,
              lineHeight: 1.65,
              color: "var(--war-paper-2)",
              margin: 0,
            }}
          >
            {MOCK_EVENT.summary} A full event story would extend to 200–400
            words here, opening with a Fraunces drop-cap, wrapping across
            short paragraphs so nothing overflows the sheet on mobile. The
            body scrolls independently of the sheet shell.
          </p>
          <div
            className="flex gap-8 flex-wrap pt-2"
            style={{
              borderTop: "1px solid var(--war-rule)",
              paddingTop: 16,
            }}
          >
            <Stat label="Forces · A" value="460,000" />
            <Stat label="Forces · B" value="315,000" />
            <Stat label="Casualties" value="1,000,000+" tone="blood" />
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

function SectionTitle({
  number,
  title,
  caption,
}: {
  number: string;
  title: string;
  caption: string;
}) {
  return (
    <div className="flex items-baseline gap-4 flex-wrap">
      <span
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 10,
          letterSpacing: "0.3em",
          color: "var(--war-gold)",
        }}
      >
        § {number}
      </span>
      <h2
        style={{
          fontFamily: "var(--font-serif, serif)",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: 28,
          color: "var(--war-paper)",
          margin: 0,
        }}
      >
        {title}
      </h2>
      <span
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 10,
          letterSpacing: "0.25em",
          color: "var(--war-paper-3)",
          textTransform: "uppercase",
        }}
      >
        {caption}
      </span>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "gold" | "blood";
}) {
  const color =
    tone === "blood"
      ? "var(--war-blood)"
      : tone === "gold"
        ? "var(--war-gold)"
        : "var(--war-paper)";
  return (
    <div className="flex flex-col gap-1">
      <span
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 9,
          letterSpacing: "0.3em",
          color: "var(--war-paper-3)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 20,
          color,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}
