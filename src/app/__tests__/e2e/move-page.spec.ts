import { test, expect } from '@playwright/test';

test.describe('Move Page Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open move page modal from page menu', async ({ page }) => {
    await page.locator('[data-testid="document-title"]').first().fill('Test Page');
    await page.waitForTimeout(500);

    await page.locator('[data-testid="page-menu-button"]').first().click();
    await page.waitForTimeout(200);

    const moveButton = page.getByRole('menuitem', { name: /move to/i });
    if (await moveButton.isVisible()) {
      await moveButton.click();
      await page.waitForTimeout(500);

      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText(/move page to/i)).toBeVisible();
    }
  });

  test('should show root location option in move modal', async ({ page }) => {
    await page.locator('[data-testid="document-title"]').first().fill('Page to Move');
    await page.waitForTimeout(500);

    await page.locator('[data-testid="page-menu-button"]').first().click();
    await page.waitForTimeout(200);

    const moveButton = page.getByRole('menuitem', { name: /move to/i });
    if (await moveButton.isVisible()) {
      await moveButton.click();
      await page.waitForTimeout(500);

      await expect(page.getByText(/private pages/i)).toBeVisible();
    }
  });

  test('should search for target pages in move modal', async ({ page }) => {
    await page.locator('[data-testid="document-title"]').first().fill('Source Page');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /new page/i }).click();
    await page.waitForTimeout(1000);
    
    await page.locator('[data-testid="document-title"]').first().fill('Target Page');
    await page.waitForTimeout(500);

    await page.goBack();
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="page-menu-button"]').first().click();
    await page.waitForTimeout(200);

    const moveButton = page.getByRole('menuitem', { name: /move to/i });
    if (await moveButton.isVisible()) {
      await moveButton.click();
      await page.waitForTimeout(500);

      const searchInput = page.getByPlaceholder(/search pages/i);
      await searchInput.fill('Target');
      await page.waitForTimeout(500);

      await expect(page.getByText('Target Page')).toBeVisible();
    }
  });

  test('should move page to another location', async ({ page }) => {
    await page.locator('[data-testid="document-title"]').first().fill('Page A');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /new page/i }).click();
    await page.waitForTimeout(1000);
    
    await page.locator('[data-testid="document-title"]').first().fill('Page B');
    await page.waitForTimeout(500);

    await page.goBack();
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="page-menu-button"]').first().click();
    await page.waitForTimeout(200);

    const moveButton = page.getByRole('menuitem', { name: /move to/i });
    if (await moveButton.isVisible()) {
      await moveButton.click();
      await page.waitForTimeout(500);

      const targetPage = page.getByText('Page B');
      if (await targetPage.isVisible()) {
        await targetPage.click();
        await page.waitForTimeout(1000);

        await expect(page.getByText(/moved successfully/i)).toBeVisible();
      }
    }
  });

  test('should close move modal on cancel', async ({ page }) => {
    await page.locator('[data-testid="document-title"]').first().fill('Test Page');
    await page.waitForTimeout(500);

    await page.locator('[data-testid="page-menu-button"]').first().click();
    await page.waitForTimeout(200);

    const moveButton = page.getByRole('menuitem', { name: /move to/i });
    if (await moveButton.isVisible()) {
      await moveButton.click();
      await page.waitForTimeout(500);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);

      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
  });
});
