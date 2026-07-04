# Astro 4 to 5 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bump Astro 4.16 → 5.x and migrate content collections to the Content Layer API, the one breaking change in this step, verified green by the existing Vitest/Playwright safety net.

**Architecture:** Run the official `@astrojs/upgrade` CLI to bump Astro core and `@astrojs/*` packages, manually bump third-party integrations, then rewrite `src/content/config.ts` to the new `glob()`-loader API and update the five call sites that used the old `.slug`/`.render()` entry API.

**Tech Stack:** Astro 5, `astro/loaders` (`glob`), existing Vitest + Playwright safety net.

---

### Task 1: Bump Astro core and all integrations

**Goal:** Astro and every integration in `package.json` is on its latest Astro-5-compatible version, with the site still building on the OLD content collections API (Astro 5 supports the old syntax via a deprecation warning, not a hard error) — isolating "did the version bump alone break anything" from the content-layer migration in Task 2.

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Acceptance Criteria:**
- [ ] `pnpm astro --version` reports a 5.x version
- [ ] `pnpm build` succeeds (may print a content-collections deprecation warning — that's expected and resolved in Task 2)
- [ ] No dependency in `package.json` still resolves to an Astro-4-only version

**Verify:** `pnpm astro --version` → prints `5.x.x`; `pnpm build` → exits 0

**Steps:**

- [ ] **Step 1: Run the official upgrade CLI**

Run: `pnpm dlx @astrojs/upgrade`
Expected: bumps `astro`, `@astrojs/check`, `@astrojs/tailwind` in `package.json` to Astro-5-compatible versions, and updates `pnpm-lock.yaml`. It prints a summary of what changed.

- [ ] **Step 2: Bump third-party integrations manually**

Run: `pnpm add astro-expressive-code@latest @expressive-code/plugin-line-numbers@latest @shikijs/transformers@latest astro-robots-txt@latest astro-seo@latest`
Expected: `package.json` versions bump, install succeeds with no peer-dependency errors

- [ ] **Step 3: Attempt a build**

Run: `pnpm build`
Expected: build completes (exit 0). A console warning about the deprecated `type: 'content'` collections API is expected here — that's the Task 2 migration, not a failure. Any other error (peer dependency conflict, integration crash) must be resolved before proceeding — check the specific package's changelog/GitHub issues for the Astro 5 compatibility fix.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "Bump Astro to 5.x and all integrations to compatible versions"
```

---

### Task 2: Migrate content collections to the Content Layer API

**Goal:** Replace the deprecated `defineCollection({type: 'content', schema})` syntax with the `glob()`-loader Content Layer API, and update every call site that used the old entry's `.slug`/`.render()` shape.

**Files:**
- Delete: `src/content/config.ts`
- Create: `src/content.config.ts`
- Modify: `src/components/JobCard.astro`
- Modify: `src/components/BlogCard.astro`
- Modify: `src/layouts/MarkdownPostLayout.astro`
- Modify: `src/pages/post/[...slug].astro`

**Acceptance Criteria:**
- [ ] `src/content.config.ts` exists, `src/content/config.ts` is deleted
- [ ] No file references `astro:content`'s `defineCollection({type: 'content', ...})` form
- [ ] No file calls `.render()` on a collection entry; all use the standalone `render(entry)` import
- [ ] No file reads `.slug` on a posts/jobs collection entry; all use `.id`
- [ ] `pnpm build` succeeds with no content-collections deprecation warning

**Verify:** `pnpm build` → exits 0, no deprecation warning about `type: 'content'`

**Steps:**

- [ ] **Step 1: Delete the old config and create the new one**

Delete `src/content/config.ts`.

Create `src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { postSchema } from './schemas/PostSchema';
import { jobSchema } from './schemas/JobSchema';

const postCollection = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
    schema: postSchema,
});

const jobCollection = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/jobs' }),
    schema: jobSchema,
});

export const collections = {
    posts: postCollection,
    jobs: jobCollection,
};
```

- [ ] **Step 2: Update `src/components/JobCard.astro`**

Change:

```astro
import { type CollectionEntry } from "astro:content";


