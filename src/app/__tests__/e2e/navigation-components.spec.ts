import { test, expect } from '@playwright/test';

test.setTimeout(30_000);

test.describe('Navigation & Sidebar Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/documents');
  });

  test.describe('Sidebar Structure & Visibility', () => {
    test('should render sidebar with main sections', async ({ page }) => {
      await expect(page.locator('aside')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'New Page' })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Settings' })
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Trash' })).toBeVisible();
    });

    test('should collapse and expand sidebar', async ({ page }) => {
      const sidebar = page.locator('aside');
      await expect(sidebar).toHaveClass(/w-60/);

      const collapseButton = page
        .locator('button')
        .filter({ has: page.locator('svg.lucide-chevrons-left') });
      await collapseButton.click();

      const menuButton = page
        .locator('button')
        .filter({ has: page.locator('svg.lucide-menu') });
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
    test('should create a new page using the sidebar button', async ({
      page,
    }) => {
      await page.getByRole('button', { name: 'New Page' }).click();
      await page.waitForURL(/\/documents\/[a-zA-Z0-9-]+/);
      await expect(page.getByPlaceholder('Untitled')).toBeVisible();
    });

    test('should search for documents', async ({ page }) => {
      await page.getByRole('button', { name: 'Search' }).click();

      const searchInput = page
        .getByPlaceholder('Search pages by title or content...')
        .first();
      await expect(searchInput).toBeVisible();

      await searchInput.fill('test');

      await page.keyboard.press('Escape');
    });

    test('should open settings', async ({ page }) => {
      await page.getByRole('button', { name: 'Settings' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Settings' })
      ).toBeVisible();
    });

    test('should open trash', async ({ page }) => {
      await page.getByRole('button', { name: 'Trash' }).click();
      await expect(
        page.getByPlaceholder('Filter by page title...')
      ).toBeVisible();
    });
  });

  test.describe('Document Items (Item & SortableItem)', () => {
    let documentId: string;

    test.beforeEach(async ({ page }) => {
      const menuButton = page
        .locator('button')
        .filter({ has: page.locator('svg.lucide-menu') })
        .first();
      if (await menuButton.isVisible()) {
        await menuButton.click();
      }

      await page.getByRole('button', { name: 'New Page' }).click();
      await page.waitForURL(/\/documents\/[a-zA-Z0-9-]+/);

      const url = page.url();
      documentId = url.split('/').pop() || '';

      const titleInput = page.getByPlaceholder('Untitled');
      await titleInput.click();

      const newTitle = 'Test Page ' + documentId.slice(0, 6);
      await titleInput.fill(newTitle);
      await titleInput.blur();

      try {
        await expect(
          page.locator('aside').getByText(newTitle, { exact: false })
        ).toBeVisible({ timeout: 5000 });
      } catch {
        await page.reload();
        await expect(
          page.locator('aside').getByText(newTitle, { exact: false })
        ).toBeVisible({ timeout: 20_000 });
      }
    });

    test('should display document in sidebar and allow navigation', async ({
      page,
    }) => {
      const newTitle = 'Test Page ' + documentId.slice(0, 6);
      const sidebarItem = page
        .locator('aside')
        .getByText(newTitle, { exact: false });
      await expect(sidebarItem).toBeVisible();

      await sidebarItem.click();
      await page.waitForURL(new RegExp(`/documents/${documentId}`));
    });

    test('should allow creating a nested page', async ({ page }) => {
      const newTitle = 'Test Page ' + documentId.slice(0, 6);

      const parentItem = page
        .locator('aside')
        .getByText(newTitle, { exact: false });
      await expect(parentItem).toBeVisible();

      await parentItem.hover();

      const plusButton = page
        .locator('aside')
        .locator('button')
        .filter({ has: page.locator('svg.lucide-plus') })
        .first();
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
