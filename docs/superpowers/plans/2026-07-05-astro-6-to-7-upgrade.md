# Astro 6 to 7 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bump Astro 6.4 → 7.x, replacing the stale, unmaintained `astro-robots-txt` integration with a static `public/robots.txt`, verified green by the existing Vitest/Playwright safety net plus a manual visual check for Astro 7's whitespace-compression default change.

**Architecture:** This is the final step of a three-step incremental major upgrade (4→5, 5→6 already merged). Unlike the prior two steps, most of this project's dependencies are already forward-compatible with Astro 7 (confirmed during planning: `astro-expressive-code` 0.44.0 already declares Astro 7 support, `markdown.processor` already uses explicit `unified()`). The only forced change is removing `astro-robots-txt`. Tasks: core bump → remove the stale integration → verify remaining low-risk integrations → full build/visual/safety-net verification.

**Tech Stack:** Astro 7, static `public/robots.txt` (no integration), existing Vitest + Playwright safety net.

---

### Task 1: Bump Astro core

**Goal:** Astro core and official `@astrojs/*` packages are on Astro-7-compatible versions.

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Acceptance Criteria:**
- [ ] `pnpm astro --version` reports a 7.x version
- [ ] `@astrojs/check` and `@astrojs/markdown-remark` are bumped to Astro-7-compatible versions

**Verify:** `pnpm astro --version` → prints `7.x.x`

**Steps:**

- [ ] **Step 1: Run the official upgrade CLI**

Run: `pnpm dlx @astrojs/upgrade`
Expected: this time, LET it land on Astro 7 (unlike the previous two upgrade steps, where jumping to 7 early was explicitly rejected — this step's whole purpose is to land on 7). If it prompts interactively, accept the recommended choice. If it can't run non-interactively, fall back to manually bumping `astro` to the latest `^7.x` in `package.json` and running `pnpm install`.

- [ ] **Step 2: Confirm the version bump landed**

Run: `pnpm astro --version`
Expected: prints a `7.x.x` version

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "Bump Astro to 7.x"
```

(Do NOT attempt a full `pnpm build` yet — `astro-robots-txt` is still in place at this point and may or may not fail; Task 2 removes it regardless of what happens here, so a build attempt in this task would just be noise. If you're curious, an informational `pnpm build` is fine, but don't treat a failure here as blocking — proceed to Task 2.)

---

### Task 2: Remove astro-robots-txt, add static robots.txt

**Goal:** Replace the stale, unmaintained `astro-robots-txt` integration (last published 2023, no confirmed Astro 7 support, hooks the build pipeline) with a static `public/robots.txt` producing byte-identical output.

**Files:**
- Modify: `astro.config.mjs`
- Modify: `package.json`
- Create: `public/robots.txt`

**Acceptance Criteria:**
- [ ] `astro.config.mjs` no longer imports or uses `astro-robots-txt`
- [ ] `package.json` no longer lists `astro-robots-txt`
- [ ] `public/robots.txt` exists with the exact pre-upgrade generated content
- [ ] `dist/robots.txt` (after build) is byte-identical to the pre-upgrade integration's output

**Verify:** `pnpm build && cat dist/robots.txt` → matches the content below exactly

**Steps:**

- [ ] **Step 1: Remove `astro-robots-txt` from `astro.config.mjs`**

Current content:

```js
import { defineConfig } from 'astro/config';
// @astrojs/markdown-remark is normally just a transitive dep of astro; it's
// listed directly here because pnpm's strict node_modules requires it for
// this import, and its version should track whatever astro resolves it to.
import { unified } from '@astrojs/markdown-remark';
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
    processor: unified({ remarkPlugins: [remarkReadingTime] }),
  }
});
```

Change to (remove the `robotsTxt` import and its call from `integrations`, everything else identical):

```js
import { defineConfig } from 'astro/config';
// @astrojs/markdown-remark is normally just a transitive dep of astro; it's
// listed directly here because pnpm's strict node_modules requires it for
// this import, and its version should track whatever astro resolves it to.
import { unified } from '@astrojs/markdown-remark';
import { remarkReadingTime } from './remark-reading-time.mjs';

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
  }
});
```

- [ ] **Step 2: Remove the package**

Run: `pnpm remove astro-robots-txt`

- [ ] **Step 3: Create `public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://gmagnenat.com/sitemap-index.xml
```

(This preserves the current output byte-for-byte, including the dangling `Sitemap:` reference to a URL that already 404s since no sitemap integration exists — fixing that is explicitly out of scope for this step.)

- [ ] **Step 4: Build and verify byte-identical output**

Run: `pnpm build && cat dist/robots.txt`
Expected: prints exactly:
```
User-agent: *
Allow: /
Sitemap: https://gmagnenat.com/sitemap-index.xml
```

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs package.json pnpm-lock.yaml public/robots.txt
git commit -m "Replace astro-robots-txt with static robots.txt"
```

