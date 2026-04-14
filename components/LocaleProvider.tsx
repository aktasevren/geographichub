"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DICT, type Locale, type DictKey } from "@/lib/i18n";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (k: DictKey, vars?: Record<string, string | number>) => string;
};

const LocaleCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "gh-locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored === "tr" || stored === "en") setLocaleState(stored);
    } catch {}
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.setAttribute("lang", l);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("lang", locale);
  }, [locale]);

  const t = useCallback(
    (k: DictKey, vars?: Record<string, string | number>) => {
      const table = DICT[locale] as Record<string, string>;
      let s = table[k] || DICT.en[k] || (k as string);
      if (vars) {
        for (const [vk, vv] of Object.entries(vars)) {
          s = s.replace(new RegExp(`\\{${vk}\\}`, "g"), String(vv));
        }
      }
      return s;
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleCtx);
  if (!ctx) {
    // Server-render fallback: default Turkish strings, no-op setter
    return {
      locale: "tr" as Locale,
      setLocale: () => {},
      t: (k: DictKey, vars?: Record<string, string | number>) => {
        let s = (DICT.tr as Record<string, string>)[k] || (k as string);
        if (vars) {
          for (const [vk, vv] of Object.entries(vars)) {
            s = s.replace(new RegExp(`\\{${vk}\\}`, "g"), String(vv));
          }
        }
        return s;
      },
    };
  }
  return ctx;
}

export function LocaleToggle({
  theme = "dark",
  className = "",
}: {
  theme?: "dark" | "light";
  className?: string;
}) {
  const { locale, setLocale } = useLocale();
  const isDark = theme === "dark";
  const active = isDark ? "text-white" : "text-[var(--text)]";
  const dim = isDark ? "text-white/40" : "text-[var(--muted)]";
  return (
    <div
      className={`flex items-center gap-0.5 font-mono text-[10px] uppercase tracking-[0.2em] ${className}`}
    >
      <button
        onClick={() => setLocale("tr")}
        className={locale === "tr" ? active : `${dim} hover:${active}`}
        aria-label="Türkçe"
        aria-pressed={locale === "tr"}
      >
        TR
      </button>
      <span className={dim}>/</span>
      <button
        onClick={() => setLocale("en")}
        className={locale === "en" ? active : `${dim} hover:${active}`}
        aria-label="English"
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
