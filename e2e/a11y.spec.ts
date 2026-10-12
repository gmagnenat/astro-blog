import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Same routes as pages.spec.ts — deep a11y scan of the rendered DOM.
const paths = ['/', '/about', '/cv', '/posts', '/post/firstpost', '/post/tags/code'];
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const mobile = { width: 375, height: 800 };

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze();
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
}

for (const path of paths) {
  test(`${path} has no axe a11y violations`, async ({ page }) => {
    await page.goto(path);
    await expectNoViolations(page);
  });

  test(`${path} has no axe a11y violations on mobile`, async ({ page }) => {
    await page.setViewportSize(mobile);
    await page.goto(path);
    await expectNoViolations(page);
  });
}

// The mobile menu is only in the DOM's rendered state once opened; scan it open.
test('mobile navigation menu (open) has no axe a11y violations', async ({ page }) => {
  await page.setViewportSize(mobile);
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toBeVisible();
  await expectNoViolations(page);
});
