import { test, expect } from '@playwright/test';

test.describe('Small Text Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/documents');
    const newPageButton = page.getByRole('button', { name: /new page/i });
    await newPageButton.click();
    await page.waitForURL(/\/documents\/[a-zA-Z0-9-]+/, { timeout: 30000 });
    await page.waitForTimeout(2000);
  });

  test('Scenario 34: Sayfa "Small text" moduyla daha fazla içeriği tek ekranda gösterebiliyor', async ({
    page,
  }) => {
    // Add some content to the page first
    const editor = page.locator('.bn-editor');
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.click();
    await page.keyboard.type('Bu bir test metnidir. Small text modu aktif edilecek.');
    await page.waitForTimeout(500);

    // Get the initial text size by checking the editor container
    const editorContainer = page.locator('.pb-40').first();
    const initialClassName = await editorContainer.getAttribute('class');
    
    // Initially should not have text-sm class
    expect(initialClassName).not.toContain('text-sm');

    // Open the page menu
    await page.click('[data-testid="page-menu-trigger"]');
    await page.waitForTimeout(500);

    // Find and click the "Small text" toggle
    const smallTextToggle = page
      .locator('text=Small text')
      .locator('..')
      .locator('..');
    await expect(smallTextToggle).toBeVisible({ timeout: 5000 });
    await smallTextToggle.click();
    await page.waitForTimeout(1000);

    // Verify the small text class is applied
    const editorContainerAfter = page.locator('.pb-40').first();
    const finalClassName = await editorContainerAfter.getAttribute('class');
    expect(finalClassName).toContain('text-sm');

    // Verify that the toggle is now in the "on" state
    const toggleSwitch = page
      .locator('text=Small text')
      .locator('..')
      .locator('input[type="checkbox"]');
    const isToggledOn = await toggleSwitch.isChecked();
    expect(isToggledOn).toBe(true);

    // Close menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Verify small text is still applied
    const editorContainerFinal = page.locator('.pb-40').first();
    const finalClassNameCheck = await editorContainerFinal.getAttribute('class');
    expect(finalClassNameCheck).toContain('text-sm');
  });

  test('Small text setting should persist after page navigation', async ({
    page,
  }) => {
    // Enable small text
    await page.click('[data-testid="page-menu-trigger"]');
    await page.waitForTimeout(500);
    const smallTextToggle = page
      .locator('text=Small text')
      .locator('..')
      .locator('..');
    await smallTextToggle.click();
    await page.waitForTimeout(1000);

    // Get current URL
    const currentUrl = page.url();

    // Navigate away
    await page.goto('/documents');
    await page.waitForTimeout(1000);

    // Navigate back
    await page.goto(currentUrl);
    await page.waitForTimeout(2000);

    // Verify small text is still enabled
    const editorContainer = page.locator('.pb-40').first();
    const className = await editorContainer.getAttribute('class');
    expect(className).toContain('text-sm');
  });

  test('Should be able to toggle small text on and off', async ({ page }) => {
    // Initially should not have small text
    let editorContainer = page.locator('.pb-40').first();
    let className = await editorContainer.getAttribute('class');
    expect(className).not.toContain('text-sm');

    // Enable small text
    await page.click('[data-testid="page-menu-trigger"]');
    await page.waitForTimeout(500);
    const smallTextToggle = page
      .locator('text=Small text')
      .locator('..')
      .locator('..');
    await smallTextToggle.click();
    await page.waitForTimeout(1000);

    // Verify it's enabled
    editorContainer = page.locator('.pb-40').first();
    className = await editorContainer.getAttribute('class');
    expect(className).toContain('text-sm');

    // Disable small text
    await page.click('[data-testid="page-menu-trigger"]');
    await page.waitForTimeout(500);
    await smallTextToggle.click();
    await page.waitForTimeout(1000);

    // Verify it's disabled
    editorContainer = page.locator('.pb-40').first();
    className = await editorContainer.getAttribute('class');
    expect(className).not.toContain('text-sm');
  });

  test('Small text should work with different font styles', async ({ page }) => {
    // Set font to Serif
    await page.click('[data-testid="page-menu-trigger"]');
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Serif")').click();
    await page.waitForTimeout(500);

    // Enable small text
    const smallTextToggle = page
      .locator('text=Small text')
      .locator('..')
      .locator('..');
    await smallTextToggle.click();
    await page.waitForTimeout(1000);

    // Verify both are applied
    const pageContainer = page.locator('.flex.flex-col.h-full.bg-background');
    const pageClassName = await pageContainer.getAttribute('class');
    expect(pageClassName).toContain('font-serif');

    const editorContainer = page.locator('.pb-40').first();
    const editorClassName = await editorContainer.getAttribute('class');
    expect(editorClassName).toContain('text-sm');
  });
});
