import { test, expect } from '@playwright/test';

test.describe('Font Style Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/documents');
    const newPageButton = page.getByRole('button', { name: /new page/i });
    await newPageButton.click();
    await page.waitForURL(/\/documents\/[a-zA-Z0-9-]+/, { timeout: 30000 });
    await page.waitForTimeout(2000);
  });

  test('Scenario 32: Sayfa fontu "Serif" olarak değiştirilerek editoryal bir görünüm kazandırılabiliyor', async ({
    page,
  }) => {
    // Open the page menu
    await page.click('[data-testid="page-menu-trigger"]');
    await page.waitForTimeout(500);

    // Find and click the "Serif" font button
    const serifButton = page.locator('button:has-text("Serif")');
    await expect(serifButton).toBeVisible({ timeout: 5000 });
    await serifButton.click();
    await page.waitForTimeout(1000);

    // Verify the font style is applied by checking the page container
    const pageContainer = page.locator('.flex.flex-col.h-full.bg-background');
    const className = await pageContainer.getAttribute('class');
    expect(className).toContain('font-serif');

    // Verify the button is now in selected state (outline variant)
    const serifButtonVariant = await serifButton.getAttribute('class');
    expect(serifButtonVariant).toContain('outline');

    // Close menu and verify font persists
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Verify font is still applied
    const pageContainerAfter = page.locator('.flex.flex-col.h-full.bg-background');
    const classNameAfter = await pageContainerAfter.getAttribute('class');
    expect(classNameAfter).toContain('font-serif');
  });

  test('Scenario 33: Sayfa fontu "Mono" yapılarak teknik/kod dokümantasyonu havası verilebiliyor', async ({
    page,
  }) => {
    // Open the page menu
    await page.click('[data-testid="page-menu-trigger"]');
    await page.waitForTimeout(500);

    // Find and click the "Mono" font button
    const monoButton = page.locator('button:has-text("Mono")');
    await expect(monoButton).toBeVisible({ timeout: 5000 });
    await monoButton.click();
    await page.waitForTimeout(1000);

    // Verify the font style is applied
    const pageContainer = page.locator('.flex.flex-col.h-full.bg-background');
    const className = await pageContainer.getAttribute('class');
    expect(className).toContain('font-mono');

    // Verify the button is now in selected state
    const monoButtonVariant = await monoButton.getAttribute('class');
    expect(monoButtonVariant).toContain('outline');

    // Close menu and verify font persists
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Verify font is still applied
    const pageContainerAfter = page.locator('.flex.flex-col.h-full.bg-background');
    const classNameAfter = await pageContainerAfter.getAttribute('class');
    expect(classNameAfter).toContain('font-mono');
  });

  test('Font style should persist after page navigation', async ({ page }) => {
    // Set font to Serif
    await page.click('[data-testid="page-menu-trigger"]');
    await page.waitForTimeout(500);
    const serifButton = page.locator('button:has-text("Serif")');
    await serifButton.click();
    await page.waitForTimeout(1000);

    // Get current URL
    const currentUrl = page.url();

    // Navigate away
    await page.goto('/documents');
    await page.waitForTimeout(1000);

    // Navigate back
    await page.goto(currentUrl);
    await page.waitForTimeout(2000);

    // Verify font is still Serif
    const pageContainer = page.locator('.flex.flex-col.h-full.bg-background');
    const className = await pageContainer.getAttribute('class');
    expect(className).toContain('font-serif');
  });

  test('Should be able to switch between different font styles', async ({
    page,
  }) => {
    // Start with Default (Sans)
    let pageContainer = page.locator('.flex.flex-col.h-full.bg-background');
    let className = await pageContainer.getAttribute('class');
    expect(className).toContain('font-sans');

    // Switch to Serif
    await page.click('[data-testid="page-menu-trigger"]');
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Serif")').click();
    await page.waitForTimeout(1000);

    pageContainer = page.locator('.flex.flex-col.h-full.bg-background');
    className = await pageContainer.getAttribute('class');
    expect(className).toContain('font-serif');

    // Switch to Mono
    await page.click('[data-testid="page-menu-trigger"]');
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Mono")').click();
    await page.waitForTimeout(1000);

    pageContainer = page.locator('.flex.flex-col.h-full.bg-background');
    className = await pageContainer.getAttribute('class');
    expect(className).toContain('font-mono');

    // Switch back to Default
    await page.click('[data-testid="page-menu-trigger"]');
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Default")').click();
    await page.waitForTimeout(1000);

    pageContainer = page.locator('.flex.flex-col.h-full.bg-background');
    className = await pageContainer.getAttribute('class');
    expect(className).toContain('font-sans');
  });
});
