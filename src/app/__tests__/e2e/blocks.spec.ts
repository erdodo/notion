import { test } from '@playwright/test';

test.describe('Block Operations', () => {
  test('slash menu should appear when typing /', async ({ page }) => {
    await page.goto('/documents/test-doc');
  });
});
