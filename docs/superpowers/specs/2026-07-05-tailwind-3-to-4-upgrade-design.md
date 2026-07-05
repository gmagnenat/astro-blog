# Tailwind 3 → 4 upgrade

## Purpose

Bump Tailwind from 3.4.19 to 4.x. Third and last of three independent major-version bumps
requested together (Vitest done → TypeScript done → Tailwind this step).

## Background

Current setup: `tailwindcss@3.4.19` + `autoprefixer` via plain PostCSS
(`postcss.config.mjs` + `@tailwind base/components/utilities` in `src/styles/global.css`),
config in `tailwind.config.mjs` (custom colors `gm-blue`/`gm-dark`, content globs).

Blocker: `fluid-tailwind@1.0.4` (latest) still declares `peerDependencies.tailwindcss: "^3.2.0"`
— no v4 support. It's used for fluid text/spacing sizing (`~text-4xl/5xl`, `~px-4/8`, etc.)
across 9 template files, 14 unique utility combinations total.

Resolution (user-approved): drop fluid-tailwind, replace it with static CSS. Built the site on
the current (pre-upgrade) commit and extracted the exact `clamp()` rules fluid-tailwind
generates today for every combination actually used in the codebase:

```css
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

Confirmed the viewport breakpoints fluid-tailwind's exported `screens`/`fontSize` theme
overrides use are numerically identical to Tailwind's defaults (40/48/64/80/96rem =
sm/md/lg/xl/2xl) — so no other part of the design (breakpoint-dependent classes like `md:`)
is affected by removing that override.

Pasting these 14 rules as static CSS means **zero changes to any of the 9 template files** —
the literal class strings (`~text-2xl/4xl`, etc.) stay exactly as they are; only their CSS
now comes from a hand-authored block instead of a plugin.

## Approach

**1. Swap the Tailwind engine.**
- Remove: `tailwindcss@3.4.19`, `autoprefixer`, `postcss.config.mjs`.
- Add: `@tailwindcss/vite` (Tailwind's official Vite plugin — the recommended integration
  path for Vite-based frameworks; v4 has autoprefixing built in, no separate PostCSS
  pipeline needed).
- Wire it into `astro.config.mjs` via `vite: { plugins: [tailwindcss()] }`.

**2. Migrate config to CSS-first `@theme`.**
- Delete `tailwind.config.mjs`.
- In `src/styles/global.css`, replace the three `@tailwind` directives with `@import
  "tailwindcss";` and add:
  ```css
  @theme {
    --color-gm-blue: #0099FF;
    --color-gm-dark: #202020;
  }
  ```
- Content detection is automatic in v4 (no `content` globs to port).

**3. Remove fluid-tailwind, add static fluid CSS.**
- Remove `fluid-tailwind` from `package.json`.
- Append the 14 extracted rules (verbatim, see Background) to `global.css`.

## Out of scope

- Vitest 2→4 (done, merged).
- TypeScript 5→6 (done, merged).
- Any redesign of the fluid sizing scale itself (values are preserved exactly as generated
  pre-upgrade, not recomputed or rounded).
- `@tailwindcss/upgrade` automated codemod — not used; the config surface is small enough
  (one color pair, no plugins beyond fluid-tailwind) that manual migration is more legible
  and this spec documents the mapping directly.

## Verification

- `pnpm exec tailwindcss --help` (or checking `node_modules/tailwindcss/package.json`)
  confirms a 4.x version installed.
- `pnpm build` succeeds with no missing-utility warnings.
- Visual/structural parity: rendered HTML class lists for `/`, `/about`, `/cv`, `/posts`,
  `/post/firstpost` are unchanged (fluid classes are untouched strings); computed
  `font-size`/`line-height`/`padding`/`margin` for elements using fluid classes match the
  pre-upgrade values (spot-checked against the extracted clamp() rules).
- `gm-blue` / `gm-dark` colors still resolve (grep template usage, confirm rendered CSS
  contains the same hex values).
- `pnpm test` and `pnpm test:e2e` both pass, including the existing hero-whitespace
  regression test.
