import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', heading: 'Gwenaël Magnenat' },
  { path: '/about', heading: 'About me' },
  { path: '/cv', heading: 'CV' },
  { path: '/posts', heading: 'Latest blog' },
  { path: '/post/firstpost', heading: 'Drawing a Dynamic Grid with Canvas and JavaScript' },
  { path: '/post/tags/code', heading: 'Latest blog : code' },
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
