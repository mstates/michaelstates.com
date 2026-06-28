# ADR 0005: ESLint flat config — ESLint 9 island, native jsx-a11y on islands

- Status: Accepted
- Date: 2026-06-28
- Relates to: INC-200 (author CI workflow); INC-222 (ESLint 10 fast-follow, blocked);
  ADR-0006 (Lighthouse thresholds); `.claude/rules/accessibility.md` (jsx-a11y is the
  signature ruleset)

## Context

The CI quality gate's `pnpm lint` step (`eslint . && astro check`) had no ESLint installed
and no config at all. Authoring it surfaced a peer-dependency conflict at current versions, so
the version set was resolved against the **installed** registry (not docs) before anything landed.

At resolution time: ESLint latest **10.6.0**, but `eslint-plugin-jsx-a11y` latest **6.10.2**
peer-requires `eslint "^3..^9"` (**no ESLint 10**), while `eslint-plugin-astro` **2.x**
peer-requires `eslint ">=10"`. The signature a11y plugin and the astro plugin cannot share an
ESLint major.

## Decision

- **Pin to the ESLint 9 island.** `eslint@9.39.4` + `@eslint/js@9.39.4` +
  `eslint-plugin-astro@1.7.0` (eslint `>=8.57`) + `astro-eslint-parser@1.4.0` +
  `typescript-eslint@8.62.0` + `eslint-plugin-jsx-a11y@6.10.2` +
  `eslint-plugin-react-hooks@7.1.1` + `eslint-config-prettier@10.1.8` + `globals@17.7.0`.
  A bare `pnpm add eslint-plugin-astro` would have grabbed 2.1.1 and broken the install — the
  pin to 1.7.0 is load-bearing. The ESLint 10 move is tracked in **INC-222**, gated entirely on
  jsx-a11y shipping ESLint 10 support.
- **Native `jsx-a11y` on the React islands, scoped to `**/_.{jsx,tsx}`.** This is the signature
ruleset and it must actually run. `eslint-plugin-astro`'s `flat/jsx-a11y-recommended` is
**not** used: its rules are astro-namespaced (`astro/jsx-a11y/_`) and only process `.astro`,
and it re-registers a `jsx-a11y`plugin under the same name as the native one (ESLint forbids
two configs redefining one plugin). Verified:`Button.tsx`resolves **34`jsx-a11y/\*`rules**
at error severity, and the gate **bites** — an`<img>`with no`alt`fails`jsx-a11y/alt-text`.
- **`flat/recommended` for `.astro`** (astro parser + 8 astro rules). Static a11y-linting of
  `.astro` templates is delegated to the **runtime axe suite** (Playwright lints rendered output,
  which is stronger than static template linting); revisit if templates grow beyond the shell page.
- **Plain-array config, not `tseslint.config()`.** That helper is `@deprecated` in
  typescript-eslint 8.62.0 (recommends ESLint core `defineConfig()`); we use no `extends` sugar,
  so the native array is the simplest equivalent. The swap was proven behavior-neutral by a
  `eslint --print-config` diff (byte-identical resolved config on a `.tsx` and the `.astro`).
- **Omit `eslint-plugin-react`** (redundant under React 19's automatic JSX runtime) and **defer
  type-checked linting** (no `parserOptions.project`) — `astro check` already covers type
  correctness, and project-aware linting adds latency for little marginal signal today.

## Consequences

- The a11y lint gate is **real on the interactive components**, not hollow — the earlier
  astro-bundled approach silently applied zero native `jsx-a11y/*` rules to `.tsx`.
- **`tsconfig.json` exclude was widened** (`storybook-static`, `coverage`, `playwright-report`,
  `test-results`, `.lighthouseci` added to the prior lone `dist`). Without it, `astro check`
  type-checks `storybook-static/`'s minified bundle and **natively aborts** (V8 stack overflow,
  exit 134) — the crash that first looked like a config error. Build/test artifacts are never
  type-checked.
- `pnpm lint` is green: `eslint .` clean + `astro check` → 0 errors / 0 warnings / 0 hints.

## Gotchas (for future maintainers)

- **Plugin config accessors drift between majors — read the installed shape, don't copy blind.**
  `eslint-plugin-react-hooks@7` exposes its flat config at `configs.flat["recommended-latest"]`;
  the top-level `configs["recommended-latest"]` is the **legacy** (eslintrc) shape with `plugins`
  as a string array and throws under flat config. `eslint-plugin-jsx-a11y` uses
  `flatConfigs.recommended`. `eslint-plugin-astro`'s `flat/*` configs are **arrays** (spread them).
- **Do not re-add `flat/jsx-a11y-recommended` to "also lint .astro a11y."** It collides with the
  native jsx-a11y plugin (`Cannot redefine plugin "jsx-a11y"`). Template a11y is the runtime axe
  suite's job until INC-222 unifies the ESLint major.
- **Don't "upgrade" eslint to 10** ad hoc — it breaks jsx-a11y. INC-222 owns that move.

## Alternatives considered

- **ESLint 10 + astro-plugin 2.x, accepting a jsx-a11y peer warning.** Rejected: jsx-a11y 6.10.2
  has no ESLint 10 release; relying on a stale-but-maybe-works peer for the _signature_ ruleset is
  exactly the wrong place to gamble.
- **astro's bundled global jsx-a11y as the only a11y source.** Rejected: its `astro/jsx-a11y/*`
  rules don't lint `.tsx`, leaving the islands uncovered (the hollow-gate trap this ADR exists to
  avoid).
- **`defineConfig()` from `eslint/config`.** Viable (the official replacement), but it adds
  `extends`/normalization behavior we don't need; the plain array is more transparent and was
  proven identical.