---

### Task 3: Bump astro-seo and verify astro-expressive-code

**Goal:** Bump the one remaining third-party integration with unconfirmed-but-lower-risk Astro 7 status (`astro-seo`), and confirm `astro-expressive-code` (already Astro-7-compatible per its declared peer range, no version bump needed) still works correctly — specifically that the `removeUnusedThemes: false` workaround still produces both configured themes.

**Files:**
- Modify: `package.json`

**Acceptance Criteria:**
- [ ] `astro-seo` bumped to latest
- [ ] `astro-expressive-code` version UNCHANGED (still 0.44.0 — no bump needed, already Astro-7-compatible)
- [ ] `pnpm build` succeeds with zero errors
- [ ] Both configured themes (`dracula`, `solarized-light`) present in built CSS output

**Verify:** `pnpm build` → exits 0; `grep -rl "dracula" dist/_astro/*.css && grep -rl "solarized-light" dist/_astro/*.css` → both find a match

**Steps:**

- [ ] **Step 1: Bump astro-seo**

Run: `pnpm add astro-seo@latest`

- [ ] **Step 2: Build**

Run: `pnpm build`
Expected: succeeds with zero errors. If it fails, check whether the failure is astro-seo-related (a component-level type/prop error) — astro-seo is a passive component with no build-pipeline hooks, so a failure here would be narrow and traceable to its usage in `BaseLayout.astro` or similar.

- [ ] **Step 3: Confirm expressive-code themes still render**

Run:
```bash
grep -rl "dracula" dist/_astro/*.css && grep -rl "solarized-light" dist/_astro/*.css
```
Expected: both commands find a match. If NOT — the `removeUnusedThemes: false` workaround from the 5→6 step may need re-investigation under Astro 7's Vite 8. Do not remove the workaround without confirming a build actually succeeds without it (re-test by temporarily commenting it out, then restore before committing).

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "Bump astro-seo to latest, confirm astro-expressive-code Astro 7 compatibility"
```

---

### Task 4: Build, visual, and full safety-net verification

**Goal:** Confirm the fully-upgraded site (Astro 7, static robots.txt, bumped astro-seo) has no HTML-strictness build failures, no visible whitespace-compression regressions from the `compressHTML: 'jsx'` default change, and passes both safety-net suites unmodified.

**Files:**
- None (verification only)

**Acceptance Criteria:**
- [ ] `pnpm build` succeeds with zero errors (this doubles as the HTML-strictness check — Astro 7's compiler now hard-errors on invalid markup instead of silently fixing it)
- [ ] Manual visual check of `/posts` and one tag page (via `pnpm preview`) shows no whitespace collapsed between tag pills or listing cards
- [ ] `pnpm test` (Vitest build-output suite) passes with zero changes to `test/build.test.ts`
- [ ] `pnpm test:e2e` (Playwright page-load suite) passes with zero changes to `e2e/pages.spec.ts`

**Verify:** `pnpm test && pnpm test:e2e` → both suites pass, combined exit code 0

**Steps:**

- [ ] **Step 1: Build**

Run: `pnpm build`
Expected: exits 0, 14 pages built, zero errors. Any HTML-strictness error here means a real markup issue in a `.astro` component or markdown post needs fixing before proceeding — report it rather than guessing at a fix, since the exact error message will point to the specific invalid markup.

- [ ] **Step 2: Manual visual check**

Run: `pnpm preview` in one terminal, then in a browser (or via `curl`/`grep` on the rendered HTML) check:
- `/posts` — the reading-time text and post title links render with expected spacing, no words visibly running together
- A tag page (e.g. `/post/tags/code`) — the tag pills in the page header render with visible spacing between them, not squished into one word

If anything looks visually collapsed compared to the pre-upgrade site, note it — this would stem from the `compressHTML: 'jsx'` default change and may need an explicit `compressHTML: true` override in `astro.config.mjs` (a one-line fix) if it actually reproduces.

- [ ] **Step 3: Run the full safety net**

Run: `pnpm test && pnpm test:e2e`
Expected: Vitest suite passes (15 tests), Playwright suite passes (6 tests), final exit code 0

- [ ] **Step 4: If anything failed or needed a code edit, investigate before continuing**

A failure here — or a need to edit `test/build.test.ts` / `e2e/pages.spec.ts` to make it pass — means the upgrade changed something user-visible. Diagnose against the spec's intent (mechanical migration only, zero user-visible change except the deliberate robots-txt swap) before treating it as expected.

- [ ] **Step 5: No commit needed if everything passed unmodified**

If Step 2 or Step 4 required a fix, commit it separately:

```bash
git add <changed file>
git commit -m "Fix regression found by safety net after Astro 7 upgrade"
```
