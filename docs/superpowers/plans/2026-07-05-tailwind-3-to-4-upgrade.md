# Tailwind 3 to 4 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bump Tailwind 3.4.19 → 4.x: swap the PostCSS-based engine for `@tailwindcss/vite`, migrate `tailwind.config.mjs` to a CSS-first `@theme` block, and remove `fluid-tailwind` (no v4 support) in favor of 14 hand-authored `clamp()` CSS rules that reproduce its output exactly — zero changes to any of the 9 template files that use fluid classes.

**Architecture:** Single atomic task. The engine swap, config migration, and fluid-tailwind removal can't be split into independently-buildable commits — `@tailwind` directives don't work under the v4 engine, and `tailwind.config.mjs`'s JS config isn't read without the old engine. One task, one commit, verified as a whole.

**Tech Stack:** Tailwind CSS 4, `@tailwindcss/vite`.

---

### Task 1: Swap to Tailwind 4 (`@tailwindcss/vite`), migrate config, drop fluid-tailwind

**Goal:** Site builds and renders identically on Tailwind 4, with `gm-blue`/`gm-dark` colors intact and all 14 fluid utility classes producing byte-identical CSS to the pre-upgrade build.

**Files:**
- Modify: `package.json` — remove `tailwindcss@3.4.19`, `autoprefixer`, `fluid-tailwind`; add `tailwindcss@^4` and `@tailwindcss/vite@^4`
- Delete: `postcss.config.mjs`
- Delete: `tailwind.config.mjs`
- Modify: `astro.config.mjs` — add `@tailwindcss/vite` to the Vite plugins
- Modify: `src/styles/global.css` — replace `@tailwind` directives with `@import "tailwindcss"`, add `@theme` block, append 14 static fluid CSS rules

**Acceptance Criteria:**
- [ ] `node_modules/tailwindcss/package.json` reports a `4.x` version
- [ ] `tailwind.config.mjs` and `postcss.config.mjs` no longer exist
- [ ] `pnpm build` succeeds with no missing-utility or unknown-class warnings
- [ ] Rendered HTML for `/`, `/about`, `/cv`, `/posts` contains `bg-gm-blue`/`text-gm-dark`/etc. class strings unchanged, and the corresponding CSS output still resolves `--color-gm-blue: #0099FF` / `--color-gm-dark: #202020`
- [ ] Rendered CSS for each of the 14 fluid classes (`~text-2xl/4xl`, `~text-2xl/5xl`, `~text-4xl/5xl`, `~text-lg/2xl`, `~text-xl/3xl`, `~text-5xl/6xl`, `~text-6xl/8xl`, `~mb-4/8`, `~pb-6/8`, `~px-4/8`, `~px-4/10`, `~px-4/0`, `~px-12/0`, `~p-4/0`) matches the values listed below verbatim
- [ ] `pnpm test` and `pnpm test:e2e` both pass

**Verify:** `pnpm build && pnpm test && pnpm test:e2e` → all pass, combined exit code 0. Additionally: `grep -o '\\~text-4xl\\\/5xl{[^}]*}' dist/_astro/*.css` (or equivalent glob for whichever CSS file the build emits) shows `font-size:clamp(2.25rem,1.71rem + 1.34vw,3rem);line-height:clamp(2.5rem,2.14rem + .89vw,3rem)`.

**Steps:**

- [ ] **Step 1: Remove the old Tailwind 3 engine, install Tailwind 4**

Run:
```bash
pnpm remove tailwindcss autoprefixer fluid-tailwind
pnpm add -D tailwindcss@^4 @tailwindcss/vite@^4
```

- [ ] **Step 2: Delete the old config files**

```bash
rm postcss.config.mjs tailwind.config.mjs
```

- [ ] **Step 3: Wire `@tailwindcss/vite` into `astro.config.mjs`**

Current `astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { remarkReadingTime } from './remark-reading-time.mjs';

import astroExpressiveCode from "astro-expressive-code";

export default defineConfig({
  site: 'https://gmagnenat.com/',
  integrations: [
    astroExpressiveCode(
    {
      themes: ['dracula', 'solarized-light'],
      removeUnusedThemes: false,
      shiki: { langs: [] },
      frames: { showCopyToClipboardButton: true },
      styleOverrides: { frames: { shadowColor: '#000' } }
    }
  )],
  markdown: {
    processor: unified({ remarkPlugins: [remarkReadingTime] }),
  }
});
```

Replace with:
```js
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { remarkReadingTime } from './remark-reading-time.mjs';
import tailwindcss from '@tailwindcss/vite';

import astroExpressiveCode from "astro-expressive-code";

export default defineConfig({
  site: 'https://gmagnenat.com/',
  integrations: [
    astroExpressiveCode(
    {
      themes: ['dracula', 'solarized-light'],
      removeUnusedThemes: false,
      shiki: { langs: [] },
      frames: { showCopyToClipboardButton: true },
      styleOverrides: { frames: { shadowColor: '#000' } }
    }
  )],
  markdown: {
    processor: unified({ remarkPlugins: [remarkReadingTime] }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 4: Migrate `src/styles/global.css`**

Current file starts with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

.expressive-code {
  @apply my-8
}

.post__content h2, h3 {
  @apply font-semibold my-2 mt-4 text-slate-200;
}

.post__content h2 {
  @apply text-2xl;
}

.post__content h3 {
  @apply text-xl;
}
```

