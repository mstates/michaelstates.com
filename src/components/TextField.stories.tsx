import { TextField } from "./TextField";

// Inferred CSF (see Button.stories.tsx for why no renderer-type import).
const meta = {
  title: "Primitives/TextField",
  component: TextField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Email",
    description: "We'll only use this to reply — never shared.",
  },
};

export default meta;

export const Default = {};

export const Required = {
  args: { label: "Full name", description: undefined, isRequired: true },
};

export const WithError = {
  args: {
    isInvalid: true,
    value: "not-an-email",
    errorMessage: "Enter a valid email address.",
  },
};

// WCAG 2.2 §3.3.7 / §3.3.8 — autocomplete reduces redundant entry and aids
// accessible authentication (password managers / autofill).
export const Email = {
  args: { label: "Email", type: "email", autoComplete: "email" },
};

// Invalid state + autocomplete together — the realistic failed-validation path
// that still supports password managers / autofill (WCAG 2.2 §3.3.8).
export const InvalidEmail = {
  args: {
    label: "Email",
    type: "email",
    autoComplete: "email",
    isInvalid: true,
    value: "not-an-email",
    errorMessage: "Enter a valid email address.",
  },
};

export const Disabled = {
  args: { isDisabled: true, value: "jane@example.com", description: undefined },
};
