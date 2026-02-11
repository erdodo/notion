import { test, expect } from '@playwright/test';

test.describe('Page Icon Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should add emoji icon to page', async ({ page }) => {
    const addIconButton = page.getByRole('button', { name: /add icon/i });
    await expect(addIconButton).toBeVisible();
    
    await addIconButton.click();
    
    const iconPicker = page.locator('[data-testid="icon-picker"]');
    await expect(iconPicker).toBeVisible();
    
    const emojiOption = iconPicker.locator('button').first();
    await emojiOption.click();
    
    await page.waitForTimeout(500);
    
    const pageIcon = page.locator('.text-6xl').first();
    await expect(pageIcon).toBeVisible();
  });

  test('should show icon in sidebar navigation', async ({ page }) => {
    const titleInput = page.locator('[data-testid="document-title"]').first();
    await titleInput.fill('Test Page with Icon');
    await page.waitForTimeout(500);
    
    const addIconButton = page.getByRole('button', { name: /add icon/i });
    await addIconButton.click();
    
    const iconPicker = page.locator('[data-testid="icon-picker"]');
    const emojiOption = iconPicker.locator('button').first();
    await emojiOption.click();
    await page.waitForTimeout(500);
    
    const sidebar = page.locator('[data-testid="sidebar"]');
    const pageItem = sidebar.getByText('Test Page with Icon');
    await expect(pageItem).toBeVisible();
  });

  test('should remove icon from page', async ({ page }) => {
    const addIconButton = page.getByRole('button', { name: /add icon/i });
    await addIconButton.click();
    
    const iconPicker = page.locator('[data-testid="icon-picker"]');
    const emojiOption = iconPicker.locator('button').first();
    await emojiOption.click();
    await page.waitForTimeout(500);
    
    const pageIcon = page.locator('.text-6xl').first();
    await pageIcon.hover();
    
    const removeButton = page.locator('button').filter({ hasText: /×|remove/i }).first();
    await removeButton.click();
    await page.waitForTimeout(500);
    
    await expect(addIconButton).toBeVisible();
  });

  test('should change page icon', async ({ page }) => {
    const addIconButton = page.getByRole('button', { name: /add icon/i });
    await addIconButton.click();
    
    const iconPicker = page.locator('[data-testid="icon-picker"]');
    const firstEmoji = iconPicker.locator('button').first();
    await firstEmoji.click();
    await page.waitForTimeout(500);
    
    const pageIcon = page.locator('.text-6xl').first();
    await pageIcon.click();
    
    const iconPickerAgain = page.locator('[data-testid="icon-picker"]');
    const secondEmoji = iconPickerAgain.locator('button').nth(1);
    await secondEmoji.click();
    await page.waitForTimeout(500);
    
    await expect(page.locator('.text-6xl').first()).toBeVisible();
  });

  test('should persist icon after page reload', async ({ page }) => {
    const addIconButton = page.getByRole('button', { name: /add icon/i });
    await addIconButton.click();
    
    const iconPicker = page.locator('[data-testid="icon-picker"]');
    const emojiOption = iconPicker.locator('button').first();
    await emojiOption.click();
    await page.waitForTimeout(500);
    
    const currentUrl = page.url();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const pageIcon = page.locator('.text-6xl').first();
    await expect(pageIcon).toBeVisible();
  });
});
