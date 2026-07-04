# Upgrade Safety-Net Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a minimal automated safety net (Vitest build-output check + Playwright e2e page-load check) that catches regressions before the upcoming Astro 4→7 major upgrade.

**Architecture:** Two independent test layers per Astro's documented testing guidance. Vitest asserts expected files exist in `dist/` after `astro build` (reads post slugs/tags live from `src/content/posts/*.md`, no hardcoding). Playwright starts `astro preview` and visits key routes, asserting HTTP 200, expected heading text, and zero console errors.

**Tech Stack:** Vitest, @playwright/test, @types/node (all new devDependencies).

---

### Task 1: Install test tooling and wire configs

**Goal:** Add Vitest and Playwright as devDependencies, with configs that keep the two suites from colliding, and `pnpm test` / `pnpm test:e2e` scripts.

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`

**Acceptance Criteria:**
- [ ] `pnpm exec vitest --version` prints a version
- [ ] `pnpm exec playwright --version` prints a version
- [ ] Chromium browser installed for Playwright
- [ ] `package.json` has `test` and `test:e2e` scripts

**Verify:** `pnpm exec vitest --version && pnpm exec playwright --version` → both print version strings, no errors

**Steps:**

- [ ] **Step 1: Install devDependencies**

Run: `pnpm add -D vitest @playwright/test @types/node`

- [ ] **Step 2: Install Playwright's Chromium browser binary**

Run: `pnpm exec playwright install chromium`
Expected: downloads and reports Chromium installed (needed — a fresh `@playwright/test` install has no browser binaries yet, and `playwright test` fails immediately without this step)

- [ ] **Step 3: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
  },
});
```

This scopes Vitest to `test/` only, so it never picks up Playwright's `e2e/**/*.spec.ts` files.

- [ ] **Step 4: Write `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'pnpm preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  use: {
    baseURL: 'http://localhost:4321',
  },
});
```

- [ ] **Step 5: Add scripts to `package.json`**

In the `"scripts"` object, add:

```json
    "test": "astro build && vitest run",
    "test:e2e": "playwright test"
```

Resulting `"scripts"` block:

```json
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test": "astro build && vitest run",
    "test:e2e": "playwright test"
  },
```

- [ ] **Step 6: Verify tooling installed**

