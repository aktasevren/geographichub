"use client";

import * as React from "react";
import { wn } from "./theme";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /**
   * Override the sheet height (in vh). Defaults to 45vh on desktop and
   * 72vh on narrow viewports (<640px).
   */
  heightVh?: number;
  className?: string;
  /** Optional accessible label for the dialog itself. */
  ariaLabel?: string;
};

const OPEN_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const OPEN_MS = 280;
const SWIPE_DISMISS_PX = 80;

/**
 * Generic slide-up bottom sheet. Handles:
 *  - ESC closes (keydown effect)
 *  - 44px drag handle hit zone
 *  - Touch swipe-down on mobile → onClose
 *  - Responsive default height (72vh mobile, 45vh desktop)
 *  - Unmounts after exit animation so Tab order is clean
 */
function BottomSheet({
  open,
  onClose,
  children,
  heightVh,
  className,
  ariaLabel,
}: Props) {
  const [mounted, setMounted] = React.useState<boolean>(open);
  const [rendered, setRendered] = React.useState<boolean>(open);
  const [dragOffset, setDragOffset] = React.useState<number>(0);
  const touchStartY = React.useRef<number | null>(null);
  const sheetRef = React.useRef<HTMLDivElement | null>(null);

  // Detect narrow viewport to pick 72vh vs 45vh default.
  const [isNarrow, setIsNarrow] = React.useState<boolean>(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => setIsNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Mount lifecycle: animate in on open, unmount after transition on close.
  React.useEffect(() => {
    if (open) {
      setMounted(true);
      // Next frame to allow transform to animate from 100% → 0.
      const id = requestAnimationFrame(() => setRendered(true));
      return () => cancelAnimationFrame(id);
    }
    setRendered(false);
    const t = window.setTimeout(() => setMounted(false), OPEN_MS + 20);
    return () => window.clearTimeout(t);
  }, [open]);

  // ESC closes.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const effectiveHeight = heightVh ?? (isNarrow ? 72 : 45);
  const translateY = rendered ? Math.max(0, dragOffset) : window.innerHeight;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current == null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    // Only track downward drag from the handle area.
    if (delta > 0) setDragOffset(delta);
  };
  const onTouchEnd = () => {
    if (dragOffset > SWIPE_DISMISS_PX) {
      onClose();
    }
    touchStartY.current = null;
    setDragOffset(0);
  };

  return (
    <div
      aria-hidden={!open}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          opacity: rendered ? 1 : 0,
          transition: `opacity ${OPEN_MS}ms ${OPEN_EASE}`,
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={wn("relative", className)}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: `${effectiveHeight}vh`,
          background: "var(--war-ink-2)",
          borderTop: "1px solid var(--war-rule)",
          color: "var(--war-paper)",
          transform: `translateY(${translateY}px)`,
          transition:
            touchStartY.current == null
              ? `transform ${OPEN_MS}ms ${OPEN_EASE}`
              : "none",
          boxShadow: "0 -16px 48px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Drag handle — 44px hit zone for mobile swipe-down. */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            flexShrink: 0,
            touchAction: "none",
          }}
          aria-label="Drag handle"
          role="button"
          tabIndex={-1}
        >
          <div
            style={{
              width: 48,
              height: 4,
              borderRadius: 9999,
              background: "var(--war-paper-3)",
              opacity: 0.6,
            }}
          />
        </div>

        {/* Body — scrolls internally so long stories don't overflow. */}
        <div
          className="war-sheet-body"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            padding: "0 24px 32px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default BottomSheet;
