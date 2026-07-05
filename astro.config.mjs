import { defineConfig } from 'astro/config';
import { remarkReadingTime } from './remark-reading-time.mjs';
import robotsTxt from "astro-robots-txt";

import astroExpressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: 'https://gmagnenat.com/',
  integrations: [
    robotsTxt(),
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
    remarkPlugins: [remarkReadingTime],
  }
});