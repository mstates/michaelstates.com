import { Link } from "./Link";

// Inferred CSF (see Button.stories.tsx for why no renderer-type import).
const meta = {
  title: "Primitives/Link",
  component: Link,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { children: "View the case study", href: "#" },
};

export default meta;

export const Inline = { args: { variant: "inline" } };

export const Standalone = {
  args: { variant: "standalone", children: "Back to projects" },
};

// Inline link inside a paragraph — verifies it is distinguishable from surrounding
// text without relying on color (WCAG 1.4.1).
export const InProse = {
  render: () => (
    <p className="max-w-prose text-body text-foreground">
      This portfolio is open source — you can{" "}
      <Link href="#">read the build journal</Link> to see how it was made.
    </p>
  ),
};

export const Disabled = { args: { isDisabled: true } };
