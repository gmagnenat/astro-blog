import { test, expect } from '@playwright/test';

// Keyboard and focus behaviour that axe cannot see.

test('skip link is the first tab stop and moves focus to main', async ({ page }) => {
  await page.goto('/about');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});

test.describe('mobile navigation menu', () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test('contains focus while open and restores it on Escape', async ({ page }) => {
    await page.goto('/about');
    const hamburger = page.locator('#hamburger-btn');
    const menu = page.getByRole('dialog', { name: 'Navigation menu' });

    await hamburger.click();
    await expect(menu).toBeVisible();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    await expect(menu.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');

    // Tab past every control in the menu: focus must never land on page
    // content behind the modal (body = browser chrome, allowed for <dialog>).
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const escaped = await page.evaluate(() => {
        const el = document.activeElement;
        return !!el && el !== document.body && !document.getElementById('mobile-nav-menu')!.contains(el);
      });
      expect(escaped, `focus left the dialog after ${i + 1} Tab presses`).toBe(false);
    }

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(hamburger).toBeFocused();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });
});

for (const path of ['/', '/posts']) {
  test(`${path} topic filters expose pressed state and announce results`, async ({ page }) => {
    await page.goto(path);
    const all = page.getByRole('button', { name: 'All', exact: true });
    const a11y = page.getByRole('button', { name: 'Accessibility', exact: true });

    await a11y.click();
    await expect(a11y).toHaveAttribute('aria-pressed', 'true');
    await expect(all).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#filter-status')).toHaveText(/^Showing \d+ posts? in Accessibility$/);
  });
}
