# Vitest 2 → 4 upgrade

## Purpose

Bump Vitest from 2.1.9 to latest 4.x. First of three independent, unrelated major-version
bumps requested together (Vitest → TypeScript → Tailwind, in that order); each gets its own
spec/plan/verification cycle.

## Background

This project's Vitest usage is minimal: one test file (`test/build.test.ts`) using `describe`,
`it`, `it.each`, `expect`, with a `vitest.config.ts` that only sets `test.include`. No mocks,
spies, snapshots, coverage config, workspace config, or custom test environment.

Research confirms this is a clean version bump for this project specifically:
- Vitest 4 requires Node ≥20 (current: 24.11.1) and Vite ≥6.0.0/^7.0.0/^8.0.0 (current: Vite
  8.1.3, bundled via Astro 7 — satisfies the range; also above the 8.0.15 version affected by a
  known Vite security advisory some Vitest issues flagged as a concern).
- The one hard-breaking change relevant to a project this size — the deprecated third-argument
  `test(name, fn, options)` syntax now throwing in v4 — doesn't apply: `test/build.test.ts` has
  no such usage (confirmed via grep).
- No workspace config, no coverage config, no custom pool options — none of v3/v4's other
  breaking areas (workspace→projects, coverage remapping, pool option renames) apply here.

## Approach

Single task: `pnpm add -D vitest@latest`, then verify:
- `pnpm test` (Vitest build-output suite) passes unmodified.
- `pnpm test:e2e` (Playwright) unaffected — separate tool, not touched by this bump.
- `pnpm build` still succeeds (Vitest bump shouldn't affect the Astro build itself, but the
  `test` script chains `astro build && vitest run`, so confirming both stay green together is
  the natural single verification step).

No code changes are expected in `test/build.test.ts` or `vitest.config.ts`. If any turn out to
be needed, that's a signal something in the research was wrong — investigate rather than
force-adapting the test to pass.

## Out of scope

- TypeScript 5→6 and Tailwind 3→4 (separate, subsequent sub-projects).
- Any new Vitest features (coverage, workspace projects, custom environments) — not requested,
  not needed for this project's current test surface.

## Verification

- `pnpm add -D vitest@latest` lands on a 4.x version.
- `pnpm test` passes with zero changes to `test/build.test.ts` or `vitest.config.ts`.
- `pnpm test:e2e` still passes (sanity check that nothing else broke).
