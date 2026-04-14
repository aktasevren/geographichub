"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import PageHeader from "@/components/PageHeader";

export default function AboutPage() {
  const { t, locale } = useLocale();

  const sources = [
    "Wikipedia & Wikimedia Commons (CC BY-SA 4.0)",
    "Wikidata (CC0)",
    "Natural Earth — ülke sınırları (Public Domain)",
    "passport-index-dataset — vize kuralları (MIT)",
    "Where The ISS At? — canlı ISS API",
    "CelesTrak — yörünge TLE",
    "Open Notify — canlı ISS mürettebatı",
    "BigDataCloud — reverse geocoding (free tier)",
    "Nominatim / OpenStreetMap (ODbL)",
    "satellite.js — SGP4 (MIT)",
    "react-globe.gl / Three.js / D3 (MIT)",
    "Fraunces, Inter, JetBrains Mono (SIL OFL / Apache 2.0)",
  ];

  return (
    <div className="min-h-screen grain">
      <PageHeader
        theme="light"
        breadcrumbs={[
          { label: t("common.home"), href: "/" },
          { label: t("nav.about") },
        ]}
      />

      <section className="max-w-[820px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] mb-4">
          {t("about.tag")}
        </div>
        <h1 className="font-serif font-light text-4xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight">
          {t("about.title1")}{" "}
          <span className="italic" style={{ color: "var(--accent)" }}>
            {t("about.title2")}
          </span>
        </h1>

        <div className="mt-10 space-y-5 text-[17px] leading-relaxed text-[var(--text-2)]">
          <p>{t("home.aboutBodyA")}</p>
          <p>{t("home.aboutBodyB")}</p>

          <h2 className="font-serif text-2xl md:text-3xl mt-10 pt-6 border-t border-[var(--line)]">
            {t("about.ruleTitle")}
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-2">
            <li>{t("about.rule1")}</li>
            <li>{t("about.rule2")}</li>
            <li>{t("about.rule3")}</li>
            <li>{t("about.rule4")}</li>
          </ul>

          <h2 className="font-serif text-2xl md:text-3xl mt-10 pt-6 border-t border-[var(--line)]">
            {t("about.sources")}
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-1.5">
            {sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <h2 className="font-serif text-2xl md:text-3xl mt-10 pt-6 border-t border-[var(--line)]">
            {t("about.trademarkTitle")}
          </h2>
          <p>
            {t("about.trademarkBody")}{" "}
            <Link
              href="/legal/trademarks"
              className="underline decoration-[var(--text-2)]"
            >
              {t("about.trademarkLink")}
            </Link>
            .
          </p>
        </div>
      </section>

      <footer className="px-6 md:px-10 py-8 hair-t flex flex-wrap justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        <Link href="/" className="hover:text-[var(--text)]">
          ← {t("nav.home")}
        </Link>
      </footer>
    </div>
  );
}
