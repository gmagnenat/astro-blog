import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Contrast in states axe's default page scan never sees.

for (const { path, selector } of [
  { path: '/', selector: '.cta-primary' },
  { path: '/about', selector: '.contact-btn' },
]) {
  test(`${path} ${selector} keeps text contrast on hover`, async ({ page }) => {
    await page.goto(path);
    await page.addStyleTag({ content: '*{transition:none!important;animation:none!important}' });
    await page.locator(selector).hover();
    const { violations } = await new AxeBuilder({ page })
      .include(selector)
      .withRules(['color-contrast'])
      .analyze();
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
}

test.describe('forced colors (Windows High Contrast)', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active', colorScheme: 'dark' });
  });

  test('hamburger bars stay visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    const [bar, canvas] = await page.evaluate(() => [
      getComputedStyle(document.querySelector('.hb-bar')!).backgroundColor,
      getComputedStyle(document.body).backgroundColor,
    ]);
    expect(bar).not.toBe(canvas);
  });

  test('pressed filter tab is visually distinct', async ({ page }) => {
    await page.goto('/posts');
    const bg = (name: string) =>
      page.getByRole('button', { name, exact: true }).evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(await bg('All')).not.toBe(await bg('Accessibility'));
  });
});
