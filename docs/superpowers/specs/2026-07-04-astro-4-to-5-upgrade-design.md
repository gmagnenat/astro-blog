# Astro 4 → 5 upgrade

## Purpose

First step of an incremental Astro 4 → 7 major upgrade (sub-project 1 of 3: 4→5, 5→6, 6→7).
Each step is upgraded, migrated, and verified independently before moving to the next.

## Background

Astro 5's headline breaking change is the new **Content Layer API** for content collections.
The old `defineCollection({type: 'content', schema})` syntax still works via a `legacy.collections`
flag, but that flag is a deprecated stopgap slated for removal in a later major — so this step
migrates to the new API now rather than deferring it.

Other Astro 5 changes (server-only `astro:content`, TypeScript types moving to
`.astro/types.d.ts`, `<ViewTransitions />` → `<ClientRouter />`, adapter API churn) don't apply
to this project: no client-side content imports, no view transitions, no SSR adapter (static
build only).

## Approach

### 1. Bump Astro and official integrations

Run `pnpm dlx @astrojs/upgrade`. This bumps `astro` and `@astrojs/*` packages (here:
`@astrojs/check`, `@astrojs/tailwind`) to their latest Astro-5-compatible versions in one step,
including resolving the `@astrojs/check` / TypeScript version pairing itself.

Third-party integrations (`astro-expressive-code`, `@expressive-code/plugin-line-numbers`,
`@shikijs/transformers`, `astro-robots-txt`, `astro-seo`) are not touched by that CLI — bump
each manually to its latest version that lists Astro 5 support. All are confirmed to still work
on Astro 5 (no forced replacement the way Tailwind's integration will need later); no code
changes expected here.

### 2. Migrate content collections to the Content Layer API

**`src/content/config.ts` → `src/content.config.ts`**, rewritten to use `glob()` loaders:

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

`PostSchema.ts` and `JobSchema.ts` keep their current shape — the `({ image }) => z.object({...})`
schema-callback signature is unchanged by the Content Layer API.

The glob loader defaults an entry's `id` to the kebab-case filename (matching every current
filename already), so no post/job/tag URL changes — but the property name flips from `slug` to
`id`, and the `.render()` method on an entry is replaced by a standalone `render(entry)` import.

**Files touched, and their exact change:**

- `src/content/config.ts` → deleted, replaced by `src/content.config.ts` (above)
- `src/components/JobCard.astro`: `job.render()` → `render(job)`, importing `render` from `astro:content`
- `src/components/BlogCard.astro`: `post.slug` → `post.id`; `post.render()` → `render(post)`
- `src/layouts/MarkdownPostLayout.astro`: `post.slug` → `post.id`
- `src/pages/post/[...slug].astro`: `post.slug` → `post.id` (both in `getStaticPaths`'s `params: { slug: post.id }` and anywhere else referenced); `post.render()` → `render(post)`

`src/pages/post/tags/[...slug].astro` and `src/pages/posts.astro` / `src/pages/cv.astro` only
read `post.data.*` / `job.data.*` — untouched by the `slug` → `id` rename.

### 3. Verify

- `pnpm build` (runs `astro check && astro build`) passes with zero type errors and zero build
  warnings about the legacy collections API.
- `pnpm test` (Vitest build-output safety net) passes unmodified.
- `pnpm test:e2e` (Playwright page-load safety net) passes unmodified.

If either safety-net suite needs code changes to stay green, that's a signal this step changed
user-visible behavior (URLs, headings, page structure) beyond the intended internal API
migration — stop and investigate before continuing to the 5→6 step.

## Out of scope

- Astro 5→6 and 6→7 upgrades (separate sub-projects, done after this one is verified green).
- Tailwind v3→v4 migration / replacing `@astrojs/tailwind` (separate follow-up project; the
  integration still works on Astro 5).
- Any new features or refactors unrelated to the version bump.

## Verification

- `pnpm build && pnpm test && pnpm test:e2e` all pass on the upgraded branch.
- `git diff` against pre-upgrade `develop` shows only: dependency version bumps, the
  `content.config.ts` rewrite, and the five `slug`/`render()` call-site updates listed above —
  no incidental changes.
