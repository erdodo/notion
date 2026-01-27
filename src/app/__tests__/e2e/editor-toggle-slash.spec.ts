import { test, expect } from '@playwright/test';

test.describe('Editor Toggle and Slash Menu', () => {
  test('should create a toggle block via slash command and handle visibility', async ({
    page,
  }) => {
    await page.goto('/documents');

    await page.getByRole('button', { name: 'New page' }).click();

    await expect(page).toHaveURL(/\/documents\/.+/);

    const editor = page.locator('.bn-editor');
    await editor.click();

    await page.keyboard.type('/toggle');

    await expect(
      page.locator('.blocknote-slash-menu-item', { hasText: 'Toggle List' })
    ).toBeVisible();

    await page.keyboard.press('Enter');

    const toggleBlock = page.locator(
      '.bn-block-content[data-content-type="toggle"]'
    );
    await expect(toggleBlock).toBeVisible();

    await expect(toggleBlock).not.toHaveText('/toggle');

    await page.keyboard.type('My Toggle Title');
    await expect(toggleBlock).toContainText('My Toggle Title');

    await page.keyboard.press('Enter');

    await page.keyboard.type('Hidden Content');

    const chevron = toggleBlock.locator('div[class*="cursor-pointer"]');
    await chevron.click();

    await page.waitForTimeout(500);
  });
});
