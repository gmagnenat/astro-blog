import { defineConfig } from 'astro/config';
// @astrojs/markdown-remark is normally just a transitive dep of astro; it's
// listed directly here because pnpm's strict node_modules requires it for
// this import, and its version should track whatever astro resolves it to.
import { unified } from '@astrojs/markdown-remark';
import { remarkReadingTime } from './remark-reading-time.mjs';
import tailwindcss from '@tailwindcss/vite';

import astroExpressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: 'https://gmagnenat.com/',
  integrations: [
    astroExpressiveCode(
    {
      themes: ['dracula', 'solarized-light'],
      // Workaround for a Shiki theme-bundling bug in astro-expressive-code 0.39+
      // ("Theme X is not included in this bundle"). Do not remove without
      // confirming the bug is fixed upstream, or the build will break again.
      removeUnusedThemes: false,
      shiki: {
        langs: [

        ]
      },
      frames: {
        showCopyToClipboardButton: true,
      },
      styleOverrides: {
        frames: {
          shadowColor: '#000'
        }
      }
    }
  )],
  markdown: {
    processor: unified({ remarkPlugins: [remarkReadingTime] }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});