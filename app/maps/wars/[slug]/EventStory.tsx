"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { WarEvent } from "@/lib/wars-types";

export default function EventStory({ event }: { event: WarEvent }) {
  const { locale } = useLocale();
  const text = locale === "tr" ? event.storyTr : event.story;
  if (!text) return null;

  const first = text.charAt(0);
  const rest = text.slice(1);

  return (
    <p
      className="font-sans text-[14px] leading-[1.7]"
      style={{ color: "var(--war-paper)" }}
    >
      <span
        className="float-left font-serif italic mr-2 mt-1 leading-[0.85]"
        style={{ fontSize: "44px", color: "var(--war-gold)" }}
      >
        {first}
      </span>
      {rest}
    </p>
  );
}
