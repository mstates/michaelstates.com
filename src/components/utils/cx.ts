/** Tiny className joiner: drops falsy values and joins with spaces. */
export function cx(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
