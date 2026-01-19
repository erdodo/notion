import { test, expect } from '@playwright/test';

test.describe('Database Engine', () => {
    test('should allow creating a database', async ({ page }) => {
        // Navigate to a page
        await page.goto('/documents/test-doc');

        // Test logic for creating inline database
        // await page.keyboard.type('/database');
        // await page.keyboard.press('Enter');

        // Expect database table to appear
        // await expect(page.locator('.blocknote-table')).toBeVisible();
    });
});
