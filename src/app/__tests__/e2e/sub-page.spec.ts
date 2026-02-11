import { test, expect } from '@playwright/test';

test.describe('Sub-page Creation and Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should create sub-page using /page command', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/page');
    await page.waitForSelector('text=Page', { state: 'visible' });
    
    const pageOption = page.getByText('Embed a sub-page');
    await expect(pageOption).toBeVisible();
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    const pageMention = page.locator('[data-content-type="pageMention"]').first();
    await expect(pageMention).toBeVisible();
  });

  test('should create sub-page with custom title', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/page');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    const pageMention = page.locator('[data-content-type="pageMention"]').first();
    await pageMention.click();
    
    await page.waitForLoadState('networkidle');
    
    const titleInput = page.locator('[data-testid="document-title"]').first();
    await titleInput.fill('My Sub-page');
    await page.waitForTimeout(500);
    
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText('My Sub-page')).toBeVisible();
  });

  test('should show sub-page in sidebar navigation', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/page');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    const pageMention = page.locator('[data-content-type="pageMention"]').first();
    await pageMention.click();
    await page.waitForLoadState('networkidle');
    
    const titleInput = page.locator('[data-testid="document-title"]').first();
    await titleInput.fill('Sidebar Test Page');
    await page.waitForTimeout(500);
    
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar.getByText('Sidebar Test Page')).toBeVisible();
  });

  test('should navigate to sub-page when clicked', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/page');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    const pageMention = page.locator('[data-content-type="pageMention"]').first();
    await expect(pageMention).toBeVisible();
    
    await pageMention.click();
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('[data-testid="document-title"]')).toBeVisible();
  });
});
