// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// Static-first (no adapter) — see ADR-0001 and SETUP.md Stage 6 (Cloudflare static path).
export default defineConfig({
  site: 'https://michaelstates.com',
  output: 'static',
  integrations: [
    react(),
    sitemap({
      // INC-259: the styleguide workshop route is deliberately unlisted — reachable by
      // URL, absent from nav and sitemap until promotion to a linked exhibit is ruled.
      filter: (page) => page !== 'https://michaelstates.com/styleguide/',
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
