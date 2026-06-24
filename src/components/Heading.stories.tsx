import { Heading } from "./Heading";

// Inferred CSF (see Button.stories.tsx for why no renderer-type import).
const meta = {
  title: "Primitives/Heading",
  component: Heading,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { level: 2, children: "Designing for everyone" },
};

export default meta;

export const Display = {
  args: { level: 1, size: "display", children: "Michael States" },
};

export const Title = {
  args: { level: 2, size: "title", children: "Selected work" },
};

export const Body = {
  args: { level: 3, size: "body", children: "Reduced-motion toggle" },
};

// Semantic level decoupled from visual size — an h2 rendered at body size keeps the
// document outline intact (WCAG 1.3.1) while looking like a small label.
export const LevelDecoupledFromSize = {
  args: { level: 2, size: "body", children: "An h2 styled at body size" },
};
