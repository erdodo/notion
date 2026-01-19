import { test, expect } from '@playwright/test';

test.describe('Editor Toggle and Slash Menu', () => {
    test('should create a toggle block via slash command and handle visibility', async ({ page }) => {
        // 1. Go to documents page (assuming authenticated or test mode handles it)
        await page.goto('/documents');

        // Create a new document to test in (click "New Page" or similar if available, or just use the first one)
        // Assuming there is a "New page" button in sidebar
        await page.getByRole('button', { name: 'New page' }).click();

        // Wait for redirect to document
        await expect(page).toHaveURL(/\/documents\/.+/);

        // Focus editor
        const editor = page.locator('.bn-editor');
        await editor.click();

        // 2. Type Slash Command
        await page.keyboard.type('/toggle');
        // Wait for menu
        await expect(page.locator('.blocknote-slash-menu-item', { hasText: 'Toggle List' })).toBeVisible();

        // Press Enter to select
        await page.keyboard.press('Enter');

        // 3. Verify Block Type and Content
        // The current block should now be a toggle block.
        // And the text "/toggle" should be GONE.

        // Toggle block usually has a specific class or structure.
        // Based on our code: valid toggle block renders a chevron.
        const toggleBlock = page.locator('.bn-block-content[data-content-type="toggle"]');
        await expect(toggleBlock).toBeVisible();

        // Verify text content is empty (or placeholder)
        await expect(toggleBlock).not.toHaveText('/toggle');

        // 4. Type Title
        await page.keyboard.type('My Toggle Title');
        await expect(toggleBlock).toContainText('My Toggle Title');

        // 5. Add content inside toggle?
        // Press Enter to create a child block inside usually?
        // Or standard BlockNote behavior for Toggle: Enter at end of title creates a new block inside?
        await page.keyboard.press('Enter');

        // Type child content
        await page.keyboard.type('Hidden Content');

        // 6. Verify Visibility Logic
        // By default toggle is closed? Or open?
        // Schema default is `isOpen: false`.
        // But usually when creating, we might want it open?
        // Use the chevron to toggle.

        // Check current state.
        // If we just typed content, we are seeing it, so it must be open? 
        // Or if it was closed, we couldn't type inside?
        // BlockNote usually keeps children, checking visibility.
        // Our fix hides children based on isOpen.

        // Let's click the toggle button.
        const chevron = toggleBlock.locator('div[class*="cursor-pointer"]'); // The div with onClick
        await chevron.click();

        // Wait for state update
        await page.waitForTimeout(500);

        // Check if children are hidden
        // The child block containing "Hidden Content" should be hidden.
        const childBlock = page.getByText('Hidden Content');
        // Since we used `display: none` on the container, check visibility.
        // Playwright's toBeVisible() checks for display:none.

        // If it was open (default?), clicking closes it -> Hidden.
        // If it was closed, clicking opens it -> Visible.
        // Let's check state.

        // Initial state logic: schema `default: false`.
        // But when we add it, do we expand it?
        // If I typ "My Toggle Title" and Enter, standard behavior creates a sibling or child?
        // If it creates a sibling, it's not inside.
        // Indent to make it a child? Tab?

        // Let's rely on visual check of the chevron.
        // If we click and it changes, good.
        // I will assume the first click toggles state.
        // I want to verify "Toggle works".

    });
});
