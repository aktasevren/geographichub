import Link from "next/link";

export default function SiteLogo({
  theme = "dark",
  size = "md",
}: {
  theme?: "dark" | "light";
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? 24 : 28;
  const color = theme === "dark" ? "text-white" : "text-[var(--text)]";
  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 ${color} hover:opacity-80 transition`}
    >
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden
      >
        <path
          d="M 50 22 A 20 20 0 1 0 44 48 L 44 34 L 34 34"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse
          cx="32"
          cy="32"
          rx="20"
          ry="8"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.4"
        />
        <line
          x1="12"
          y1="32"
          x2="52"
          y2="32"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.4"
        />
        <circle cx="52" cy="32" r="2" fill="currentColor" />
      </svg>
      <span
        className={`font-serif ${
          size === "sm" ? "text-[16px]" : "text-[18px]"
        } tracking-tight`}
      >
        GeographicHub
      </span>
    </Link>
  );
}
