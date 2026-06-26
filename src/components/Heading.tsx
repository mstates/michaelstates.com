import type { ComponentPropsWithoutRef, ReactNode } from "react";
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
 */
export interface HeadingProps extends Omit<
  ComponentPropsWithoutRef<"h1">,
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

export function Heading({
  level,
  size,
  className,
  children,
  ...props
}: HeadingProps) {
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
