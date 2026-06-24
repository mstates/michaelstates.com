import {
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
} from "react-aria-components";
import { cx } from "./utils/cx";
import { focusRing } from "./utils/focusRing";

export type LinkVariant = "inline" | "standalone";

/**
 * Accessible link built on React Aria Components (renders a real `<a>` when `href`
 * is set). Always underlined so it is distinguishable without relying on color
 * (WCAG 1.4.1 Use of Color). For an icon-only link, pass `aria-label`.
 *
 * Note: a disabled link (`isDisabled`) stays in the tab order with
 * `aria-disabled="true"` — RAC does not remove links from focus order the way a
 * native `disabled` button is. Prefer omitting the link when it shouldn't be actionable.
 */
export interface LinkProps extends Omit<AriaLinkProps, "className"> {
  variant?: LinkVariant;
  className?: string;
}

const base =
  "rounded-sm text-primary underline underline-offset-2 " +
  "transition-colors motion-reduce:transition-none " +
  "hover:text-primary-hover " +
  focusRing +
  " disabled:cursor-not-allowed disabled:opacity-50";

const variantClasses: Record<LinkVariant, string> = {
  // Thin underline that thickens on hover — clear affordance inside body text.
  inline: "decoration-1 hover:decoration-2",
  // Standalone (e.g. "Back to projects"): min-h-6 + inline-flex centring guarantees
  // the 24px target-size floor (WCAG 2.2 §2.5.8; inline links are exempt).
  standalone: "inline-flex items-center min-h-6 font-medium",
};

export function Link({ variant = "inline", className, ...props }: LinkProps) {
  return (
    <AriaLink
      {...props}
      className={cx(base, variantClasses[variant], className)}
    />
  );
}
