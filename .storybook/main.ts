import type { StorybookConfig } from "@storybook/react-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-vitest"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // Storybook runs its own Vite. @storybook/react-vite's viteFinal adds only the
  // docgen plugins, not @vitejs/plugin-react, so without react() here every story
  // throws "React is not defined" (tsconfig is jsx:"preserve" for Astro). Tailwind
  // v4 is added so utilities + our tokens (via global.css in preview.ts) generate.
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = viteConfig.plugins ?? [];
    // react() must run its JSX transform ahead of Storybook's pre-loaded docgen
    // plugins, so unshift to the front rather than push to the back.
    viteConfig.plugins.unshift(react());
    viteConfig.plugins.push(tailwindcss());
    return viteConfig;
  },
};

export default config;
