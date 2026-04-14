"use client";

import Link from "next/link";
import SiteLogo from "@/components/SiteLogo";
import { LocaleToggle } from "@/components/LocaleProvider";

export type Crumb = { label: string; href?: string };

export default function PageHeader({
  breadcrumbs,
  theme = "light",
  rightExtra,
}: {
  breadcrumbs?: Crumb[];
  theme?: "light" | "dark";
  rightExtra?: React.ReactNode;
}) {
  const isLight = theme === "light";
  return (
    <>
      <header
        className={`flex justify-between items-center px-5 md:px-10 py-3.5 md:py-4 ${
          isLight ? "hair-b" : "border-b border-white/10"
        }`}
      >
        <SiteLogo theme={theme} />
        <div className="flex items-center gap-4 md:gap-5">
          {rightExtra}
          <LocaleToggle theme={theme} />
        </div>
      </header>

      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className={`px-5 md:px-10 py-2.5 ${
            isLight ? "hair-b" : "border-b border-white/10"
          }`}
        >
          <ol
            className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] ${
              isLight ? "text-[var(--muted)]" : "text-white/45"
            }`}
          >
            {breadcrumbs.map((b, i) => (
              <li key={i} className="flex items-center gap-1.5">
                {b.href ? (
                  <Link
                    href={b.href}
                    className={
                      isLight
                        ? "hover:text-[var(--text)]"
                        : "hover:text-white"
                    }
                  >
                    {b.label}
                  </Link>
                ) : (
                  <span
                    className={
                      isLight ? "text-[var(--text-2)]" : "text-white/80"
                    }
                  >
                    {b.label}
                  </span>
                )}
                {i < breadcrumbs.length - 1 && (
                  <span
                    className={isLight ? "text-[var(--muted)]" : "text-white/30"}
                  >
                    /
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
    </>
  );
}
