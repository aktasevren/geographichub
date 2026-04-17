"use client";

import { useEffect, useState } from "react";
import type { WarEvent } from "@/lib/wars-types";

function titleFromUrl(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/\/wiki\/([^?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export default function EventPhoto({ event }: { event: WarEvent }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    const title =
      titleFromUrl(event.wikipediaEn) || titleFromUrl(event.wikipediaTr);
    if (!title) {
      setSrc(null);
      return;
    }
    const host = event.wikipediaEn ? "en.wikipedia.org" : "tr.wikipedia.org";
    fetch(
      `https://${host}/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancel || !d) return;
        const s = d?.thumbnail?.source || d?.originalimage?.source;
        if (s) setSrc(s);
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, [event.id, event.wikipediaEn, event.wikipediaTr]);

  if (!src) return null;

  return (
    <div
      className="aspect-[16/9] overflow-hidden rounded-md mb-4 border"
      style={{ borderColor: "var(--war-rule)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={event.id}
        src={src}
        alt={event.name}
        className="w-full h-full object-cover"
        style={{
          filter: "grayscale(100%) contrast(1.2) brightness(0.95)",
          animation: "warKenBurns 6s ease-out forwards",
        }}
      />
      <style jsx>{`
        @keyframes warKenBurns {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.04);
          }
        }
      `}</style>
    </div>
  );
}
