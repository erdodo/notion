import { test, expect } from '@playwright/test';

test.describe('Table of Contents', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should insert table of contents using /toc command', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/toc');
    await page.waitForSelector('text=Table of Contents', { state: 'visible' });
    
    const tocOption = page.getByText('Overview of page headings');
    await expect(tocOption).toBeVisible();
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const tocBlock = page.locator('text=TABLE OF CONTENTS').first();
    await expect(tocBlock).toBeVisible();
  });

  test('should show headings in table of contents', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/heading1');
    await page.keyboard.press('Enter');
    await page.keyboard.type('First Heading');
    await page.keyboard.press('Enter');
    
    await page.keyboard.type('/heading2');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Second Heading');
    await page.keyboard.press('Enter');
    
    await page.keyboard.type('/toc');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    
    const tocBlock = page.locator('.bg-muted\\/30').first();
    await expect(tocBlock).toBeVisible();
    await expect(tocBlock).toContainText('First Heading');
    await expect(tocBlock).toContainText('Second Heading');
  });

  test('should navigate to heading when clicked in TOC', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/heading1');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Target Heading');
    await page.keyboard.press('Enter');
    
    for (let i = 0; i < 10; i++) {
      await page.keyboard.type('Filler paragraph');
      await page.keyboard.press('Enter');
    }
    
    await page.keyboard.type('/toc');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    
    const tocLink = page.locator('.text-blue-600').filter({ hasText: 'Target Heading' });
    await expect(tocLink).toBeVisible();
    await tocLink.click();
    
    await page.waitForTimeout(500);
  });

  test('should show hierarchical structure in TOC', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/heading1');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Main Heading');
    await page.keyboard.press('Enter');
    
    await page.keyboard.type('/heading2');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Sub Heading');
    await page.keyboard.press('Enter');
    
    await page.keyboard.type('/heading3');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Sub Sub Heading');
    await page.keyboard.press('Enter');
    
    await page.keyboard.type('/toc');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    
    const tocBlock = page.locator('.bg-muted\\/30').first();
    await expect(tocBlock).toContainText('Main Heading');
    await expect(tocBlock).toContainText('Sub Heading');
    await expect(tocBlock).toContainText('Sub Sub Heading');
  });

  test('should show empty state when no headings exist', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('Regular paragraph text');
    await page.keyboard.press('Enter');
    
    await page.keyboard.type('/toc');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    
    const emptyMessage = page.locator('text=No headings found');
    await expect(emptyMessage).toBeVisible();
  });

  test('should update TOC when headings are added', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/toc');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    
    await expect(page.locator('text=No headings found')).toBeVisible();
    
    await page.keyboard.press('Enter');
    await page.keyboard.type('/heading1');
    await page.keyboard.press('Enter');
    await page.keyboard.type('New Heading');
    
    await page.waitForTimeout(1500);
    
    const tocBlock = page.locator('.bg-muted\\/30').first();
    await expect(tocBlock).toContainText('New Heading');
  });
});
