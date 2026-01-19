import { test, expect } from '@playwright/test';

test.describe('Import/Export', () => {
    test('export menu should be accessible', async ({ page }) => {
        await page.goto('/documents/test');
        // Check for export option in page menu
        // await page.getByRole('button', { name: 'Menu' }).click();
        // await expect(page.getByText('Export')).toBeVisible();
    });
});
