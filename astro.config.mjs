import { defineConfig } from 'astro/config';
import { remarkReadingTime } from './remark-reading-time.mjs';
import tailwind from "@astrojs/tailwind";
import robotsTxt from "astro-robots-txt";

import astroExpressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: 'https://gm-blog.pages.dev/',
  integrations: [
    tailwind(), 
    robotsTxt(), 
    astroExpressiveCode(
    {
      themes: ['dracula', 'solarized-light'],
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