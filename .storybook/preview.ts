import "../src/styles/global.css";

const preview = {
  parameters: {
    // addon-a11y: hard-fail on axe violations (in the panel now; in the Vitest
    // test run once that addon lands in Stage 6).
    a11y: { test: "error" },
    controls: { expanded: true },
  },
};

export default preview;
