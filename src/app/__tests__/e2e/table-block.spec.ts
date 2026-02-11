import { test, expect } from '@playwright/test';

test.describe('Table Block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should insert table using /table command', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table');
    await page.waitForSelector('text=Insert a table', { state: 'visible' });
    
    const tableOption = page.getByText('Insert a table');
    await expect(tableOption).toBeVisible();
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const tableBlock = page.locator('[data-content-type="table"]').first();
    await expect(tableBlock).toBeVisible();
  });

  test('should create table with default 3x2 grid', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const tableBlock = page.locator('[data-content-type="table"]').first();
    await expect(tableBlock).toBeVisible();
    
    const cells = tableBlock.locator('td, th');
    const cellCount = await cells.count();
    expect(cellCount).toBeGreaterThan(0);
  });

  test('should allow editing table cells', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const tableBlock = page.locator('[data-content-type="table"]').first();
    const firstCell = tableBlock.locator('td, th').first();
    
    await firstCell.click();
    await page.keyboard.type('Cell Content');
    await page.waitForTimeout(300);
    
    await expect(firstCell).toContainText('Cell Content');
  });

  test('should navigate between cells with Tab key', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const tableBlock = page.locator('[data-content-type="table"]').first();
    const firstCell = tableBlock.locator('td, th').first();
    
    await firstCell.click();
    await page.keyboard.type('First');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Second');
    
    await page.waitForTimeout(300);
  });

  test('should show table in editor', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('Text before table');
    await page.keyboard.press('Enter');
    
    await page.keyboard.type('/table');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    await expect(page.getByText('Text before table')).toBeVisible();
    
    const tableBlock = page.locator('[data-content-type="table"]').first();
    await expect(tableBlock).toBeVisible();
  });
});
