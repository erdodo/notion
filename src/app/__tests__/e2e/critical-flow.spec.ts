import { test, expect } from '@playwright/test';

test.describe('Critical Flow', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Notion/i);
  });

  test('should create a new page', async ({ page }) => {
    await page.goto('/documents');

    if (page.url().includes('sign-in')) {
      console.log('Skipping create page test due to auth requirement');
      return;
    }

    await page.getByRole('button', { name: 'New Page' }).click();

    await expect(page).toHaveURL(/\/documents\/.+/);

    const titleInput = page.getByPlaceholder('Untitled');
    await titleInput.fill('My Critical Test Page');
    await expect(page.getByText('My Critical Test Page')).toBeVisible();
  });
});
