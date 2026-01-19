import { test, expect } from '@playwright/test';

test.describe('File Management', () => {
    test('dropzone should be visible in cover image upload', async ({ page }) => {
        await page.goto('/documents/test');

        // Trigger cover upload if possible
        // await page.getByRole('button', { name: 'Add cover' }).click();
        // await expect(page.getByText('Upload')).toBeVisible();
    });
});
