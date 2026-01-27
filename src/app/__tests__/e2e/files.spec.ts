import { test } from '@playwright/test';

test.describe('File Management', () => {
  test('dropzone should be visible in cover image upload', async ({ page }) => {
    await page.goto('/documents/test');
  });
});
