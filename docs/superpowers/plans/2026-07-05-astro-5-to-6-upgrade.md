# Astro 5 to 6 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bump Astro 5.18 → 6.x, replacing `@astrojs/tailwind` with plain PostCSS (forced by Vite 7) and moving schema `z`/`SchemaContext` imports off the deprecated `astro:content` re-export (Zod v4), verified green by the existing Vitest/Playwright safety net.

**Architecture:** Because the version bump alone breaks the build (two forced, unrelated fixes are needed before `astro build` can succeed again), this plan lands each fix as its own task/commit rather than bundling everything into one "bump" task like the 4→5 plan did. Order matters: core bump → Tailwind swap → Zod import fix → expressive-code bump (the riskiest, most uncertain piece) → full verification.

**Tech Stack:** Astro 6, plain PostCSS + Tailwind 3 (no Astro integration), Zod v4 via `astro/zod`, existing Vitest + Playwright safety net.

---

### Task 1: Bump Astro core and low-risk integrations

**Goal:** Astro core and the two integrations with no known compatibility risk (`astro-robots-txt`, `astro-seo`) are on Astro-6-compatible versions. The build is EXPECTED to still fail after this task — that's normal, not a bug, because `@astrojs/tailwind` and the `astro:content` Zod re-export are both broken on Astro 6 and get fixed in Tasks 2 and 3.

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Acceptance Criteria:**
- [ ] `pnpm astro --version` reports a 6.x version
- [ ] `astro-robots-txt` and `astro-seo` are bumped to their latest versions
- [ ] `@astrojs/tailwind`, `astro-expressive-code`, and `@expressive-code/plugin-line-numbers` are NOT touched in this task (they're handled in Tasks 2 and 4)

**Verify:** `pnpm astro --version` → prints `6.x.x`

**Steps:**

- [ ] **Step 1: Run the official upgrade CLI**

Run: `pnpm dlx @astrojs/upgrade`
Expected: bumps `astro` and `@astrojs/check` to Astro-6-compatible versions. If it also touches `@astrojs/tailwind`, that's fine — Task 2 removes that package entirely regardless of what version it lands on.

- [ ] **Step 2: Bump the two low-risk third-party integrations**

Run: `pnpm add astro-robots-txt@latest astro-seo@latest`

- [ ] **Step 3: Confirm the version bump landed**

Run: `pnpm astro --version`
Expected: prints a `6.x.x` version

- [ ] **Step 4: Attempt a build (informational only — failure is expected)**

Run: `pnpm build`
Expected: FAILS. Confirm the failure is about one of the two known issues — either `@astrojs/tailwind` (a peer-dependency or Vite-plugin-resolution error) or the deprecated `z`/`SchemaContext` import from `astro:content` (a type or runtime import error) — not something unrelated. If the failure is about something else entirely, stop and investigate before proceeding; that would mean a third, undocumented breaking change slipped in.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "Bump Astro to 6.x and low-risk integrations"
```

---

### Task 2: Replace @astrojs/tailwind with plain PostCSS

**Goal:** Remove the deprecated `@astrojs/tailwind` integration and wire up Tailwind 3 directly via PostCSS, with zero visual/behavioral change to the compiled CSS.

**Files:**
- Modify: `astro.config.mjs`
- Modify: `package.json`
- Create: `postcss.config.mjs`
- Modify: `src/styles/global.css`

**Acceptance Criteria:**
- [ ] `astro.config.mjs` no longer imports or uses `@astrojs/tailwind`
- [ ] `package.json` no longer lists `@astrojs/tailwind`; lists `tailwindcss` and `autoprefixer` as direct devDependencies
- [ ] `postcss.config.mjs` exists with `tailwindcss` and `autoprefixer` plugins
- [ ] `src/styles/global.css` starts with the three `@tailwind` directives
- [ ] `tailwind.config.mjs` is unchanged (same content, same `fluid-tailwind` plugin registration)

**Verify:** `pnpm build` no longer fails with a Tailwind-integration-related error (it may still fail on the Zod import issue — that's fixed in Task 3, not this one)

**Steps:**

- [ ] **Step 1: Remove `@astrojs/tailwind` from `astro.config.mjs`**

Current content:

```js
import { defineConfig } from 'astro/config';
import { remarkReadingTime } from './remark-reading-time.mjs';
import tailwind from "@astrojs/tailwind";
import robotsTxt from "astro-robots-txt";

import astroExpressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: 'https://gmagnenat.com/',
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
```

Change to:

```js
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
```

- [ ] **Step 2: Remove `@astrojs/tailwind` and add direct PostCSS dependencies**

Run: `pnpm remove @astrojs/tailwind && pnpm add -D tailwindcss@^3 autoprefixer@latest`

(`tailwindcss@^3` pins to Tailwind 3 — this step does NOT migrate to Tailwind v4, that's an explicitly separate future project)

- [ ] **Step 3: Create `postcss.config.mjs`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 4: Add Tailwind directives to `src/styles/global.css`**

At the very top of the file, before the existing content, add:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

The rest of `global.css` (the `.expressive-code`, `.post__content` rules) stays exactly as-is below these three lines.

- [ ] **Step 5: Attempt a build**

Run: `pnpm build`
Expected: the Tailwind-integration error from Task 1 is gone. The build may still fail on the Zod import issue (fixed in Task 3) — confirm any remaining failure is specifically about that, not about Tailwind/PostCSS.

- [ ] **Step 6: Commit**

```bash
git add astro.config.mjs package.json pnpm-lock.yaml postcss.config.mjs src/styles/global.css
git commit -m "Replace @astrojs/tailwind with plain PostCSS + Tailwind 3"
```

---

### Task 3: Fix Zod v4 import path in schemas

**Goal:** Update the two schema files to import `z` (and `SchemaContext`) from `astro/zod` instead of the deprecated `astro:content` re-export, required by Astro 6's move to Zod v4.

**Files:**
- Modify: `src/schemas/PostSchema.ts`
- Modify: `src/schemas/JobSchema.ts`

**Acceptance Criteria:**
- [ ] Neither schema file imports `z` or `SchemaContext` from `astro:content`
- [ ] Both import from `astro/zod` instead
- [ ] No other change to schema logic (field definitions, validators, defaults all identical)
- [ ] `pnpm build` no longer fails on a Zod/schema-related error (it may still fail on the expressive-code peer-dependency issue — fixed in Task 4)

**Verify:** `pnpm build` — Zod-import error is gone

**Steps:**

- [ ] **Step 1: Update `src/schemas/PostSchema.ts`**

Current first line:

```ts
import { z, type SchemaContext } from 'astro:content';
```

Change to:

```ts
import { z, type SchemaContext } from 'astro/zod';
```

Everything else in the file (`imageSchema`, `postSchema` definitions) is unchanged.

- [ ] **Step 2: Update `src/schemas/JobSchema.ts`**

Current first line:

```ts
import { z } from 'astro:content';
```

Change to:

```ts
import { z } from 'astro/zod';
```

Everything else in the file (`jobSchema` definition) is unchanged.

- [ ] **Step 3: Attempt a build**

Run: `pnpm build`
Expected: no error mentioning `z`, `SchemaContext`, `astro:content`, or Zod. Any remaining failure should be the expressive-code peer-dependency/bundling issue from the original Astro-6 bump — confirmed in Task 1 and fixed in Task 4.

- [ ] **Step 4: Commit**

```bash
git add src/schemas/PostSchema.ts src/schemas/JobSchema.ts
git commit -m "Fix Zod v4 import path in content schemas"
```

---

### Task 4: Bump astro-expressive-code and resolve the bundling risk

**Goal:** Bump `astro-expressive-code` and `@expressive-code/plugin-line-numbers` off the Astro-5-only `^0.38.3` pin to a version that supports Astro 6, applying the documented workaround if the previously-encountered theme-bundling bug reproduces.

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs` (only if the workaround is needed)

**Acceptance Criteria:**
- [ ] `astro-expressive-code` and `@expressive-code/plugin-line-numbers` are bumped to a version whose peer range includes Astro 6
- [ ] `pnpm build` succeeds with zero errors
- [ ] If the `"Theme is not included in this bundle"` error reproduces, `removeUnusedThemes: false` is added to the `astroExpressiveCode(...)` config in `astro.config.mjs` and the build is re-verified

**Verify:** `pnpm build` → exits 0, both configured themes (`dracula`, `solarized-light`) render correctly on a code block in the built output

**Steps:**

- [ ] **Step 1: Bump to latest**

Run: `pnpm add astro-expressive-code@latest @expressive-code/plugin-line-numbers@latest`
Expected: both land on `0.44.0` (or whatever is latest at execution time) — check `package.json` after.

- [ ] **Step 2: Attempt a build**

Run: `pnpm build`

- [ ] **Step 3a: If the build succeeds** — skip to Step 4.

- [ ] **Step 3b: If the build fails with `"Theme is not included in this bundle"` (or similar)** — apply the workaround.

In `astro.config.mjs`, find:

```js
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
  )
```

Change to:

```js
    astroExpressiveCode(
    {
      themes: ['dracula', 'solarized-light'],
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
  )
```

Re-run `pnpm build`.

- [ ] **Step 3c: If the workaround does NOT resolve the error** — STOP. Do not attempt further fixes (e.g. downgrading, patching node_modules, disabling the integration). Report this as blocked: the plan's spec explicitly scopes this to "try latest, apply the one documented workaround" — anything beyond that is new scope requiring a design decision, not a mechanical implementation step.

- [ ] **Step 4: Confirm both themes render**

Run: `pnpm build`, then check `dist/post/canvas-spiral-drawing/index.html` (or any built post page with a code block) for both `dracula` and `solarized-light` CSS class/style output — grep for both theme names in the built HTML/CSS:

```bash
grep -rl "dracula" dist/_astro/*.css && grep -rl "solarized-light" dist/_astro/*.css
```

Expected: both commands find a match (theme CSS is present in the built assets).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs
git commit -m "Bump astro-expressive-code to Astro 6 compatible version"
```

(If Step 3b wasn't needed, `astro.config.mjs` won't have changed — just commit `package.json`/`pnpm-lock.yaml`.)

---

### Task 5: Verify full safety net green

**Goal:** Confirm the fully-upgraded site (Astro 6, PostCSS Tailwind, Zod v4 imports, bumped expressive-code) passes both safety-net suites unmodified.

**Files:**
- None (verification only)

**Acceptance Criteria:**
- [ ] `pnpm test` (Vitest build-output suite) passes with zero changes to `test/build.test.ts`
- [ ] `pnpm test:e2e` (Playwright page-load suite) passes with zero changes to `e2e/pages.spec.ts`
- [ ] `pnpm build` shows zero errors and zero warnings

**Verify:** `pnpm test && pnpm test:e2e` → both suites pass, combined exit code 0

**Steps:**

- [ ] **Step 1: Run the full safety net**

Run: `pnpm test && pnpm test:e2e`
Expected: Vitest suite passes (15 tests), Playwright suite passes (6 tests), final exit code 0

- [ ] **Step 2: If either suite fails or needed a code edit, investigate before continuing**

A failure here — or a need to edit `test/build.test.ts` / `e2e/pages.spec.ts` to make it pass — means the upgrade changed something user-visible (a URL, a heading, page structure, a Tailwind style regression from the PostCSS swap). Diagnose against the spec's intent (mechanical migration only, zero user-visible change) before treating it as expected.

- [ ] **Step 3: No commit needed if everything passed unmodified**

If Step 2 required a fix, commit it separately:

```bash
git add <changed file>
git commit -m "Fix regression found by safety net after Astro 6 upgrade"
```
