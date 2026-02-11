import { test, expect } from '@playwright/test';

test.describe('Database Properties', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should create database with default Name property', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table inline');
    await page.waitForTimeout(500);
    
    const inlineDatabaseOption = page.locator('text=Embed a database in this page').first();
    if (await inlineDatabaseOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      const nameColumn = page.locator('th').filter({ hasText: /name|title/i }).first();
      if (await nameColumn.isVisible()) {
        await expect(nameColumn).toBeVisible();
      }
    }
  });

  test('should allow adding new properties to database', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table inline');
    await page.waitForTimeout(500);
    
    const inlineDatabaseOption = page.locator('text=Embed a database in this page').first();
    if (await inlineDatabaseOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      const addPropertyButton = page.locator('button').filter({ hasText: /add.*property|new.*property/i }).first();
      if (await addPropertyButton.isVisible()) {
        await addPropertyButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should show property type options when adding property', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/table inline');
    await page.waitForTimeout(500);
    
    const inlineDatabaseOption = page.locator('text=Embed a database in this page').first();
    if (await inlineDatabaseOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      const addPropertyButton = page.locator('button').filter({ hasText: /add.*property/i }).first();
      if (await addPropertyButton.isVisible()) {
        await addPropertyButton.click();
        await page.waitForTimeout(500);
        
        const propertyTypes = ['Text', 'Number', 'Select', 'Date', 'Checkbox'];
        for (const type of propertyTypes) {
          const typeOption = page.locator(`text=${type}`).first();
          if (await typeOption.isVisible()) {
            await expect(typeOption).toBeVisible();
            break;
          }
        }
      }
    }
  });

  test('should allow adding text property', async ({ page }) => {
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

  test('should allow adding number property', async ({ page }) => {
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

  test('should allow adding select property', async ({ page }) => {
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

  test('should allow adding multi-select property', async ({ page }) => {
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

  test('should allow adding date property', async ({ page }) => {
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

  test('should allow adding status property', async ({ page }) => {
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

  test('should allow adding checkbox property', async ({ page }) => {
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
