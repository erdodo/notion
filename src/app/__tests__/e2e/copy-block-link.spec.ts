import { test, expect } from '@playwright/test';

test.describe('Copy Link to Block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should copy block link to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    await page.keyboard.type('Test block content for link copying');
    await page.keyboard.press('Enter');

    const blockContainer = page.locator('[data-content-type]').first();
    await blockContainer.hover();

    const blockMenu = blockContainer.locator('button').first();
    await blockMenu.click();

    const copyLinkItem = page.getByRole('menuitem', { name: /copy link to block/i });
    await expect(copyLinkItem).toBeVisible();
    await copyLinkItem.click();

    await expect(page.getByText(/link copied/i)).toBeVisible();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('#block-');
    expect(clipboardText).toMatch(/^https?:\/\//);
  });

  test('should navigate to block when using copied link', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    await page.keyboard.type('First block');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Second block');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Target block for navigation');

    const targetBlock = page.locator('[data-content-type]').filter({ hasText: 'Target block' });
    await targetBlock.hover();

    const blockMenu = targetBlock.locator('button').first();
    await blockMenu.click();

    const copyLinkItem = page.getByRole('menuitem', { name: /copy link to block/i });
    await copyLinkItem.click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

    await page.goto(clipboardText);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('[data-content-type]').filter({ hasText: 'Target block' })).toBeVisible();
  });

  test('should show copy link option for different block types', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();

    await page.keyboard.type('/heading1');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Heading Block');

    const headingBlock = page.locator('[data-content-type="heading"]').first();
    await headingBlock.hover();

    const blockMenu = headingBlock.locator('button').first();
    await blockMenu.click();

    const copyLinkItem = page.getByRole('menuitem', { name: /copy link to block/i });
    await expect(copyLinkItem).toBeVisible();
  });
});
