import { test, expect } from '@playwright/test';

test.describe('Editor', () => {
  test('unauthorized access to editor should redirect', async ({ page }) => {
    // Attempting to access a specific document editor without login
    await page.goto('/documents/some-id?guest=true');
    await expect(page).toHaveURL(/.*sign-in/);
  });

  /*
  test('authenticated user sees editor toolbar', async ({ page }) => {
    // Assuming we are on a valid document page
    await page.goto('/documents/valid-id');
    
    // Check for toolbar presence
    await expect(page.getByRole('button', { name: 'Add icon' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add cover' })).toBeVisible();
  });
  */
});
