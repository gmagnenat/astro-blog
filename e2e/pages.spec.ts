import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', heading: 'Gwenaël' },
  { path: '/about', heading: 'Gwenaël Magnenat' },
  { path: '/cv', heading: 'Gwenaël Magnenat' },
  { path: '/posts', heading: 'Writing' },
  { path: '/post/firstpost', heading: 'Drawing a Dynamic Grid with Canvas and JavaScript' },
  { path: '/post/tags/code', heading: '#code' },
];

for (const { path, heading } of pages) {
  test(`${path} loads with no console errors`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto(path);

    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText(heading);
    expect(consoleErrors).toEqual([]);
  });
}

test('homepage hero subheading renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#hero-heading')).toContainText('Magnenat');
  await expect(page.getByText('Scanners catch ~30% of accessibility errors.')).toBeVisible();
});
