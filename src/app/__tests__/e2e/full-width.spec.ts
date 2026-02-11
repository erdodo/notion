import { test, expect } from '@playwright/test';

test.describe('Full Width Page Feature', () => {
  test('should toggle full width mode and adjust page layout', async ({
    page,
  }) => {
    // Navigate to the main documents page
    await page.goto('/documents');

    // Create a new document
    await page.getByRole('button', { name: /new page/i }).click();

    // Wait for the document to be created and editor to load
    await page.waitForURL(/\/documents\/[a-zA-Z0-9-]+/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Get the initial page width by checking the editor container
    const editorContainer = page.locator('.bn-editor').first();
    const initialWidth = await editorContainer.evaluate((el) => el.clientWidth);

    // Open the page menu
    await page.click('[data-testid="page-menu-trigger"]');

    // Find and click the "Full width" toggle
    const fullWidthToggle = page
      .locator('text=Full width')
      .locator('..')
      .locator('..');
    await fullWidthToggle.click();

    // Wait for the layout to update
    await page.waitForTimeout(1000);

    // Verify the page content now spans the full width
    const editorContainerAfter = page.locator('.bn-editor').first();
    const finalWidth = await editorContainerAfter.evaluate(
      (el) => el.clientWidth
    );

    // The final width should be significantly larger than the initial width
    expect(finalWidth).toBeGreaterThan(initialWidth);

    // Verify that the toggle is now in the "on" state
    const toggleSwitch = page
      .locator('text=Full width')
      .locator('..')
      .locator('input[type="checkbox"]');
    const isToggledOn = await toggleSwitch.isChecked();
    expect(isToggledOn).toBe(true);

    // Toggle it off again
    await fullWidthToggle.click();
    await page.waitForTimeout(1000);

    // Verify the page content is back to the original width
    const editorContainerAfterOff = page.locator('.bn-editor').first();
    const finalWidthOff = await editorContainerAfterOff.evaluate(
      (el) => el.clientWidth
    );

    // The width should be back to something close to the original
    expect(finalWidthOff).toBeLessThan(finalWidth);
  });

  test('should persist full width setting when navigating', async ({
    page,
  }) => {
    // Navigate to the main documents page
    await page.goto('/documents');

    // Create a new document
    await page.getByRole('button', { name: /new page/i }).click();

    // Wait for the document to be created and editor to load
    await page.waitForURL(/\/documents\/[a-zA-Z0-9-]+/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Open the page menu and enable full width
    await page.click('[data-testid="page-menu-trigger"]');
    const fullWidthToggle = page
      .locator('text=Full width')
      .locator('..')
      .locator('..');
    await fullWidthToggle.click();
    await page.waitForTimeout(1000);

    // Navigate to another page
    await page.goto('/documents');

    // Navigate back to the document
    await page.locator('[data-testid="document-link"]').first().click();

    // Wait for the document to load
    await page.waitForURL(/\/documents\/[a-zA-Z0-9-]+/, { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Verify that the full width setting is preserved
    const editorContainer = page.locator('.bn-editor').first();
    const width = await editorContainer.evaluate((el) => el.clientWidth);

    // The width should still be in full width mode
    expect(width).toBeGreaterThan(800); // Assuming full width is significantly larger
  });
});
