import type { Metadata } from "next";
import Link from "next/link";
import SiteLogo from "@/components/SiteLogo";
import { BACKLOG, countStatuses } from "@/lib/backlog-data";

export const metadata: Metadata = {
  title: "Backlog — What's Built, Shipping, and Next on GeographicHub",
  description:
    "Every map, feature and content task on GeographicHub — with live status.",
  alternates: { canonical: "/backlog" },
};

const STATUS_META = {
  done: { label: "Done", color: "#22c55e", icon: "✓" },
  "in-progress": { label: "In progress", color: "#eab308", icon: "◐" },
  todo: { label: "Todo", color: "#64748b", icon: "○" },
};

const PRIORITY_META = {
  P0: { label: "Now", color: "#ef4444" },
  P1: { label: "Next", color: "#f59e0b" },
  P2: { label: "Later", color: "#06b6d4" },
  P3: { label: "Someday", color: "#64748b" },
};

export default function BacklogPage() {
  const totals = countStatuses();
  const pct = Math.round((totals.done / totals.total) * 100);

  return (
    <div className="min-h-screen grain">
      <header className="flex justify-between items-center px-6 md:px-10 py-5 hair-b">
        <SiteLogo theme="light" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Backlog
        </span>
      </header>

      <section className="max-w-[1100px] mx-auto px-6 md:px-10 pt-10 md:pt-14 pb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] mb-4">
          § Public backlog
        </div>
        <h1 className="font-serif font-light text-4xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight">
          What's built,{" "}
          <span className="italic" style={{ color: "var(--accent)" }}>
            what's next.
          </span>
        </h1>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-[720px]">
          <Stat n={totals.done.toString()} label="Done" color="#22c55e" />
          <Stat n={totals.inProgress.toString()} label="In progress" color="#eab308" />
          <Stat n={totals.todo.toString()} label="Todo" color="#64748b" />
          <Stat n={`${pct}%`} label="Shipped" color="var(--accent)" />
        </div>

        <div className="mt-6 h-2 w-full max-w-[720px] bg-[var(--line)] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-6 md:px-10 py-10 space-y-10">
        {BACKLOG.map((section) => {
          const done = section.tasks.filter((t) => t.status === "done").length;
          const total = section.tasks.length;
          const secPct = Math.round((done / total) * 100);
          return (
            <div
              key={section.slug}
              className="rounded-xl border border-[var(--line-2)] p-5 md:p-7"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl">
                    {section.href ? (
                      <Link
                        href={section.href}
                        className="hover:text-[var(--accent)] transition"
                      >
                        {section.title}
                      </Link>
                    ) : (
                      section.title
                    )}
                  </h2>
                  <p className="text-[13px] text-[var(--text-2)] mt-1 max-w-xl">
                    {section.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-serif text-2xl text-emerald-500 tabular-nums">
                    {done} / {total}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                    {secPct}% done
                  </div>
                </div>
              </div>

              <div className="mt-3 mb-4 h-1.5 w-full bg-[var(--line)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${secPct}%` }}
                />
              </div>

              <ul className="space-y-1.5">
                {(["P0", "P1", "P2", "P3"] as const).map((p) => {
                  const inPriority = section.tasks.filter(
                    (t) => t.priority === p
                  );
                  if (inPriority.length === 0) return null;
                  const pm = PRIORITY_META[p];
                  return (
                    <div key={p} className="mb-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="font-mono text-[9px] uppercase tracking-[0.22em] px-1.5 py-0.5 rounded"
                          style={{
                            background: `${pm.color}18`,
                            color: pm.color,
                          }}
                        >
                          {p} · {pm.label}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">
                          {inPriority.filter((t) => t.status === "done").length}
                          /{inPriority.length}
                        </span>
                      </div>
                      {inPriority.map((t, i) => {
                        const sm = STATUS_META[t.status];
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2.5 py-1 pl-2 text-[13px]"
                          >
                            <span
                              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] flex-shrink-0"
                              style={{
                                background: `${sm.color}22`,
                                color: sm.color,
                              }}
                              aria-label={sm.label}
                            >
                              {sm.icon}
                            </span>
                            <span
                              className={
                                t.status === "done"
                                  ? "text-[var(--text-2)] line-through decoration-[var(--line-2)]"
                                  : "text-[var(--text)]"
                              }
                            >
                              {t.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <footer className="px-6 md:px-10 py-8 hair-t flex flex-wrap justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
        <span>© {new Date().getFullYear()} GeographicHub</span>
        <Link href="/" className="hover:text-[var(--text)]">
          ← Home
        </Link>
      </footer>
    </div>
  );
}

function Stat({
  n,
  label,
  color,
}: {
  n: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="font-serif text-3xl md:text-4xl leading-none tracking-tight tabular-nums"
        style={{ color }}
      >
        {n}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </span>
    </div>
  );
}
