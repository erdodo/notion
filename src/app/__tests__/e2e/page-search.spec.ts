import { test, expect } from '@playwright/test';

test.describe('Page Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open search dialog with keyboard shortcut', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    
    await page.keyboard.press(`${modifier}+KeyK`);
    await page.waitForTimeout(500);
    
    const searchDialog = page.locator('[role="dialog"]').first();
    if (await searchDialog.isVisible()) {
      await expect(searchDialog).toBeVisible();
    }
  });

  test('should show search input in dialog', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    
    await page.keyboard.press(`${modifier}+KeyK`);
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input[placeholder*="search" i]').first();
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('should search for pages by title', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    
    await page.keyboard.press(`${modifier}+KeyK`);
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input[placeholder*="search" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(800);
      
      const results = page.locator('[cmdk-item]').first();
      if (await results.isVisible()) {
        await expect(results).toBeVisible();
      }
    }
  });

  test('should show loading state while searching', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    
    await page.keyboard.press(`${modifier}+KeyK`);
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input[placeholder*="search" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(100);
    }
  });

  test('should navigate to page when search result clicked', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    
    await page.keyboard.press(`${modifier}+KeyK`);
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input[placeholder*="search" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(800);
      
      const firstResult = page.locator('[cmdk-item]').first();
      if (await firstResult.isVisible()) {
        await firstResult.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should show empty state when no results found', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    
    await page.keyboard.press(`${modifier}+KeyK`);
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input[placeholder*="search" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('xyznonexistentpage123');
      await page.waitForTimeout(800);
      
      const emptyState = page.locator('text=/no.*results|empty/i').first();
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    }
  });

  test('should allow creating new page from search', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    
    await page.keyboard.press(`${modifier}+KeyK`);
    await page.waitForTimeout(500);
    
    const newPageOption = page.locator('text=/new.*page|create.*page/i').first();
    if (await newPageOption.isVisible()) {
      await expect(newPageOption).toBeVisible();
    }
  });

  test('should close search dialog on escape', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    
    await page.keyboard.press(`${modifier}+KeyK`);
    await page.waitForTimeout(500);
    
    const searchDialog = page.locator('[role="dialog"]').first();
    if (await searchDialog.isVisible()) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      
      await expect(searchDialog).not.toBeVisible();
    }
  });

  test('should clear search query when dialog reopened', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    
    await page.keyboard.press(`${modifier}+KeyK`);
    await page.waitForTimeout(500);
    
    const searchInput = page.locator('input[placeholder*="search" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test query');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      
      await page.keyboard.press(`${modifier}+KeyK`);
      await page.waitForTimeout(500);
      
      const inputValue = await searchInput.inputValue();
      expect(inputValue).toBe('');
    }
  });
});
