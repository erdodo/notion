import { test, expect } from '@playwright/test';

test.describe('Editor', () => {
  test('unauthorized access to editor should redirect', async ({ page }) => {
    await page.goto('/documents/some-id?guest=true');
    await expect(page).toHaveURL(/.*sign-in/);
  });
});
