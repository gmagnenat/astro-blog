# TypeScript 5 → 6 upgrade

## Purpose

Bump TypeScript from 5.9.3 to latest 6.x. Second of three independent, unrelated major-version
bumps requested together (Vitest done and merged → TypeScript this step → Tailwind next); each
gets its own spec/plan/verification cycle.

## Background

This project has zero direct TypeScript authoring beyond a couple of Zod schema files — no `tsc`
invocation in any script, all type-checking happens via `astro check` (which uses
`@astrojs/check`). `tsconfig.json` only extends `astro/tsconfigs/strict`, no overrides.

Research + an empirical test confirm this is a clean bump:
- TS 6.0 is fully stable (`latest` dist-tag is `6.0.3`, released 2026-03-23), not beta/RC.
- `@astrojs/check@0.9.9` (already installed) declares `peerDependencies.typescript: "^5.0.0 ||
  ^6.0.0"` — already supports TS 6.
- TS 6.0's breaking changes (strict defaults to true, esModuleInterop/allowSyntheticDefaultImports
  can't be false, moduleResolution classic/node10 removed, module defaults to esnext, `types`
  defaults to `[]` instead of auto-including all `@types/*`) all match what
  `astro/tsconfigs/strict` already sets explicitly — none of them change behavior for this
  project.
- Node requirement unchanged (`>=14.17`, well under this project's `>=22.12.0`).
- Empirically verified: temporarily installed `typescript@6.0.3` in the actual repo and ran
  `astro check` — 0 errors, 0 warnings, the same 3 pre-existing unused-variable hints as before.
  Reverted cleanly.

## Approach

Single task: `pnpm add -D typescript@latest`, then verify:
- `pnpm build` (`astro check && astro build`) succeeds with the same 0 errors / 3 pre-existing
  hints as before — no new diagnostics.
- `pnpm test` and `pnpm test:e2e` pass unmodified (sanity check, though TypeScript itself isn't
  exercised by those suites beyond `astro check` inside `pnpm test`'s build step).

No code changes are expected in `tsconfig.json` or anywhere else. If `astro check` surfaces new
diagnostics, that's a signal the empirical pre-test didn't cover something (e.g. a version
between 6.0.3 and whatever "latest" resolves to at execution time) — investigate and report
rather than silently loosening the tsconfig to suppress it.

## Out of scope

- Vitest 2→4 (done, merged).
- Tailwind 3→4 (separate, subsequent sub-project).
- Any tsconfig changes beyond what's forced by a genuine new error (none anticipated).

## Verification

- `pnpm add -D typescript@latest` lands on a 6.x version.
- `pnpm build` shows the same diagnostic count as pre-upgrade (0 errors, 0 warnings, 3 hints).
- `pnpm test` and `pnpm test:e2e` both pass.
