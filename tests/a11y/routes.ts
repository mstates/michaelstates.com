// Single source of truth for the a11y suite's route coverage. Adding a page to the
// site = adding one entry here; routes.spec.ts generates the full-axe pass and document
// contract for every entry, and dist-parity.spec.ts fails the build if a route exists
// in dist/ without an entry (no silent coverage gaps).

/** Exact tag set for every axe run — WCAG 2.0/2.1/2.2 A & AA. Do not narrow. */
export const AXE_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
];

export interface A11yRoute {
  /** Canonical id — must equal distFileToRouteId() for the dist file this covers. */
  id: string;
  /** URL path to navigate to. For the 404 doc this is a deliberately nonexistent path. */
  path: string;
  /** HTTP status astro preview must return for `path`. */
  status: number;
  /** Exact document title. */
  title: string;
  /** Optional render guard: visible level-1 heading proving axe scans the right doc. */
  h1?: string;
}

export const routes: A11yRoute[] = [
  {
    id: "/",
    path: "/",
    status: 200,
    title: "Michael States",
    h1: "I design and ship products that work for everyone.",
  },
  {
    // Not a 200 route: reached via a nonexistent path so the static 404.html is served
    // with a real 404 status (astro preview / Cloudflare Pages both do this).
    id: "404",
    path: "/this-route-does-not-exist-inc233",
    status: 404,
    title: "Page not found · Michael States",
    h1: "Page not found",
  },
];

/**
 * Map a dist-relative HTML file to its canonical route id:
 *   index.html → "/", <dir>/index.html → "/<dir>/", 404.html → "404".
 * Any other shape returns the raw relative path, which matches no manifest entry and
 * fails dist-parity loudly — deliberate, so an unexpected build output is a red build,
 * not a silent skip.
 */
export function distFileToRouteId(relPath: string): string {
  if (relPath === "404.html") return "404";
  if (relPath === "index.html") return "/";
  if (relPath.endsWith("/index.html")) {
    return `/${relPath.slice(0, -"index.html".length)}`;
  }
  return relPath;
}
