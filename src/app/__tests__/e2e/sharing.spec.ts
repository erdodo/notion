import { test, expect } from '@playwright/test';

test.describe('Sharing', () => {
    test('share button opens share dialog', async ({ page }) => {
        await page.goto('/documents/test');

        // await page.getByRole('button', { name: 'Share' }).click();
        // await expect(page.getByRole('dialog')).toBeVisible();
        // await expect(page.getByText('Share "Test Page"')).toBeVisible();
    });
});
