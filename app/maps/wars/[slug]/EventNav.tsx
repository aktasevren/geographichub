"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { WarEvent } from "@/lib/wars-types";

type Props = {
  prev: WarEvent | null;
  next: WarEvent | null;
  onPrev: () => void;
  onNext: () => void;
};

export default function EventNav({ prev, next, onPrev, onNext }: Props) {
  const { locale } = useLocale();
  const name = (e: WarEvent) =>
    locale === "tr" && e.nameTr ? e.nameTr : e.name;

  return (
    <nav
      className="flex items-center justify-between gap-3 pb-2 mb-3 border-b font-mono text-[10px] uppercase tracking-[0.22em]"
      style={{
        borderColor: "var(--war-rule)",
        color: "var(--war-paper-3)",
      }}
    >
      <button
        onClick={onPrev}
        disabled={!prev}
        className="flex items-center gap-2 disabled:opacity-30 hover:text-[var(--war-gold)] transition min-w-0 max-w-[48%]"
        aria-label={locale === "tr" ? "Önceki olay" : "Previous event"}
      >
        <span aria-hidden>←</span>
        <span className="truncate">
          {prev ? name(prev) : locale === "tr" ? "yok" : "none"}
        </span>
      </button>
      <button
        onClick={onNext}
        disabled={!next}
        className="flex items-center gap-2 disabled:opacity-30 hover:text-[var(--war-gold)] transition min-w-0 max-w-[48%] justify-end"
        aria-label={locale === "tr" ? "Sonraki olay" : "Next event"}
      >
        <span className="truncate">
          {next ? name(next) : locale === "tr" ? "yok" : "none"}
        </span>
        <span aria-hidden>→</span>
      </button>
    </nav>
  );
}
