"use client";

import type { WarEvent } from "@/lib/wars-types";

type Props = {
  events: WarEvent[];
  activeId: string | null;
  onSelect: (e: WarEvent) => void;
};

export default function WarTimelineStrip({
  events,
  activeId,
  onSelect,
}: Props) {
  return (
    <div
      data-map="wars"
      className="md:hidden absolute top-[62px] left-0 right-0 z-20 overflow-x-auto px-3 py-2 flex gap-2"
      style={{
        background:
          "linear-gradient(to bottom, var(--war-ink) 70%, transparent)",
      }}
    >
      {events.map((e) => {
        const active = activeId === e.id;
        return (
          <button
            key={e.id}
            onClick={() => onSelect(e)}
            className="flex-shrink-0 w-9 h-9 rounded-full font-mono text-[12px] grid place-items-center transition"
            style={{
              background: active ? "var(--war-gold)" : "var(--war-ink-2)",
              color: active ? "var(--war-ink)" : "var(--war-paper-2)",
              border: `1px solid ${
                active ? "var(--war-gold)" : "var(--war-rule)"
              }`,
            }}
            aria-label={`${e.order}: ${e.name}`}
          >
            {e.order}
          </button>
        );
      })}
    </div>
  );
}
