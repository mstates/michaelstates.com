import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  Label,
  Input,
  Text,
  FieldError,
  type ValidationResult,
} from "react-aria-components";
import type { ReactNode } from "react";
import { cx } from "./utils/cx";
import { focusRing } from "./utils/focusRing";

/**
 * Accessible single-line text field built on React Aria Components.
 *
 * RAC wires the label, description, and error to the input automatically
 * (aria-labelledby / aria-describedby / aria-invalid) — `label` is required so a
 * field is never unlabeled. For autofill and accessible authentication, pass
 * `autoComplete` (WCAG 2.2 §3.3.7 Redundant Entry / §3.3.8 Accessible Authentication).
 */
export interface TextFieldProps extends Omit<AriaTextFieldProps, "className"> {
  label: string;
  description?: ReactNode;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  className?: string;
}

export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  className,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField
      {...props}
      className={cx("flex flex-col gap-1.5", className)}
    >
      <Label className="text-caption font-medium text-foreground">
        {label}
      </Label>
      <Input
        placeholder={placeholder}
        className={cx(
          // border-input (neutral.500) clears WCAG 1.4.11 (3:1) for the control boundary.
          "min-h-11 w-full rounded-lg border border-input bg-background px-3 text-body text-foreground",
          "placeholder:text-muted-foreground",
          "transition-colors motion-reduce:transition-none",
          "hover:border-foreground",
          focusRing,
          "invalid:border-danger",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      />
      {description ? (
        <Text slot="description" className="text-caption text-muted-foreground">
          {description}
        </Text>
      ) : null}
      <FieldError className="text-caption text-danger">
        {errorMessage}
      </FieldError>
    </AriaTextField>
  );
}
