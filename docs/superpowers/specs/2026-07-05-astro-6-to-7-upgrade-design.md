# Astro 6 → 7 upgrade

## Purpose

Third and final step of an incremental Astro 4 → 7 major upgrade (4→5 and 5→6 done and merged).
This step lands Astro 7, the "foundations release" — a new Rust-based compiler, stricter HTML
parsing, and a whitespace-compression default change — plus removes a stale, unmaintained
integration flagged during planning.

## Background

Research findings this step is built on:

- **Compiler**: Astro 7 removes the old Go compiler entirely in favor of the Rust one. The Rust
  compiler no longer silently auto-corrects invalid HTML (unclosed tags, bad nesting) — it now
  errors. Scanned this project's `.astro` components for unclosed void elements
  (`<img>`, `<br>`, `<hr>`, `<input>`) — none found. Any real issue will now surface as a hard
  `pnpm build` failure rather than a silent miscompile, which is the intended safety improvement,
  not a new risk to design around separately.
- **`compressHTML` default**: changes from `true` to `'jsx'`, stripping whitespace between inline
  elements (JSX-style). Checked the two places in this project with adjacent rendered elements —
  `Tags.astro`'s `<li>` pills (flex + `gap-2`, spacing is CSS-driven, not whitespace-driven) and
  `BlogCard.astro`'s reading-time text (isolated in its own `<p>`, no adjacent inline sibling) —
  neither is at risk. Verified via the existing Playwright suite (console-error check) plus a
  manual visual glance at `/posts` and a tag page after the bump.
- **Node**: unchanged, still ≥22.12.0. Current environment (24.11) unaffected.
- **`astro-expressive-code`**: already at 0.44.0 with `astro: "^7.0.0"` in its declared peer
  range — no version bump needed. The `removeUnusedThemes: false` workaround (added in the 5→6
  step for a Shiki bundling bug) needs re-verification under Astro 7's Vite 8, not a known fix.
- **Markdown processor**: Astro 6.4 introduced a native Rust processor ("Sätteri") as opt-in;
  Astro 7 makes it the default — but it doesn't support remark plugins. This project already
  explicitly sets `markdown.processor` to `unified({ remarkPlugins: [remarkReadingTime] })` (done
  in the 5→6 step specifically to avoid relying on deprecated top-level markdown keys), which
  keeps the classic remark/rehype pipeline active regardless of the new default. No change needed.
- **`astro-robots-txt`**: last published in 2023, declares only `astro ^3.0.11` as a
  devDependency, no peerDependencies, and hooks the build pipeline (higher risk than a passive
  component). Decision: remove it outright rather than risk-test it. Current generated output
  (`pnpm build` on the pre-upgrade branch) is:
  ```
  User-agent: *
  Allow: /
  Sitemap: https://gmagnenat.com/sitemap-index.xml
  ```
  Note: no sitemap integration is actually installed, so this `Sitemap:` line already points to a
  URL that 404s — a pre-existing, out-of-scope issue. The static replacement preserves this output
  byte-for-byte rather than fixing it, to keep this step a pure infrastructure upgrade.
- **`astro-seo`**: no confirmed Astro 7 peer support either, but it's a passive component (no
  build-pipeline hooks) — lower risk, bump and verify via the build/safety net rather than
  pre-emptively removing it.

## Approach

### 1. Bump Astro core

Run `pnpm dlx @astrojs/upgrade`, confirming it lands on Astro 7.x. Bumps `astro` and official
`@astrojs/*` packages (`@astrojs/check`, `@astrojs/markdown-remark`).

### 2. Remove `astro-robots-txt`, add a static `robots.txt`

- Remove the `robotsTxt` import and its call from the `integrations` array in `astro.config.mjs`.
- `pnpm remove astro-robots-txt`.
- Create `public/robots.txt` with the exact current generated content:
  ```
  User-agent: *
  Allow: /
  Sitemap: https://gmagnenat.com/sitemap-index.xml
  ```
  Astro copies `public/` files to `dist/` unchanged, so this produces identical output to the
  integration it replaces.

### 3. Bump `astro-seo`

`pnpm add astro-seo@latest`. No code changes expected — it's used as a passive
title/description/meta component.

### 4. Re-verify `astro-expressive-code` workaround

No version bump (already Astro-7-compatible). Build and confirm the `removeUnusedThemes: false`
workaround still produces both configured themes (`dracula`, `solarized-light`) in the built CSS
under Astro 7's Vite 8 — if the underlying bundling bug turns out to be fixed upstream, that's a
bonus, not a requirement to act on (removing a working workaround is out of scope for this step).

### 5. Build and visual verification

- `pnpm build` succeeds — this is also the HTML-strictness check: any invalid markup Astro 7's
  compiler now rejects will surface here as a hard error.
- Manually glance at built `/posts` and one tag page (e.g. via `pnpm preview`) to confirm no
  visible whitespace collapse between the tag pills or listing cards from the `compressHTML: 'jsx'`
  default change.

### 6. Full safety net

`pnpm build`, `pnpm test` (Vitest), `pnpm test:e2e` (Playwright) must all pass unmodified — same
bar as the previous two steps.

## Out of scope

- Fixing the pre-existing dangling `Sitemap:` reference in `robots.txt` (no sitemap integration
  exists; not introduced or worsened by this step).
- Adding a real sitemap integration (unrelated feature work).
- Any new features or refactors unrelated to the version bump.
- Removing the `removeUnusedThemes: false` workaround even if it turns out to be unnecessary under
  Astro 7 — leaving a working, documented workaround in place is lower-risk than an
  unrequested cleanup.

## Verification

- `pnpm build && pnpm test && pnpm test:e2e` all pass on the upgraded branch.
- `dist/robots.txt` content is byte-identical to the pre-upgrade output.
- Manual visual check of `/posts` and a tag page shows no whitespace-collapse regressions.
- This is the final step of the 4→7 upgrade — once merged, Dependabot alert count should drop
  further from the 5→6 step's post-merge baseline (17 alerts, 5 high).
