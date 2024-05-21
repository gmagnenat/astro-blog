import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import robotsTxt from "astro-robots-txt";

import astroExpressiveCode from "astro-expressive-code";
import {pluginLineNumbers} from '@expressive-code/plugin-line-numbers';

// https://astro.build/config
export default defineConfig({
  site: 'https://gm-blog.pages.dev/',
  integrations: [
    tailwind(), 
    robotsTxt(), 
    astroExpressiveCode(
    {
      themes: ['dracula', 'solarized-light'],
      plugins: [pluginLineNumbers()],
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
});