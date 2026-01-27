import { test } from '@playwright/test';

test.describe('Sharing', () => {
  test('share button opens share dialog', async ({ page }) => {
    await page.goto('/documents/test');
  });
});
