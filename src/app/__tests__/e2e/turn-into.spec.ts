import { test, expect } from '@playwright/test';

test.describe('Turn Into Block Conversion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should convert paragraph to heading using Turn into', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    await page.keyboard.type('Test paragraph text');
    
    const blockContainer = page.locator('[data-content-type="paragraph"]').first();
    await blockContainer.hover();
    
    const blockMenu = blockContainer.locator('button').first();
    await blockMenu.click();
    
    const turnIntoOption = page.getByRole('menuitem', { name: /turn into/i });
    await expect(turnIntoOption).toBeVisible();
    await turnIntoOption.hover();
    
    const headingOption = page.getByRole('menuitem', { name: /heading/i }).first();
    await headingOption.click();
    
    await page.waitForTimeout(500);
    
    const headingBlock = page.locator('[data-content-type="heading"]').first();
    await expect(headingBlock).toBeVisible();
    await expect(headingBlock).toContainText('Test paragraph text');
  });

  test('should convert heading to bullet list using Turn into', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/heading1');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Test heading');
    
    const headingBlock = page.locator('[data-content-type="heading"]').first();
    await headingBlock.hover();
    
    const blockMenu = headingBlock.locator('button').first();
    await blockMenu.click();
    
    const turnIntoOption = page.getByRole('menuitem', { name: /turn into/i });
    await turnIntoOption.hover();
    
    const bulletOption = page.getByRole('menuitem', { name: /bullet/i });
    await bulletOption.click();
    
    await page.waitForTimeout(500);
    
    const bulletBlock = page.locator('[data-content-type="bulletListItem"]').first();
    await expect(bulletBlock).toBeVisible();
    await expect(bulletBlock).toContainText('Test heading');
  });

  test('should convert bullet list to toggle list using Turn into', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/bullet');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Test bullet item');
    
    const bulletBlock = page.locator('[data-content-type="bulletListItem"]').first();
    await bulletBlock.hover();
    
    const blockMenu = bulletBlock.locator('button').first();
    await blockMenu.click();
    
    const turnIntoOption = page.getByRole('menuitem', { name: /turn into/i });
    await turnIntoOption.hover();
    
    const toggleOption = page.getByRole('menuitem', { name: /toggle/i });
    if (await toggleOption.isVisible()) {
      await toggleOption.click();
      await page.waitForTimeout(500);
      
      const toggleBlock = page.locator('[data-content-type="toggle"]').first();
      await expect(toggleBlock).toBeVisible();
    }
  });

  test('should convert paragraph to checklist using Turn into', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    await page.keyboard.type('Task to complete');
    
    const blockContainer = page.locator('[data-content-type="paragraph"]').first();
    await blockContainer.hover();
    
    const blockMenu = blockContainer.locator('button').first();
    await blockMenu.click();
    
    const turnIntoOption = page.getByRole('menuitem', { name: /turn into/i });
    await turnIntoOption.hover();
    
    const checklistOption = page.getByRole('menuitem', { name: /check/i });
    await checklistOption.click();
    
    await page.waitForTimeout(500);
    
    const checklistBlock = page.locator('[data-content-type="checkListItem"]').first();
    await expect(checklistBlock).toBeVisible();
    await expect(checklistBlock).toContainText('Task to complete');
  });

  test('should convert numbered list to quote using Turn into', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/numbered');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Important quote text');
    
    const numberedBlock = page.locator('[data-content-type="numberedListItem"]').first();
    await numberedBlock.hover();
    
    const blockMenu = numberedBlock.locator('button').first();
    await blockMenu.click();
    
    const turnIntoOption = page.getByRole('menuitem', { name: /turn into/i });
    await turnIntoOption.hover();
    
    const quoteOption = page.getByRole('menuitem', { name: /quote/i });
    await quoteOption.click();
    
    await page.waitForTimeout(500);
    
    const quoteBlock = page.locator('[data-content-type="quote"]').first();
    await expect(quoteBlock).toBeVisible();
    await expect(quoteBlock).toContainText('Important quote text');
  });

  test('should preserve text content when converting blocks', async ({ page }) => {
    const testText = 'This text should be preserved during conversion';
    
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    await page.keyboard.type(testText);
    
    const blockContainer = page.locator('[data-content-type="paragraph"]').first();
    await blockContainer.hover();
    
    const blockMenu = blockContainer.locator('button').first();
    await blockMenu.click();
    
    const turnIntoOption = page.getByRole('menuitem', { name: /turn into/i });
    await turnIntoOption.hover();
    
    const calloutOption = page.getByRole('menuitem', { name: /callout/i });
    if (await calloutOption.isVisible()) {
      await calloutOption.click();
      await page.waitForTimeout(500);
      
      const calloutBlock = page.locator('[data-content-type="callout"]').first();
      await expect(calloutBlock).toContainText(testText);
    }
  });
});
