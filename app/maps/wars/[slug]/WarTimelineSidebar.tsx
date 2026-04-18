"use client";

import { useLocale } from "@/components/LocaleProvider";
import KindIcon from "@/components/wars-noir/KindIcon";
import {
  formatFuzzyDate,
  kindLabel,
  type WarEvent,
} from "@/lib/wars-types";

type Props = {
  events: WarEvent[];
  activeId: string | null;
  onSelect: (e: WarEvent) => void;
};

export default function WarTimelineSidebar({
  events,
  activeId,
  onSelect,
}: Props) {
  const { locale } = useLocale();

  return (
    <aside
      data-map="wars"
      className="hidden md:flex flex-col absolute z-20 top-4 left-4 w-[320px] max-h-[calc(100%-2rem)] rounded-xl border backdrop-blur-md"
      style={{
        borderColor: "var(--war-rule)",
        background: "rgba(20,20,20,0.85)",
      }}
    >
      <div
        className="p-4 border-b"
        style={{ borderColor: "var(--war-rule)" }}
      >
        <div
          className="font-mono text-[10px] uppercase tracking-[0.25em]"
          style={{ color: "var(--war-paper-3)" }}
        >
          § {events.length} {locale === "tr" ? "olay" : "events"}
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto p-2 space-y-0.5 min-h-0">
        {events.map((e) => {
          const active = activeId === e.id;
          return (
            <li key={e.id}>
              <button
                onClick={() => onSelect(e)}
                className="w-full text-left flex items-start gap-2.5 px-2 py-2 rounded transition"
                style={{
                  background: active ? "var(--war-ink-3)" : "transparent",
                  boxShadow: active
                    ? "inset 0 0 0 1px var(--war-gold)"
                    : "none",
                  color: "var(--war-paper)",
                }}
              >
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-mono flex-shrink-0 mt-0.5"
                  style={{
                    color: active
                      ? "var(--war-gold)"
                      : "var(--war-paper-2)",
                    border: `1px solid ${
                      active ? "var(--war-gold)" : "var(--war-rule)"
                    }`,
                  }}
                  aria-label={`#${e.order}`}
                >
                  {e.order}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] leading-tight">
                    {locale === "tr" && e.nameTr ? e.nameTr : e.name}
                  </div>
                  <div
                    className="font-mono text-[10px] uppercase tracking-[0.12em] mt-0.5 flex items-center gap-1.5"
                    style={{ color: "var(--war-paper-3)" }}
                  >
                    <KindIcon kind={e.kind} size={11} />
                    {formatFuzzyDate(e.date)} · {kindLabel(e.kind, locale)}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
