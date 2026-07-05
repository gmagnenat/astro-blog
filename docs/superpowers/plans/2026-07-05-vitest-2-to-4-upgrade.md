# Vitest 2 to 4 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bump Vitest 2.1.9 → latest 4.x with zero code changes, verified by the existing test suite.

**Architecture:** Single-task bump — research confirmed no breaking change in Vitest 3/4 applies to this project's minimal test usage (no mocks, snapshots, coverage, or workspace config; no deprecated third-arg `test()` syntax present).

**Tech Stack:** Vitest 4.

---

### Task 1: Bump Vitest to latest 4.x

**Goal:** Vitest is on the latest 4.x version, `pnpm test` passes unmodified.

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Acceptance Criteria:**
- [ ] `pnpm exec vitest --version` reports a 4.x version
- [ ] `pnpm test` passes with zero changes to `test/build.test.ts` or `vitest.config.ts`
- [ ] `pnpm test:e2e` still passes (sanity check nothing else broke)

**Verify:** `pnpm test && pnpm test:e2e` → both pass, combined exit code 0

**Steps:**

- [ ] **Step 1: Bump Vitest**

Run: `pnpm add -D vitest@latest`

- [ ] **Step 2: Confirm version**

Run: `pnpm exec vitest --version`
Expected: prints a `4.x.x` version

- [ ] **Step 3: Run the full safety net**

Run: `pnpm test && pnpm test:e2e`
Expected: Vitest suite passes (15 tests), Playwright suite passes (7 tests), combined exit code 0

- [ ] **Step 4: If anything failed or needed a code edit — stop, don't force it**

A failure here, or a need to edit `test/build.test.ts`/`vitest.config.ts` to make it pass, means the research missed something. Report the exact error rather than guessing at a fix — this task's whole premise is "no code changes needed," so a needed change is a signal to investigate, not silently patch.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "Bump Vitest to 4.x"
```
