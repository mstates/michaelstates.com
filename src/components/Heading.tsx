import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx } from "./utils/cx";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "display" | "title" | "body";

/**
 * Typographic heading. NOT a React Aria widget — it renders a real `<h1>`–`<h6>`.
 *
 * `level` is the semantic outline level: choose it by document structure / screen-reader
 * navigation (SC 1.3.1 / 2.4.6), NEVER to get a font size, and do not skip levels
 * (e.g. h2 → h4) — the component can't enforce that; it's a page-outline contract.
 * `size` is the visual scale, decoupled from `level`, so an `h2` can look like body text
 * without breaking the heading outline.
 *
 * `ref` is a regular prop (React 19) and attaches to the rendered `<h1>`–`<h6>` element
 * (e.g. for scroll-to-heading / skip-link focus patterns).
 * In dev builds, rendering with empty children and no `aria-label`/`aria-labelledby`
 * logs a console warning (axe `empty-heading` / SC 2.4.6); the axe suite in CI
 * (`pnpm test:a11y`) remains the authoritative gate.
 */
export interface HeadingProps extends Omit<
  ComponentPropsWithRef<"h1">,
  "className"
> {
  level: HeadingLevel;
  size?: HeadingSize;
  className?: string;
  children: ReactNode;
}

// Consumes semantic type tokens (text-* / leading-* land in @theme). Font weight uses
// Tailwind's built-in font-bold/font-semibold utilities — we dropped our redundant
// font-weight primitives (they were identical to Tailwind's), so weight is fully
// delegated to Tailwind. Default color is text-foreground (applied first): a consumer
// className on a DIFFERENT property composes cleanly, but a conflicting same-property
// override (e.g. another text-* color) resolves by stylesheet order — cx is a plain
// joiner, not guaranteed last-wins.
const sizeClasses: Record<HeadingSize, string> = {
  display: "text-display font-bold leading-heading text-balance",
  title: "text-title font-semibold leading-heading text-balance",
  body: "text-body font-semibold leading-normal text-balance",
};

// Default visual size per level (override with `size`).
const defaultSize: Record<HeadingLevel, HeadingSize> = {
  1: "display",
  2: "title",
  3: "title",
  4: "body",
  5: "body",
  6: "body",
};

// Dev-only heuristic for the guard below. Recurses into arrays so sibling expression
// children that all render to nothing (e.g. {condA}{condB} → [false, false]) are caught;
// [].every() is vacuously true, so an empty array counts as empty too. Prop-level only —
// children that *render* empty (e.g. <span/>) are axe's job in CI, not ours.
function isEmptyContent(node: ReactNode): boolean {
  return (
    node == null ||
    typeof node === "boolean" ||
    (typeof node === "string" && node.trim() === "") ||
    (Array.isArray(node) && node.every(isEmptyContent))
  );
}

export function Heading({
  level,
  size,
  className,
  children,
  ...props
}: HeadingProps) {
  if (import.meta.env.DEV) {
    if (
      isEmptyContent(children) &&
      !props["aria-label"] &&
      !props["aria-labelledby"]
    ) {
      console.warn(
        `<Heading level={${level}}> rendered with no accessible content. Empty ` +
          "headings fail axe's empty-heading rule and break heading navigation " +
          "for screen-reader users (WCAG 2.2 SC 2.4.6). Pass non-empty children " +
          "or an aria-label.",
      );
    }
  }
  const Tag = `h${level}` as `h${HeadingLevel}`;
  return (
    <Tag
      className={cx(
        "text-foreground",
        sizeClasses[size ?? defaultSize[level]],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
