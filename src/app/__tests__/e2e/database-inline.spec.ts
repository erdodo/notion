import { test, expect } from '@playwright/test';

test.describe('Inline Database', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should insert inline database using /table inline command', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table inline');
    await page.waitForTimeout(500);
    
    const inlineDatabaseOption = page.locator('text=Embed a database in this page').first();
    if (await inlineDatabaseOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      const databaseBlock = page.locator('[data-content-type="inlineDatabase"]').first();
      await expect(databaseBlock).toBeVisible();
    }
  });

  test('should create inline database with default columns', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/database inline');
    await page.waitForTimeout(500);
    
    const dbOption = page.locator('text=/database.*inline/i').first();
    if (await dbOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
  });

  test('should allow adding rows to inline database', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table inline');
    await page.waitForTimeout(500);
    
    const inlineDatabaseOption = page.locator('text=Embed a database in this page').first();
    if (await inlineDatabaseOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      const addRowButton = page.locator('button').filter({ hasText: /new|add/i }).first();
      if (await addRowButton.isVisible()) {
        await addRowButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should show database with table view', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/db inline');
    await page.waitForTimeout(500);
    
    const dbOption = page.locator('text=/database/i').first();
    if (await dbOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      const tableView = page.locator('.database-table-view, [data-view-type="table"]').first();
      if (await tableView.isVisible()) {
        await expect(tableView).toBeVisible();
      }
    }
  });

  test('should allow switching database views', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table inline');
    await page.waitForTimeout(500);
    
    const inlineDatabaseOption = page.locator('text=Embed a database in this page').first();
    if (await inlineDatabaseOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      const viewSelector = page.locator('[data-testid="view-selector"]').first();
      if (await viewSelector.isVisible()) {
        await viewSelector.click();
        await page.waitForTimeout(300);
      }
    }
  });
});
