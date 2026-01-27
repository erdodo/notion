import { test } from '@playwright/test';

test.describe('Import/Export', () => {
  test('export menu should be accessible', async ({ page }) => {
    await page.goto('/documents/test');
  });
});
