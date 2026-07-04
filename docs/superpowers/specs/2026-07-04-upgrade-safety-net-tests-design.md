# Upgrade safety-net tests

## Purpose

Before bumping Astro 4 → 7 (and other majors: Tailwind, TypeScript), establish a minimal
automated safety net that catches build and rendering regressions. Not a general-purpose
test suite — scoped to "did the upgrade break the site."

## Approach

Two layers, both following Astro's documented testing guidance (Vitest for unit/build
checks, Playwright for e2e):

### 1. Vitest — build output check

`test/build.test.ts`:
- Runs against an already-built `dist/` (test script chains `astro build && vitest run`).
- Reads `src/content/posts/*.md` frontmatter to get the live list of post slugs and tags —
  no hardcoded content list, stays valid as posts are added/removed.
- Asserts these exist on disk:
  - `dist/index.html`
  - `dist/about/index.html`
  - `dist/cv/index.html`
  - `dist/posts/index.html`
  - `dist/postscollection/index.html`
  - `dist/post/<slug>/index.html` for every post
  - `dist/post/tags/<tag>/index.html` for every distinct tag
  - `dist/robots.txt`

### 2. Playwright — e2e page load check

`e2e/pages.spec.ts`:
- Playwright config starts `astro preview` as the `webServer` (builds must run first).
- Visits key routes: `/`, `/about`, `/cv`, `/posts`, one representative post page, one
  representative tag page.
- Per page, asserts:
  - HTTP response status 200
  - Expected `<h1>` (or page title) text is present
  - Zero `console.error` events fired during load

## Out of scope

- Component-level unit tests, schema unit tests, remark plugin unit tests.
- Interaction tests (menu open/close, nav click-through) — page-load coverage only for now.
- Visual regression / screenshot diffing.
- Broken-link/asset crawling of generated HTML.

## Dependencies added

- `vitest` (devDependency)
- `@playwright/test` (devDependency)

## package.json scripts

- `"test": "astro build && vitest run"`
- `"test:e2e": "playwright test"`

## Verification

- `pnpm test` passes on current `develop` (pre-upgrade baseline).
- `pnpm test:e2e` passes on current `develop` (pre-upgrade baseline).
- After the future Astro major bump, both suites are the first check run to catch
  regressions.
