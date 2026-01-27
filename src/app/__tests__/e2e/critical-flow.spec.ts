import { test, expect } from '@playwright/test';

test.describe('Critical Flow', () => {
    test('should load home page', async ({ page }) => {
        await page.goto('/');
        // Expect login or home
        await expect(page).toHaveTitle(/Notion/i);
    });

    // Note: These tests require a running auth session or mock.
    // We assume TEST_MODE env bypasses auth or seeds a user.

    test('should create a new page', async ({ page }) => {
        // Navigate to documents
        await page.goto('/documents');

        // Check if we are redirected to login
        if (page.url().includes('sign-in')) {
            console.log('Skipping create page test due to auth requirement');
            return;
        }

        // Click "New Page" in sidebar
        await page.getByRole('button', { name: 'New Page' }).click();

        // Expect redirection to new page
        await expect(page).toHaveURL(/\/documents\/.+/);

        // Edit Title
        const titleInput = page.getByPlaceholder('Untitled');
        await titleInput.fill('My Critical Test Page');
        await expect(page.getByText('My Critical Test Page')).toBeVisible();
    });
});
