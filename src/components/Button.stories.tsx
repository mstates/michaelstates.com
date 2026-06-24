import { Button } from "./Button";

// Inferred CSF (no renderer-type import: @storybook/react isn't resolvable at the
// project root under pnpm, and @storybook/react-vite doesn't re-export Meta/StoryObj).
const meta = {
  title: "Primitives/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { children: "Button" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "ghost"],
    },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
};

export default meta;

export const Primary = { args: { variant: "primary" } };
export const Secondary = { args: { variant: "secondary" } };
export const Ghost = { args: { variant: "ghost" } };
export const Small = { args: { size: "sm", children: "Small" } };
export const Disabled = { args: { isDisabled: true, children: "Disabled" } };