Run: `pnpm exec vitest --version && pnpm exec playwright --version`
Expected: both print version numbers, exit code 0

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts playwright.config.ts
git commit -m "Add Vitest and Playwright test tooling"
```

---

### Task 2: Vitest build-output safety net test

**Goal:** A Vitest suite that, after `astro build`, asserts every expected page exists in `dist/` — static pages, one page per post, one page per tag, and `robots.txt`.

**Files:**
- Create: `test/build.test.ts`

**Acceptance Criteria:**
- [ ] Running `vitest run` against a stale/missing `dist/` fails (proves the test actually checks something)
- [ ] Running `pnpm build && pnpm exec vitest run` passes with all assertions green
- [ ] Test derives post slugs and tags from `src/content/posts/*.md` at run time — no hardcoded slug/tag list

**Verify:** `rm -rf dist && pnpm exec vitest run` → fails; `pnpm build && pnpm exec vitest run` → all tests pass

**Steps:**

- [ ] **Step 1: Write the test**

Create `test/build.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const POSTS_DIR = join(process.cwd(), 'src/content/posts');
const DIST_DIR = join(process.cwd(), 'dist');

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error('no frontmatter block found');
  }
  const frontmatter = match[1];
  const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/);
  const tags = tagsMatch
    ? tagsMatch[1]
        .split(',')
        .map((tag) => tag.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    : [];
  return { tags };
}

function getPosts() {
  const files = readdirSync(POSTS_DIR).filter((file) => file.endsWith('.md'));
  return files.map((file) => {
    const raw = readFileSync(join(POSTS_DIR, file), 'utf-8');
    const { tags } = parseFrontmatter(raw);
    return { slug: file.replace(/\.md$/, ''), tags };
  });
}

describe('build output', () => {
  const staticPages = [
    'index.html',
    'about/index.html',
    'cv/index.html',
    'posts/index.html',
    'postscollection/index.html',
  ];

  it.each(staticPages)('generates dist/%s', (page) => {
    expect(existsSync(join(DIST_DIR, page))).toBe(true);
  });

  it('generates dist/robots.txt', () => {
    expect(existsSync(join(DIST_DIR, 'robots.txt'))).toBe(true);
  });

  const posts = getPosts();

  it.each(posts.map((post) => post.slug))('generates dist/post/%s/index.html', (slug) => {
    expect(existsSync(join(DIST_DIR, 'post', slug, 'index.html'))).toBe(true);
  });

  const tags = [...new Set(posts.flatMap((post) => post.tags))];

  it.each(tags)('generates dist/post/tags/%s/index.html', (tag) => {
    expect(existsSync(join(DIST_DIR, 'post', 'tags', tag, 'index.html'))).toBe(true);
  });
});
```

- [ ] **Step 2: Confirm the test fails without a build**

Run: `rm -rf dist && pnpm exec vitest run`
Expected: FAIL — every `existsSync` assertion returns `false` (dist doesn't exist)

- [ ] **Step 3: Build and confirm the test passes**

Run: `pnpm build && pnpm exec vitest run`
Expected: PASS — all static pages, all 4 post pages, all tag pages (`code`, `javascript`, `learning`, `canvas`, `accessibility`), and `robots.txt` found

- [ ] **Step 4: Commit**

```bash
git add test/build.test.ts
git commit -m "Add Vitest build-output safety net test"
```

---

### Task 3: Playwright e2e page-load test

**Goal:** A Playwright suite that loads key routes against `astro preview` and asserts each returns 200, shows its expected heading, and logs zero console errors.

**Files:**
- Create: `e2e/pages.spec.ts`

**Acceptance Criteria:**
- [ ] All 6 routes (`/`, `/about`, `/cv`, `/posts`, one post, one tag) are covered
- [ ] Each assertion checks HTTP status, heading text, and console error count
- [ ] `pnpm build && pnpm test:e2e` passes

**Verify:** `pnpm build && pnpm exec playwright test` → all tests pass, 0 failures

**Steps:**

- [ ] **Step 1: Write the spec**

Create `e2e/pages.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', heading: 'Gwenaël Magnenat' },
  { path: '/about', heading: 'About me' },
  { path: '/cv', heading: 'CV' },
  { path: '/posts', heading: 'Latest blog' },
  { path: '/post/firstpost', heading: 'Drawing a Dynamic Grid with Canvas and JavaScript' },
  { path: '/post/tags/code', heading: 'Latest blog : code' },
];

for (const { path, heading } of pages) {
  test(`${path} loads with no console errors`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto(path);

    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText(heading);
    expect(consoleErrors).toEqual([]);
  });
}
```

- [ ] **Step 2: Build the site**

Run: `pnpm build`
Expected: build succeeds, `dist/` populated

- [ ] **Step 3: Run the e2e suite**

Run: `pnpm exec playwright test`
Expected: PASS — 6 tests pass, 0 failures

- [ ] **Step 4: Commit**

```bash
git add e2e/pages.spec.ts
git commit -m "Add Playwright e2e page-load safety net test"
```

---

### Task 4: Wire CI-friendly full run and confirm baseline

**Goal:** Confirm both suites pass together as a single baseline run, on the current pre-upgrade `develop` branch, so there's a known-good reference before the Astro major bump.

**Files:**
- None (verification only)

**Acceptance Criteria:**
- [ ] `pnpm test` passes (Vitest build-output suite)
- [ ] `pnpm test:e2e` passes (Playwright e2e suite)
- [ ] Both pass consecutively with no manual intervention

**Verify:** `pnpm test && pnpm test:e2e` → both suites pass, combined exit code 0

**Steps:**

- [ ] **Step 1: Run both suites back to back**

Run: `pnpm test && pnpm test:e2e`
Expected: Vitest suite passes, then Playwright suite passes, final exit code 0

- [ ] **Step 2: If anything fails, fix before proceeding**

Any failure here means Task 1–3 code has a bug (wrong slug, wrong heading text, port mismatch) — fix the specific test/config, not the site. Re-run Step 1 until green.

- [ ] **Step 3: No commit needed**

This task is verification-only; nothing changes on disk if Steps 1–2 succeeded on the first try. If a fix was needed in Step 2, commit that fix with a message describing what was wrong, e.g.:

```bash
git add e2e/pages.spec.ts
git commit -m "Fix heading text mismatch in e2e page-load test"
```
