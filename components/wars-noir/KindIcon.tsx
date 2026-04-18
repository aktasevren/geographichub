import * as React from "react";
import { wn } from "./theme";

// Local minimal type — deliberately not imported from lib/wars-types.ts.
// Will be collapsed to the shared type during the migration phase.
export type WarEventKind =
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
  kind: WarEventKind;
  size?: number;
  className?: string;
  title?: string;
};

/**
 * Stroke-only hand-authored SVG glyphs, one per WarEventKind.
 * All paths use `stroke="currentColor"`, 1.2 strokeWidth, `fill="none"`
 * so callers control color via `color` / Tailwind text-* utilities.
 */
function KindIcon({ kind, size = 16, className, title }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: wn("inline-block shrink-0", className),
    "aria-hidden": title ? undefined : true,
    role: title ? "img" : undefined,
  };

  const label = title ? <title>{title}</title> : null;

  switch (kind) {
    // Crossed swords.
    case "battle":
      return (
        <svg {...common}>
          {label}
          <path d="M4 4l9 9" />
          <path d="M20 4l-9 9" />
          <path d="M11 13l-4 4" />
          <path d="M13 13l4 4" />
          <path d="M6 19l-2 1 1-2" />
          <path d="M18 19l2 1-1-2" />
          <circle cx="12" cy="12" r="0.6" />
        </svg>
      );

    // Castle tower silhouette.
    case "siege":
      return (
        <svg {...common}>
          {label}
          <path d="M5 20V10l2-2v2h2V8h2v2h2V8h2v2h2v10" />
          <path d="M4 20h16" />
          <path d="M10 20v-4h4v4" />
        </svg>
      );

    // Three classical columns.
    case "congress":
      return (
        <svg {...common}>
          {label}
          <path d="M3 6h18" />
          <path d="M3 20h18" />
          <path d="M5 6v14" />
          <path d="M12 6v14" />
          <path d="M19 6v14" />
          <path d="M3 4h18" />
        </svg>
      );

    // Scroll with hanging wax seal.
    case "treaty":
      return (
        <svg {...common}>
          {label}
          <path d="M5 5h11a2 2 0 012 2v8" />
          <path d="M5 5v10a2 2 0 002 2h8" />
          <path d="M8 9h7" />
          <path d="M8 12h5" />
          <circle cx="17" cy="18" r="2.2" />
        </svg>
      );

    // Square with diagonal X — seized / held.
    case "occupation":
      return (
        <svg {...common}>
          {label}
          <rect x="4.5" y="4.5" width="15" height="15" />
          <path d="M5 5l14 14" />
          <path d="M19 5L5 19" />
        </svg>
      );

    // Broken chain link — freedom / liberation.
    case "liberation":
      return (
        <svg {...common}>
          {label}
          <path d="M9.5 7.5a3 3 0 014.2 0l1 1" />
          <path d="M14.5 16.5a3 3 0 01-4.2 0l-1-1" />
          <path d="M8 10l-1 1a3 3 0 000 4.2" />
          <path d="M16 14l1-1a3 3 0 000-4.2" />
          <path d="M11 11l2 2" />
        </svg>
      );

    // Two shaking hand silhouettes — armistice.
    case "armistice":
      return (
        <svg {...common}>
          {label}
          <path d="M3 13l3-3 4 2 3-1" />
          <path d="M21 13l-3-3-4 2-3-1" />
          <path d="M10 11l2 2 2-2" />
          <path d="M3 13v2a2 2 0 002 2h2" />
          <path d="M21 13v2a2 2 0 01-2 2h-2" />
        </svg>
      );

    // Anchor — amphibious landing.
    case "landing":
      return (
        <svg {...common}>
          {label}
          <circle cx="12" cy="6" r="1.6" />
          <path d="M12 7.6V20" />
          <path d="M9 10h6" />
          <path d="M5 14a7 7 0 0014 0" />
          <path d="M5 14l-2-1" />
          <path d="M19 14l2-1" />
        </svg>
      );

    // Generic event — filled dot (exception: fill used intentionally per spec).
    case "event":
    default:
      return (
        <svg {...common}>
          {label}
          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="7" />
        </svg>
      );
  }
}

export default KindIcon;
