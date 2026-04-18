"use client";

import { useEffect } from "react";
import BottomSheet from "@/components/wars-noir/BottomSheet";
import EventHero from "./EventHero";
import EventStats from "./EventStats";
import EventStory from "./EventStory";
import EventPhoto from "./EventPhoto";
import EventNav from "./EventNav";
import type { War, WarEvent } from "@/lib/wars-types";

type Props = {
  war: War;
  events: WarEvent[];
  activeId: string | null;
  onSelect: (e: WarEvent) => void;
  onClose: () => void;
};

export default function WarBottomSheet({
  war,
  events,
  activeId,
  onSelect,
  onClose,
}: Props) {
  const idx = activeId ? events.findIndex((e) => e.id === activeId) : -1;
  const active = idx >= 0 ? events[idx] : null;
  const prev = idx > 0 ? events[idx - 1] : null;
  const next = idx >= 0 && idx < events.length - 1 ? events[idx + 1] : null;

  // Arrow-key navigation while a sheet is open
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prev) {
        e.preventDefault();
        onSelect(prev);
      }
      if (e.key === "ArrowRight" && next) {
        e.preventDefault();
        onSelect(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, prev, next, onSelect]);

  return (
    <BottomSheet open={!!active} onClose={onClose} heightVh={45}>
      {active && (
        <div data-map="wars" className="px-5 md:px-8 pb-6">
          <div className="max-w-[640px] mx-auto">
            <EventNav
              prev={prev}
              next={next}
              onPrev={() => prev && onSelect(prev)}
              onNext={() => next && onSelect(next)}
            />
            <EventHero event={active} war={war} />
            <EventPhoto event={active} />
            <EventStats event={active} war={war} />
            <EventStory event={active} />
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
