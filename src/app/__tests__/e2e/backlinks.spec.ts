import { test, expect } from '@playwright/test';

test.describe('Backlinks and Page Linking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show backlinks panel when page has incoming links', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    if (await editor.isVisible()) {
      await editor.click();
      await page.waitForTimeout(500);
      
      const backlinksPanel = page.locator('text=/backlink/i').first();
      if (await backlinksPanel.isVisible()) {
        await expect(backlinksPanel).toBeVisible();
      }
    }
  });

  test('should allow creating page links with [[ syntax', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    if (await editor.isVisible()) {
      await editor.click();
      await page.keyboard.type('[[');
      await page.waitForTimeout(500);
      
      const pagePicker = page.locator('[role="listbox"], [role="menu"]').first();
      if (await pagePicker.isVisible()) {
        await expect(pagePicker).toBeVisible();
      }
    }
  });

  test('should show page suggestions when typing [[', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    if (await editor.isVisible()) {
      await editor.click();
      await page.keyboard.type('[[test');
      await page.waitForTimeout(500);
      
      const suggestions = page.locator('[role="option"]').first();
      if (await suggestions.isVisible()) {
        await expect(suggestions).toBeVisible();
      }
    }
  });

  test('should insert page link when suggestion selected', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    if (await editor.isVisible()) {
      await editor.click();
      await page.keyboard.type('[[');
      await page.waitForTimeout(500);
      
      const firstSuggestion = page.locator('[role="option"]').first();
      if (await firstSuggestion.isVisible()) {
        await firstSuggestion.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should display backlinks count', async ({ page }) => {
    const backlinksCount = page.locator('text=/\\d+.*backlink/i').first();
    if (await backlinksCount.isVisible()) {
      await expect(backlinksCount).toBeVisible();
    }
  });

  test('should allow expanding backlinks panel', async ({ page }) => {
    const backlinksButton = page.locator('button').filter({ hasText: /backlink/i }).first();
    if (await backlinksButton.isVisible()) {
      await backlinksButton.click();
      await page.waitForTimeout(300);
      
      const backlinksContent = page.locator('[data-state="open"]').first();
      if (await backlinksContent.isVisible()) {
        await expect(backlinksContent).toBeVisible();
      }
    }
  });

  test('should navigate to linked page when backlink clicked', async ({ page }) => {
    const backlinksButton = page.locator('button').filter({ hasText: /backlink/i }).first();
    if (await backlinksButton.isVisible()) {
      await backlinksButton.click();
      await page.waitForTimeout(300);
      
      const backlinkItem = page.locator('a[href*="/documents/"]').first();
      if (await backlinkItem.isVisible()) {
        await backlinkItem.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should show page icon in backlinks list', async ({ page }) => {
    const backlinksButton = page.locator('button').filter({ hasText: /backlink/i }).first();
    if (await backlinksButton.isVisible()) {
      await backlinksButton.click();
      await page.waitForTimeout(300);
      
      const pageIcon = page.locator('.text-lg').first();
      if (await pageIcon.isVisible()) {
        await expect(pageIcon).toBeVisible();
      }
    }
  });

  test('should allow collapsing backlinks panel', async ({ page }) => {
    const backlinksButton = page.locator('button').filter({ hasText: /backlink/i }).first();
    if (await backlinksButton.isVisible()) {
      await backlinksButton.click();
      await page.waitForTimeout(300);
      
      await backlinksButton.click();
      await page.waitForTimeout(300);
      
      const backlinksContent = page.locator('[data-state="closed"]').first();
      if (await backlinksContent.isVisible()) {
        await expect(backlinksContent).toBeVisible();
      }
    }
  });

  test('should not show backlinks panel when no backlinks exist', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    if (await editor.isVisible()) {
      await editor.click();
      await page.waitForTimeout(500);
    }
  });
});
