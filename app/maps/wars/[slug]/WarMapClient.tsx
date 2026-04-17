"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteLogo from "@/components/SiteLogo";
import { LocaleToggle, useLocale } from "@/components/LocaleProvider";
import WarGlobe from "./WarGlobe";
import WarTimelineSidebar from "./WarTimelineSidebar";
import WarTimelineStrip from "./WarTimelineStrip";
import WarSidesHero from "./WarSidesHero";
import WarBottomSheet from "./WarBottomSheet";
import {
  parseFuzzyDate,
  type War,
  type WarEvent,
} from "@/lib/wars-types";

export default function WarMapClient({ war }: { war: War }) {
  const { locale } = useLocale();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const onR = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight - 64 });
    onR();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const events = useMemo(
    () =>
      [...war.events].sort(
        (a, b) =>
          a.order - b.order ||
          parseFuzzyDate(a.date).t - parseFuzzyDate(b.date).t
      ),
    [war.events]
  );

  // Log-normalised casualty scale (0..1) per event id — drives marker size
  const casualtyScale = useMemo(() => {
    const m: Record<string, number> = {};
    let max = 0;
    for (const e of events) {
      const c = (e.casualties?.sideA ?? 0) + (e.casualties?.sideB ?? 0);
      if (c > max) max = c;
    }
    const logMax = Math.log1p(max);
    for (const e of events) {
      const c = (e.casualties?.sideA ?? 0) + (e.casualties?.sideB ?? 0);
      m[e.id] = logMax > 0 ? Math.log1p(c) / logMax : 0;
    }
    return m;
  }, [events]);

  const handleSelect = (e: WarEvent) => setActiveId(e.id);

  return (
    <div
      data-map="wars"
      className="relative min-h-screen overflow-hidden"
      style={{ background: "var(--war-ink)", color: "var(--war-paper)" }}
    >
      <header
        className="absolute top-0 left-0 right-0 z-40"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,10,0.95), transparent)",
        }}
      >
        <div className="flex justify-between items-center px-4 md:px-8 py-3 md:py-4">
          <SiteLogo />
          <div className="flex items-center gap-4">
            <Link
              href="/maps/wars"
              className="font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: "var(--war-paper-2)" }}
            >
              ← {locale === "tr" ? "Tüm savaşlar" : "All wars"}
            </Link>
            <LocaleToggle />
          </div>
        </div>
      </header>

      <WarSidesHero war={war} />

      {size.w > 0 && (
        <WarGlobe
          events={events}
          activeId={activeId}
          onSelect={handleSelect}
          width={size.w}
          height={size.h}
          casualtyScale={casualtyScale}
        />
      )}

      <WarTimelineSidebar
        events={events}
        activeId={activeId}
        onSelect={handleSelect}
      />
      <WarTimelineStrip
        events={events}
        activeId={activeId}
        onSelect={handleSelect}
      />

      <WarBottomSheet
        events={events}
        activeId={activeId}
        onSelect={handleSelect}
        onClose={() => setActiveId(null)}
      />
    </div>
  );
}
