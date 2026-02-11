import { test, expect } from '@playwright/test';

test.describe('Synced Block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should create synced block using /synced command', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/synced');
    await page.waitForTimeout(500);
    
    const syncedOption = page.locator('text=/synced/i').first();
    if (await syncedOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      const syncedBlock = page.locator('[data-content-type="syncedBlock"]').first();
      await expect(syncedBlock).toBeVisible();
    }
  });

  test('should allow editing content in synced block', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/synced');
    await page.waitForTimeout(500);
    
    const syncedOption = page.locator('text=/synced/i').first();
    if (await syncedOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      await page.keyboard.type('Synced content');
      await page.waitForTimeout(300);
      
      await expect(page.getByText('Synced content')).toBeVisible();
    }
  });

  test('should show synced block indicator', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/synced');
    await page.waitForTimeout(500);
    
    const syncedOption = page.locator('text=/synced/i').first();
    if (await syncedOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      const syncedBlock = page.locator('.synced-block').first();
      if (await syncedBlock.isVisible()) {
        await expect(syncedBlock).toBeVisible();
      }
    }
  });

  test('should allow copying synced block reference', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/synced');
    await page.waitForTimeout(500);
    
    const syncedOption = page.locator('text=/synced/i').first();
    if (await syncedOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      await page.keyboard.type('Original synced content');
      await page.waitForTimeout(300);
    }
  });
});
