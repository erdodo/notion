import { test, expect } from '@playwright/test';

test.describe('Toggle Block', () => {
    test.beforeEach(async ({ page }) => {
        // Go to documents page
        await page.goto('/documents');
        // Create a new page
        await page.getByRole('button', { name: 'New Page' }).click();
        await page.waitForURL(/\/documents\/[a-zA-Z0-9-]+/);
    });

    test('should act as a toggle block', async ({ page }) => {
        // Wait for the editor to be ready by checking for the title
        const titleInput = page.getByPlaceholder('Untitled');
        await expect(titleInput).toBeVisible();

        // Click into the editor content area (below title) to focus
        // The editor content usually has a specific class or we can click the main area
        await page.locator('.bn-editor').click();

        // Type /toggle to create a toggle block
        await page.keyboard.type('/toggle');
        await page.keyboard.press('Enter');

        // Check if toggle block is created
        // The toggle block custom component has a specific structure we can look for
        const toggleBlock = page.locator('.bn-block-outer[data-content-type="toggle"]');
        await expect(toggleBlock).toBeVisible();

        // The content div of the toggle block
        const toggleContent = toggleBlock.locator('[contenteditable="true"]'); // This might differ based on BlockNote internals, but usually there's an editable area

        // BlockNote custom blocks with "inline" content usually render the contentRef div.
        // Let's type something into it.
        await page.keyboard.type('Toggle Title Content');
        await expect(page.getByText('Toggle Title Content')).toBeVisible();

        // Check the toggle icon
        // Initially it should be closed (ChevronRight) or verify state
        // Our component renders ChevronRight when !isOpen
        // But wait, the component default is isOpen: false? 
        // Let's check the code: isOpen default is false.

        // Find the toggle icon div
        const toggleIconParams = toggleBlock.locator('.cursor-pointer');
        // We can check for the chevron right icon (lucide-react renders svgs)
        // Usually we can check for the class or the svg itself
        await expect(toggleIconParams.locator('svg.lucide-chevron-right')).toBeVisible();

        // Click the toggle icon to open
        await toggleIconParams.click();

        // Now it should be open
        // Check for ChevronDown
        await expect(toggleIconParams.locator('svg.lucide-chevron-down')).toBeVisible();

        // Toggle back closed
        await toggleIconParams.click();
        await expect(toggleIconParams.locator('svg.lucide-chevron-right')).toBeVisible();
    });
});
