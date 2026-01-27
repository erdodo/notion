import { test } from '@playwright/test';

test.describe('Search', () => {
  test('cmd+k should open search dialog', async ({ page }) => {
    await page.goto('/documents/test');
  });
});
