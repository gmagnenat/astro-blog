# Astro 5 → 6 upgrade

## Purpose

Second step of an incremental Astro 4 → 7 major upgrade (sub-project 2 of 3: 4→5 done, 5→6 this
step, 6→7 next). Astro 6 forces two real fixes beyond the version bump itself: dropping
`@astrojs/tailwind` (Vite 7 broke it, unfixable upstream) and moving off `astro:content`'s `z`
re-export (Zod v4).

## Background

Research findings this step is built on:

- **Node**: Astro 6 requires Node ≥22.12.0. Current environment is Node 24.11 — no action needed.
- **Zod v4**: required by Astro 6. `import { z } from 'astro:content'` / `astro:schema` is
  deprecated in favor of `import { z } from 'astro/zod'`. This project's schema methods
  (`z.object()`, `z.string()`, `z.array()`, `z.boolean()`, `z.date()`, `.optional()`, `.default()`,
  `.or()`, `.transform()`) are unaffected by v4's breaking changes (those hit `.email()`/`.url()`
  and `.transform()` + `.default()` interactions — neither pattern exists in this project's
  schemas). This is a pure import-path change.
- **`@astrojs/tailwind`**: confirmed broken and not coming back — Astro's own maintainers closed
  the compatibility request, recommending plain PostCSS + Tailwind 3 instead of the integration.
  This is a required fix, not optional, to build on Astro 6/Vite 7.
- **`astro-expressive-code`**: latest (0.44.0) claims Astro 6/7 peer support, but a bundling bug
  (`"Theme is not included in this bundle"`, present 0.39.0+) has no confirmed fix in the
  changelog. Must be tested empirically; `removeUnusedThemes: false` is the documented workaround
  if it reproduces.
- **`astro-robots-txt` / `astro-seo`**: no known incompatibilities, but unverified — caught by the
  build/safety-net if something breaks.
- **Heading-ID trailing-hyphen change**: confirmed non-issue — this project has no in-page anchor
  links referencing headings.

## Approach

### 1. Bump Astro core

Run `pnpm dlx @astrojs/upgrade`, confirming it lands on Astro 6.x this time (last step it tried to
jump to 7 and was rejected). Bumps `astro` and official `@astrojs/*` packages.

### 2. Replace `@astrojs/tailwind` with plain PostCSS

- Remove the `tailwind()` integration import and usage from `astro.config.mjs`.
- Add `postcss.config.mjs`:
  ```js
  export default {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };
  ```
- Add `tailwindcss` and `autoprefixer` as direct devDependencies (currently only transitive via
  the integration being removed).
- Add to the top of `src/styles/global.css`:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```
  (previously auto-injected by `@astrojs/tailwind`).
- `tailwind.config.mjs` and `fluid-tailwind` plugin registration are untouched — same Tailwind 3
  config, just without the Astro integration wrapper.

### 3. Zod v4 import path

In `src/schemas/PostSchema.ts` and `src/schemas/JobSchema.ts`, change:
```ts
import { z, type SchemaContext } from 'astro:content';
```
and
```ts
import { z } from 'astro:content';
```
to import both `z` and `SchemaContext` from `astro/zod` instead. No other schema code changes —
confirmed no breaking-change patterns present.

### 4. astro-expressive-code bump

Bump `astro-expressive-code` and `@expressive-code/plugin-line-numbers` to latest (0.44.0) and
build. If the `"Theme is not included in this bundle"` bug reproduces (as it did going from
0.38.3 → 0.39+ on Astro 5), add `removeUnusedThemes: false` to the `astroExpressiveCode(...)`
options in `astro.config.mjs` as the documented workaround. If that doesn't resolve it, stop and
escalate rather than improvising further — a deeper fix would be new scope.

### 5. Other third-party bumps

Bump `astro-robots-txt` and `astro-seo` to latest. No code changes expected.

### 6. Verify

`pnpm build`, `pnpm test` (Vitest), `pnpm test:e2e` (Playwright) must all pass unmodified — same
bar as the 4→5 step. Any needed test-file edit is a signal of user-visible regression, not
something to paper over.

## Out of scope

- Astro 6→7 (next sub-project, after this one is verified green).
- Migrating to Tailwind v4's CSS-first config (this step stays on Tailwind 3, just removes the
  deprecated Astro wrapper around it).
- Any new features or refactors unrelated to the version bump.

## Verification

- `pnpm build && pnpm test && pnpm test:e2e` all pass on the upgraded branch.
- Visual/behavioral parity: no Tailwind utility classes should render differently — the PostCSS
  pipeline compiles the exact same `tailwind.config.mjs` as before, just via a different plugin
  wiring.
