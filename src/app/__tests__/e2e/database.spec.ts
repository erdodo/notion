import { test } from '@playwright/test';

test.describe('Database Engine', () => {
  test('should allow creating a database', async ({ page }) => {
    await page.goto('/documents/test-doc');
  });
});
