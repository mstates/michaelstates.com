# ADR 0001: Use Astro 6 (static-first) with React 19.2 islands

- Status: Accepted
- Date: project start

## Context

The portfolio is content-first (case studies, project write-ups) but needs islands of
rich, accessible interactivity to demonstrate design-engineering range. It must be fast,
impressive, and signal current technical taste to employers. The realistic alternative
was Next.js 16 (App Router / RSC).

## Decision

Use **Astro 6**, shipping zero JS by default, with **React 19.2** islands for interactive
components built on React Aria Components. Host static output on Cloudflare.

We chose Astro over Next.js because the site is primarily content; Astro's islands model
keeps shipped JS minimal (better Core Web Vitals, simpler hosting) while still letting the
React Aria component work shine. Next.js would add the React runtime to every page and
more caching complexity for app-like features this portfolio doesn't need.

## Consequences

- Easier: performance, cheap/simple static hosting, embedding multiple framework demos.
- Harder: app-like surfaces (auth, on-demand ISR, server actions) are not first-class — if
  a future section needs them, revisit (Astro server endpoints or a Next.js sub-app).
- We commit to the islands discipline: justify every `client:*` directive.

## Alternatives considered

- **Next.js 16** — strongest signal for Next.js-shop jobs and richest app features, but
  heavier for a content site and not needed for the current scope.
- **SvelteKit / React Router v7** — viable, but React Aria + the React ecosystem give the
  best accessibility-primitive story, which is the point of this portfolio.
