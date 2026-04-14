"use client";

import { useState } from "react";

type Props = {
  title: string;
  text: string;
  url?: string;
  className?: string;
  label?: string;
  variant?: "primary" | "ghost";
};

export default function ShareButton({
  title,
  text,
  url,
  className = "",
  label = "Paylaş",
  variant = "ghost",
}: Props) {
  const [copied, setCopied] = useState(false);
  const targetUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  const handleShare = async () => {
    const shareData = { title, text, url: targetUrl };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (e) {
        // user cancelled
      }
    }
    // fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${text} ${targetUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const base =
    "inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] transition";
  const variants =
    variant === "primary"
      ? "px-4 py-2 rounded-full bg-[var(--accent)] text-black font-semibold shadow-lg shadow-black/30 hover:gap-3"
      : "px-3 py-1.5 rounded-full border border-current/30 hover:bg-current/10";

  return (
    <button onClick={handleShare} className={`${base} ${variants} ${className}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {copied ? "Kopyalandı" : label}
    </button>
  );
}
