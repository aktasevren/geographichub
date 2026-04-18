/**
 * wn(...classNames) — minimal classNames joiner, clsx-style.
 *
 * Accepts strings and falsy values (false | undefined | null) so callers
 * can write `wn("base", active && "active", className)` without a
 * dedicated dependency. This is our in-repo substitute for clsx /
 * tailwind-merge inside the wars-noir namespace.
 */
export function wn(
  ...classNames: Array<string | false | undefined | null>
): string {
  let out = "";
  for (const c of classNames) {
    if (!c) continue;
    out = out ? out + " " + c : c;
  }
  return out;
}
