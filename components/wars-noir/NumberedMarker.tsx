import * as React from "react";
import KindIcon from "./KindIcon";
import { wn } from "./theme";

type WarEventKind =
  | "battle"
  | "siege"
  | "congress"
  | "treaty"
  | "occupation"
  | "liberation"
  | "armistice"
  | "landing"
  | "event";

type Props = {
  order: number;
  kind: WarEventKind;
  active?: boolean;
  /**
   * Normalized 0..1 casualty scale — interpolates marker diameter
   * between 32px (0) and 56px (1). Log-scaled upstream, linear here.
   */
  casualtyScale?: number;
  className?: string;
  onClick?: () => void;
  title?: string;
};

const MIN_SIZE = 32;
const MAX_SIZE = 56;

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/**
 * Numbered medallion used as globe marker + timeline chip.
 * Per spec §4.4: gold mono number on dark circle, hairline drop,
 * small <KindIcon>; active state gets a pulsing gold ring.
 */
function NumberedMarker({
  order,
  kind,
  active = false,
  casualtyScale = 0,
  className,
  onClick,
  title,
}: Props) {
  const t = clamp01(casualtyScale);
  const diameter = Math.round(MIN_SIZE + (MAX_SIZE - MIN_SIZE) * t);
  const numSize = Math.round(diameter * 0.38);
  const iconSize = Math.round(diameter * 0.32);
  const dropHeight = Math.max(6, Math.round(diameter * 0.18));
  const isInteractive = typeof onClick === "function";

  const medallionStyle: React.CSSProperties = {
    width: diameter,
    height: diameter,
    borderRadius: 9999,
    background: "var(--war-ink-2)",
    border: `2px solid ${active ? "var(--war-gold)" : "var(--war-gold-dim)"}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.55)",
    position: "relative",
    transition: "border-color 180ms ease, transform 180ms ease",
    color: active ? "var(--war-gold)" : "var(--war-paper-2)",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title || `Event ${order}`}
      aria-pressed={active || undefined}
      className={wn(
        "relative inline-flex flex-col items-center select-none",
        isInteractive ? "cursor-pointer" : "cursor-default",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--war-gold)] focus-visible:ring-offset-0 rounded-full",
        className,
      )}
      style={{ background: "transparent", padding: 0, border: 0 }}
      disabled={!isInteractive}
    >
      <span style={medallionStyle}>
        {/* Pulsing gold ring — only when active. */}
        {active && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: 9999,
              border: "2px solid var(--war-gold)",
              animation: "warPulse 1.6s ease-out infinite",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Gold mono order number. */}
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            color: "var(--war-gold)",
            fontSize: numSize,
            letterSpacing: "0.05em",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {String(order).padStart(2, "0")}
        </span>
      </span>

      {/* Hairline drop + kind glyph. */}
      <span
        aria-hidden
        style={{
          width: 1,
          height: dropHeight,
          background: active ? "var(--war-gold)" : "var(--war-gold-dim)",
          marginTop: 2,
        }}
      />
      <span
        aria-hidden
        style={{
          marginTop: 2,
          color: active ? "var(--war-gold)" : "var(--war-paper-2)",
          lineHeight: 0,
        }}
      >
        <KindIcon kind={kind} size={iconSize} />
      </span>
    </button>
  );
}

export default NumberedMarker;