const { job } = Astro.props as {job: CollectionEntry<"jobs">};
const { Content } = await job.render();
```

To:

```astro
import { type CollectionEntry, render } from "astro:content";


const { job } = Astro.props as {job: CollectionEntry<"jobs">};
const { Content } = await render(job);
```

- [ ] **Step 3: Update `src/components/BlogCard.astro`**

Change:

```astro
import Image from "astro/components/Image.astro"
const { post } = Astro.props;
const slug = post.slug;
const { remarkPluginFrontmatter } = await post.render();
```

To:

```astro
import Image from "astro/components/Image.astro"
import { render } from "astro:content";
const { post } = Astro.props;
const slug = post.id;
const { remarkPluginFrontmatter } = await render(post);
```

- [ ] **Step 4: Update `src/layouts/MarkdownPostLayout.astro`**

Change:

```astro
Object.entries(images).map(([key]) => {
  if (key.startsWith(`/src/assets/${post.slug}/slider/`)) postImages.push(key);
})
```

To:

```astro
Object.entries(images).map(([key]) => {
  if (key.startsWith(`/src/assets/${post.id}/slider/`)) postImages.push(key);
})
```

- [ ] **Step 5: Update `src/pages/post/[...slug].astro`**

Change:

```astro
import { getCollection } from 'astro:content';
import MarkdownPostLayout from '../../layouts/MarkdownPostLayout.astro';

export async function getStaticPaths() {
    const posts = await getCollection('posts');
    return posts.map((post) => ({
        params: { slug: post.slug },
        props: { post }
    }));
}

const { post } = Astro.props;
const { Content } = await post.render();
```

To:

```astro
import { getCollection, render } from 'astro:content';
import MarkdownPostLayout from '../../layouts/MarkdownPostLayout.astro';

export async function getStaticPaths() {
    const posts = await getCollection('posts');
    return posts.map((post) => ({
        params: { slug: post.id },
        props: { post }
    }));
}

const { post } = Astro.props;
const { Content } = await render(post);
```

- [ ] **Step 6: Build and confirm the deprecation warning is gone**

Run: `pnpm build`
Expected: exit 0, no warning mentioning `type: 'content'` or legacy collections

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/components/JobCard.astro src/components/BlogCard.astro src/layouts/MarkdownPostLayout.astro src/pages/post/[...slug].astro
git rm src/content/config.ts
git commit -m "Migrate content collections to the Content Layer API"
```

---

### Task 3: Verify full safety net green

**Goal:** Confirm the upgraded site passes both safety-net suites unmodified, proving the upgrade didn't change user-visible behavior.

**Files:**
- None (verification only)

**Acceptance Criteria:**
- [ ] `pnpm test` (Vitest build-output suite) passes with zero changes to `test/build.test.ts`
- [ ] `pnpm test:e2e` (Playwright page-load suite) passes with zero changes to `e2e/pages.spec.ts`
- [ ] `pnpm build` shows zero TypeScript errors and zero deprecation warnings

**Verify:** `pnpm test && pnpm test:e2e` → both suites pass, combined exit code 0

**Steps:**

- [ ] **Step 1: Run the full safety net**

Run: `pnpm test && pnpm test:e2e`
Expected: Vitest suite passes (15 tests), Playwright suite passes (6 tests), final exit code 0

- [ ] **Step 2: If either suite fails or needed a code edit, investigate before continuing**

A failure here — or a need to edit `test/build.test.ts` / `e2e/pages.spec.ts` to make it pass — means the upgrade changed something user-visible (a URL, a heading, page structure). Diagnose against the spec's intent (internal API migration only, no behavior change) before treating it as expected and moving on to the 5→6 step.

- [ ] **Step 3: No commit needed if everything passed unmodified**

If Step 2 required a fix, commit it separately:

```bash
git add <changed file>
git commit -m "Fix regression found by safety net after Astro 5 upgrade"
```
