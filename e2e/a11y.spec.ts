import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Same routes as pages.spec.ts — deep a11y scan of the rendered DOM.
const paths = ['/', '/about', '/cv', '/posts', '/post/firstpost', '/post/tags/code'];

for (const path of paths) {
  test(`${path} has no axe a11y violations`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
}
