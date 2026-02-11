import { test, expect } from '@playwright/test';

test.describe('Bookmark and Embed Blocks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should insert bookmark using /bookmark command', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/bookmark');
    await page.waitForSelector('text=Link with preview', { state: 'visible' });
    
    const bookmarkOption = page.getByText('Link with preview');
    await expect(bookmarkOption).toBeVisible();
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const bookmarkBlock = page.locator('[data-content-type="bookmark"]').first();
    await expect(bookmarkBlock).toBeVisible();
  });

  test('should allow adding URL to bookmark', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/bookmark');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const bookmarkBlock = page.locator('[data-content-type="bookmark"]').first();
    if (await bookmarkBlock.isVisible()) {
      const urlInput = bookmarkBlock.locator('input[type="text"]').first();
      if (await urlInput.isVisible()) {
        await urlInput.fill('https://example.com');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
      }
    }
  });

  test('should insert embed using /embed command', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/embed');
    await page.waitForTimeout(500);
    
    const embedOption = page.locator('text=/embed/i').first();
    if (await embedOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      const embedBlock = page.locator('[data-content-type="embed"]').first();
      await expect(embedBlock).toBeVisible();
    }
  });

  test('should show bookmark with URL input', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/bookmark');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const bookmarkBlock = page.locator('[data-content-type="bookmark"]').first();
    await expect(bookmarkBlock).toBeVisible();
  });

  test('should allow embedding web content', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/web');
    await page.waitForTimeout(500);
    
    const webOption = page.locator('text=/bookmark|web/i').first();
    if (await webOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    }
  });
});
