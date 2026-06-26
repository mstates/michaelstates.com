import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { cx } from "./utils/cx";
import { focusRing } from "./utils/focusRing";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md";

/**
 * Accessible button built on React Aria Components.
 *
 * Accessible name: visible text content provides it. For an icon-only button
 * (no visible text), you MUST pass `aria-label` or `aria-labelledby`
 * (WCAG 4.1.2 Name, Role, Value / 2.4.4 Link Purpose).
 */
export interface ButtonProps extends Omit<AriaButtonProps, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

// RAC sets data-hovered / data-pressed / data-focus-visible / data-disabled; the
// `hover:` / `pressed:` / `disabled:` variants come from the
// tailwindcss-react-aria-components plugin. Focus ring + forced-colors handling is
// shared via focusRing. Motion is reduced on request.
const base =
  "inline-flex select-none items-center justify-center rounded-lg font-medium " +
  "transition-colors duration-150 motion-reduce:transition-none " +
  focusRing +
  " disabled:cursor-not-allowed disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover pressed:bg-primary-hover",
  secondary:
    "border border-input bg-surface text-foreground hover:bg-surface-muted pressed:bg-surface-muted",
  ghost:
    "bg-transparent text-foreground hover:bg-surface-muted pressed:bg-surface-muted",
};

// min-h ≥ 44px (md) / 36px (sm) and min-w-6 (24px) — clears WCAG 2.2 §2.5.8
// target size (24×24) even for a minimal-content button.
const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 min-w-6 gap-1.5 px-3 text-caption",
  md: "min-h-11 min-w-6 gap-2 px-4 text-body",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className={cx(
        base,
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    />
  );
}
