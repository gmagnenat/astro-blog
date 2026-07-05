# TypeScript 5 to 6 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bump TypeScript 5.9.3 → latest 6.x with zero code changes, verified by `astro check` producing identical diagnostics and the existing test suite passing.

**Architecture:** Single-task bump — research plus an empirical pre-test (already run against `typescript@6.0.3` in this exact repo, then reverted) confirmed no code changes needed.

**Tech Stack:** TypeScript 6.

---

### Task 1: Bump TypeScript to latest 6.x

**Goal:** TypeScript is on the latest 6.x version, `astro check` reports the same diagnostics as before (0 errors, 0 warnings, 3 pre-existing hints), full safety net passes.

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Acceptance Criteria:**
- [ ] `pnpm exec tsc --version` reports a 6.x version
- [ ] `pnpm build` (`astro check && astro build`) shows 0 errors, 0 warnings, 3 hints — same as pre-upgrade
- [ ] `pnpm test` and `pnpm test:e2e` both pass

**Verify:** `pnpm build && pnpm test && pnpm test:e2e` → all pass, combined exit code 0

**Steps:**

- [ ] **Step 1: Bump TypeScript**

Run: `pnpm add -D typescript@latest`

- [ ] **Step 2: Confirm version**

Run: `pnpm exec tsc --version`
Expected: prints a `6.x.x` version

- [ ] **Step 3: Run the full build and safety net**

Run: `pnpm build && pnpm test && pnpm test:e2e`
Expected: `astro check` reports exactly 0 errors, 0 warnings, 3 hints (the same pre-existing unused-variable hints in `Tags.astro`, `MarkdownPostLayout.astro`, `menu.js` as before this bump — not new ones). Vitest suite passes (15 tests), Playwright suite passes (7 tests).

- [ ] **Step 4: If any new diagnostic appears or a test fails — stop, don't force it**

A new `astro check` error/warning, or a test failure, means the empirical pre-test (already run against 6.0.3 during planning) didn't cover whatever version `@latest` resolves to at execution time. Report the exact new diagnostic rather than editing `tsconfig.json` or any source file to silence it.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "Bump TypeScript to 6.x"
```
