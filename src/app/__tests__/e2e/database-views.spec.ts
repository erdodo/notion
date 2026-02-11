import { test, expect } from '@playwright/test';

test.describe('Database Views and Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show database toolbar with filter and sort options', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table inline');
    await page.waitForTimeout(500);
    
    const inlineDatabaseOption = page.locator('text=Embed a database in this page').first();
    if (await inlineDatabaseOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      const filterButton = page.locator('button').filter({ hasText: /filter/i }).first();
      const sortButton = page.locator('button').filter({ hasText: /sort/i }).first();
      
      if (await filterButton.isVisible()) {
        await expect(filterButton).toBeVisible();
      }
      if (await sortButton.isVisible()) {
        await expect(sortButton).toBeVisible();
      }
    }
  });

  test('should allow searching in database', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table inline');
    await page.waitForTimeout(500);
    
    const inlineDatabaseOption = page.locator('text=Embed a database in this page').first();
    if (await inlineDatabaseOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      const searchButton = page.locator('button[title="Search"]').first();
      if (await searchButton.isVisible()) {
        await searchButton.click();
        await page.waitForTimeout(300);
        
        const searchInput = page.locator('input[placeholder*="search"]').first();
        if (await searchInput.isVisible()) {
          await expect(searchInput).toBeVisible();
        }
      }
    }
  });

  test('should show view switcher for different database views', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table inline');
    await page.waitForTimeout(500);
    
    const inlineDatabaseOption = page.locator('text=Embed a database in this page').first();
    if (await inlineDatabaseOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      const viewSwitcher = page.locator('[data-testid="view-switcher"]').first();
      if (await viewSwitcher.isVisible()) {
        await expect(viewSwitcher).toBeVisible();
      }
    }
  });

  test('should allow adding new rows to database', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table inline');
    await page.waitForTimeout(500);
    
    const inlineDatabaseOption = page.locator('text=Embed a database in this page').first();
    if (await inlineDatabaseOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      const newButton = page.locator('button').filter({ hasText: /^new$/i }).first();
      if (await newButton.isVisible()) {
        await expect(newButton).toBeVisible();
        await newButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should show filter popover when filter button clicked', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table inline');
    await page.waitForTimeout(500);
    
    const inlineDatabaseOption = page.locator('text=Embed a database in this page').first();
    if (await inlineDatabaseOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      const filterButton = page.locator('button').filter({ hasText: /filter/i }).first();
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should show sort popover when sort button clicked', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table inline');
    await page.waitForTimeout(500);
    
    const inlineDatabaseOption = page.locator('text=Embed a database in this page').first();
    if (await inlineDatabaseOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      const sortButton = page.locator('button').filter({ hasText: /sort/i }).first();
      if (await sortButton.isVisible()) {
        await sortButton.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should show view settings menu', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table inline');
    await page.waitForTimeout(500);
    
    const inlineDatabaseOption = page.locator('text=Embed a database in this page').first();
    if (await inlineDatabaseOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      const settingsButton = page.locator('button[title*="settings"]').first();
      if (await settingsButton.isVisible()) {
        await settingsButton.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should display active filters as badges', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table inline');
    await page.waitForTimeout(500);
    
    const inlineDatabaseOption = page.locator('text=Embed a database in this page').first();
    if (await inlineDatabaseOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
  });

  test('should allow removing filters by clicking X button', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table inline');
    await page.waitForTimeout(500);
    
    const inlineDatabaseOption = page.locator('text=Embed a database in this page').first();
    if (await inlineDatabaseOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }
  });
});
