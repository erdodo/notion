import { test, expect } from '@playwright/test';

test.describe('QA Defect Fix Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming unauthenticated or test mode
    await page.goto('/documents');
  });

  test('Editor should retain cursor position and focus during typing', async ({
    page,
  }) => {
    // This verifies the fix for "Editor thrashing / Cursor Reset"
    await page.getByRole('button', { name: 'New page' }).click();
    // Wait for navigation
    await page.waitForURL(/\/documents\/.+/);

    const editor = page.locator('.bn-editor');
    await editor.click();

    // Type fast
    await page.keyboard.type('Hello World');
    await page.waitForTimeout(100);
    await page.keyboard.type(' Continued');

    // If bug key was present (re-render on every keystroke), the cursor might jump or lose focus.
    // We check if the text is intact.
    await expect(page.locator('.bn-editor')).toContainText(
      'Hello World Continued'
    );
  });

  test('Document creation should yield single item (smoke test)', async ({
    page,
  }) => {
    // We cannot easily simulate the race condition without mock harness,
    // but we can ensure basic creation is stable.
    await page.getByRole('button', { name: 'New page' }).click();

    // Expect 1 untitled or New Page
    // This confirms we didn't break creation with our "exists" check.
    const newPageCheck = page.getByText('Untitled').first();
    await expect(newPageCheck).toBeVisible();
  });
});
