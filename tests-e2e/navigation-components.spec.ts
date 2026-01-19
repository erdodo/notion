
import { test, expect } from '@playwright/test';

test.setTimeout(30000);

test.describe('Navigation & Sidebar Components', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/documents');
    });

    test.describe('Sidebar Structure & Visibility', () => {
        test('should render sidebar with main sections', async ({ page }) => {
            await expect(page.locator('aside')).toBeVisible();
            await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'New Page' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Trash' })).toBeVisible();
        });

        test('should collapse and expand sidebar', async ({ page }) => {
            const sidebar = page.locator('aside');
            await expect(sidebar).toHaveClass(/w-60/);

            const collapseButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevrons-left') });
            await collapseButton.click();

            const menuButton = page.locator('button').filter({ has: page.locator('svg.lucide-menu') });
            await expect(menuButton).toBeVisible();

            await menuButton.click();
            await expect(sidebar).toHaveClass(/w-60/);
        });

        test('should handle mobile responsive layout', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.waitForLoadState('networkidle');

            const sidebar = page.locator('aside');
            await expect(sidebar).toBeVisible();
        });
    });

    test.describe('Document Management via Sidebar', () => {
        test('should create a new page using the sidebar button', async ({ page }) => {
            await page.getByRole('button', { name: 'New Page' }).click();
            await page.waitForURL(/\/documents\/[a-zA-Z0-9-]+/);
            await expect(page.getByPlaceholder('Untitled')).toBeVisible();
        });

        test('should search for documents', async ({ page }) => {
            await page.getByRole('button', { name: 'Search' }).click();

            // Wait for search input to appear (use first() for strict mode)
            const searchInput = page.getByPlaceholder('Search pages by title or content...').first();
            await expect(searchInput).toBeVisible();

            // Type in search
            await searchInput.fill('test');

            await page.keyboard.press('Escape');
        });

        test('should open settings', async ({ page }) => {
            await page.getByRole('button', { name: 'Settings' }).click();
            await expect(page.getByRole('dialog')).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
        });

        test('should open trash', async ({ page }) => {
            await page.getByRole('button', { name: 'Trash' }).click();
            await expect(page.getByPlaceholder('Filter by page title...')).toBeVisible();
        });
    });

    test.describe('Document Items (Item & SortableItem)', () => {
        let docId: string;

        test.beforeEach(async ({ page }) => {
            // Expand sidebar if it's mobile/collapsed from previous state
            const menuButton = page.locator('button').filter({ has: page.locator('svg.lucide-menu') }).first();
            if (await menuButton.isVisible()) {
                await menuButton.click();
            }

            await page.getByRole('button', { name: 'New Page' }).click();
            await page.waitForURL(/\/documents\/[a-zA-Z0-9-]+/);

            const url = page.url();
            docId = url.split('/').pop() || '';

            // Type like a real user - this triggers React's onChange
            const titleInput = page.getByPlaceholder('Untitled');
            await titleInput.click();

            // Use fill and wait for the update to propagate
            const newTitle = 'Test Page ' + docId;
            await titleInput.fill(newTitle);
            await titleInput.press('Enter'); // Trigger blur/save through keyboard

            // Click outside to be sure
            await page.locator('body').click({ position: { x: 10, y: 10 } });

            // Wait for the sidebar to reflect the change with a generous timeout
            const sidebarItem = page.locator('aside').getByText(newTitle, { exact: false });
            await expect(sidebarItem).toBeVisible({ timeout: 15000 });
        });

        test('should display document in sidebar and allow navigation', async ({ page }) => {
            const newTitle = 'Test Page ' + docId;
            const sidebarItem = page.locator('aside').getByText(newTitle, { exact: false });
            await expect(sidebarItem).toBeVisible();

            await sidebarItem.click();
            await page.waitForURL(new RegExp(`/documents/${docId}`));
        });

        test('should allow creating a nested page', async ({ page }) => {
            // Find the parent item by text
            const parentItem = page.locator('aside').getByText('Test Page ' + docId, { exact: false });
            await expect(parentItem).toBeVisible();

            // Hover over the parent element to show plus button
            await parentItem.hover();

            // Find plus button near the text
            const plusButton = page.locator('aside').locator('button').filter({ has: page.locator('svg.lucide-plus') }).first();
            await plusButton.click();

            await page.waitForURL(/\/documents\/[a-zA-Z0-9-]+/);
            await expect(page.getByPlaceholder('Untitled')).toBeVisible();
        });

    });

    test.describe('Document List Loading & Empty States', () => {
        test('should show document list', async ({ page }) => {
            await expect(page.getByRole('complementary')).toBeVisible();
        });
    });

});
