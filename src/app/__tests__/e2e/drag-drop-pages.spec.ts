import { test, expect } from '@playwright/test';

test.describe('Drag and Drop Pages in Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should allow dragging pages in sidebar', async ({ page }) => {
    await page.locator('[data-testid="document-title"]').first().fill('Page A');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /new page/i }).click();
    await page.waitForTimeout(1000);
    
    await page.locator('[data-testid="document-title"]').first().fill('Page B');
    await page.waitForTimeout(500);

    const sidebar = page.locator('[data-testid="sidebar"]');
    const pageA = sidebar.getByText('Page A').first();
    const pageB = sidebar.getByText('Page B').first();

    await expect(pageA).toBeVisible();
    await expect(pageB).toBeVisible();

    const pageABox = await pageA.boundingBox();
    const pageBBox = await pageB.boundingBox();

    if (pageABox && pageBBox) {
      await page.mouse.move(pageABox.x + pageABox.width / 2, pageABox.y + pageABox.height / 2);
      await page.mouse.down();
      await page.mouse.move(pageBBox.x + pageBBox.width / 2, pageBBox.y + pageBBox.height / 2, { steps: 10 });
      await page.mouse.up();
      
      await page.waitForTimeout(500);
    }
  });

  test('should reorder pages after drag and drop', async ({ page }) => {
    await page.locator('[data-testid="document-title"]').first().fill('First Page');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /new page/i }).click();
    await page.waitForTimeout(1000);
    
    await page.locator('[data-testid="document-title"]').first().fill('Second Page');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /new page/i }).click();
    await page.waitForTimeout(1000);
    
    await page.locator('[data-testid="document-title"]').first().fill('Third Page');
    await page.waitForTimeout(500);

    const sidebar = page.locator('[data-testid="sidebar"]');
    
    await expect(sidebar.getByText('First Page')).toBeVisible();
    await expect(sidebar.getByText('Second Page')).toBeVisible();
    await expect(sidebar.getByText('Third Page')).toBeVisible();
  });

  test('should show drag overlay when dragging page', async ({ page }) => {
    await page.locator('[data-testid="document-title"]').first().fill('Draggable Page');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /new page/i }).click();
    await page.waitForTimeout(1000);
    
    await page.locator('[data-testid="document-title"]').first().fill('Target Page');
    await page.waitForTimeout(500);

    const sidebar = page.locator('[data-testid="sidebar"]');
    const draggablePage = sidebar.getByText('Draggable Page').first();

    const pageBox = await draggablePage.boundingBox();
    if (pageBox) {
      await page.mouse.move(pageBox.x + pageBox.width / 2, pageBox.y + pageBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(pageBox.x + 100, pageBox.y + 100, { steps: 5 });
      
      await page.waitForTimeout(200);
      await page.mouse.up();
    }
  });

  test('should maintain page hierarchy after drag', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/page');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    const pageMention = page.locator('[data-content-type="pageMention"]').first();
    await pageMention.click();
    await page.waitForLoadState('networkidle');
    
    await page.locator('[data-testid="document-title"]').first().fill('Sub Page');
    await page.waitForTimeout(500);
    
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar.getByText('Sub Page')).toBeVisible();
  });
});
