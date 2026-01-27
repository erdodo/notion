import { test, expect } from '@playwright/test';

test.describe('Toggle Block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/documents');

    await page.getByRole('button', { name: 'New Page' }).click();
    await page.waitForURL(/\/documents\/[a-zA-Z0-9-]+/);
  });

  test('should act as a toggle block', async ({ page }) => {
    const titleInput = page.getByPlaceholder('Untitled');
    await expect(titleInput).toBeVisible();

    await page.locator('.bn-editor').click();

    await page.keyboard.type('/toggle');
    await page.keyboard.press('Enter');

    const toggleBlock = page.locator(
      '.bn-block-outer[data-content-type="toggle"]'
    );
    await expect(toggleBlock).toBeVisible();

    toggleBlock.locator('[contenteditable="true"]');

    await page.keyboard.type('Toggle Title Content');
    await expect(page.getByText('Toggle Title Content')).toBeVisible();

    const toggleIconParameters = toggleBlock.locator('.cursor-pointer');

    await expect(
      toggleIconParameters.locator('svg.lucide-chevron-right')
    ).toBeVisible();

    await toggleIconParameters.click();

    await expect(
      toggleIconParameters.locator('svg.lucide-chevron-down')
    ).toBeVisible();

    await toggleIconParameters.click();
    await expect(
      toggleIconParameters.locator('svg.lucide-chevron-right')
    ).toBeVisible();
  });
});