Replace the three `@tailwind` lines and add the `@theme` block plus the 14 static fluid rules (append at the end of the file, after existing content):

```css
@import "tailwindcss";

@theme {
  --color-gm-blue: #0099FF;
  --color-gm-dark: #202020;
}

.expressive-code {
  @apply my-8
}

.post__content h2, h3 {
  @apply font-semibold my-2 mt-4 text-slate-200;
}

.post__content h2 {
  @apply text-2xl;
}

.post__content h3 {
  @apply text-xl;
}

/* Fluid sizing utilities — previously generated by fluid-tailwind (no Tailwind 4 support).
   Values below are copied verbatim from fluid-tailwind's output on the last Tailwind 3 build,
   preserving exact behavior. See docs/superpowers/specs/2026-07-05-tailwind-3-to-4-upgrade-design.md. */
.\~text-2xl\/4xl{font-size:clamp(1.5rem,.96rem + 1.34vw,2.25rem);line-height:clamp(2rem,1.64rem + .89vw,2.5rem)}
.\~text-2xl\/5xl{font-size:clamp(1.5rem,.43rem + 2.68vw,3rem);line-height:clamp(2rem,1.29rem + 1.79vw,3rem)}
.\~text-4xl\/5xl{font-size:clamp(2.25rem,1.71rem + 1.34vw,3rem);line-height:clamp(2.5rem,2.14rem + .89vw,3rem)}
.\~text-lg\/2xl{font-size:clamp(1.125rem,.857rem + .67vw,1.5rem);line-height:clamp(1.75rem,1.57rem + .45vw,2rem)}
.\~text-xl\/3xl{font-size:clamp(1.25rem,.804rem + 1.116vw,1.875rem);line-height:clamp(1.75rem,1.39rem + .89vw,2.25rem)}
.\~text-5xl\/6xl{font-size:clamp(3rem,2.46rem + 1.34vw,3.75rem);line-height:clamp(3rem,2.46rem + 1.34vw,3.75rem)}
.\~text-6xl\/8xl{font-size:clamp(3.75rem,2.14rem + 4.02vw,6rem);line-height:clamp(3.75rem,2.14rem + 4.02vw,6rem)}
.\~mb-4\/8{margin-bottom:clamp(1rem,.29rem + 1.79vw,2rem)}
.\~pb-6\/8{padding-bottom:clamp(1.5rem,1.14rem + .89vw,2rem)}
.\~px-4\/8{padding-left:clamp(1rem,.29rem + 1.79vw,2rem);padding-right:clamp(1rem,.29rem + 1.79vw,2rem)}
.\~px-4\/10{padding-left:clamp(1rem,2.68vw - .07rem,2.5rem);padding-right:clamp(1rem,2.68vw - .07rem,2.5rem)}
.\~px-4\/0{padding-left:clamp(0rem,1.71rem - 1.79vw,1rem);padding-right:clamp(0rem,1.71rem - 1.79vw,1rem)}
.\~px-12\/0{padding-left:clamp(0rem,5.14rem - 5.36vw,3rem);padding-right:clamp(0rem,5.14rem - 5.36vw,3rem)}
.\~p-4\/0{padding:clamp(0rem,1.71rem - 1.79vw,1rem)}
```

- [ ] **Step 5: Build and inspect output**

Run: `pnpm build`
Expected: 14 pages built, no warnings about unknown utilities or missing classes.

Then inspect the emitted CSS (path may vary — find it first):
```bash
find dist -name "*.css" -exec grep -l "gm-blue\|gm-dark" {} \;
```
Grep the matched file for `--color-gm-blue` and one fluid class (e.g. `~text-4xl\/5xl`) to confirm both the theme color and the static fluid rule made it into the final bundle unchanged.

- [ ] **Step 6: Run the full safety net**

Run: `pnpm test && pnpm test:e2e`
Expected: Vitest suite passes (15 tests), Playwright suite passes (7 tests) — including the hero-whitespace regression test, which depends on `~text-4xl/5xl md:~text-6xl/8xl` rendering correctly on `/`.

- [ ] **Step 7: If anything doesn't match — stop, don't force it**

A missing color, a fluid class producing no CSS, or a test failure means either a typo in the copied `clamp()` values or a v4 syntax issue in `@theme`/`@import`. Report the exact diff between expected and actual CSS rather than tweaking values to "look close enough" — these numbers must match the pre-upgrade build exactly, not approximately.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs src/styles/global.css
git rm postcss.config.mjs tailwind.config.mjs
git commit -m "Bump Tailwind to 4.x, migrate config to @theme, replace fluid-tailwind with static CSS"
```
