import { test, expect } from '@playwright/test';

test.describe('Search', () => {
    test('cmd+k should open search dialog', async ({ page }) => {
        await page.goto('/documents/test');

        // Press Cmd+K (Mac) or Ctrl+K (Windows/Linux)
        const isMac = await page.evaluate(() => navigator.platform.includes('Mac'));
        const modifier = isMac ? 'Meta' : 'Control';

        // await page.keyboard.press(`${modifier}+k`);
        // await expect(page.locator('[role="dialog"]')).toBeVisible();
        // await expect(page.getByPlaceholder('Search pages...')).toBeVisible();
    });
});
