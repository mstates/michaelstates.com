import type { Meta, StoryObj } from "@storybook/react-vite";

// INC-242 rendered-proof vehicle (ratified as a new file — no component
// changes): exercises every brand face in its design role so a live-DOM
// check can verify the loaded webfonts against computed styles. Faces
// covered: Newsreader 500 / italic-500 / 600, Plus Jakarta Sans 400 / 600 /
// 700, Space Mono 400 / 700 — the full 8-file subset spec.
const TypographySpecimen = () => (
  <div className="flex max-w-prose flex-col gap-4">
    <p
      data-testid="mono-eyebrow"
      className="font-mono text-caption font-bold text-muted-foreground"
    >
      SPACE MONO 700 — EYEBROW
    </p>
    <p
      data-testid="serif-hero"
      className="font-serif text-hero font-medium leading-heading text-balance text-foreground"
    >
      Newsreader carries the <em>hero</em> voice
    </p>
    <p
      data-testid="serif-heading"
      className="font-serif text-title font-semibold leading-heading text-foreground"
    >
      Section headings hold at 600
    </p>
    <p data-testid="sans-body" className="font-sans text-body text-foreground">
      Plus Jakarta Sans sets body and UI text at 400, with{" "}
      <span className="font-semibold">semibold emphasis at 600</span> and{" "}
      <span className="font-bold">bold at 700</span>.
    </p>
    <p
      data-testid="mono-sample"
      className="font-mono text-caption text-muted-foreground"
    >
      space-mono-400 — stats / code-flavored details
    </p>
  </div>
);

const meta = {
  title: "Foundations/Typography",
  component: TypographySpecimen,
} satisfies Meta<typeof TypographySpecimen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Specimen: Story = {};
