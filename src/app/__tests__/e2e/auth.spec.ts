import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect unauthenticated user to sign in', async ({ page }) => {
    if (process.env.TEST_MODE === 'true') {
      test.skip();
      return;
    }
    await page.goto('/documents');
    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('sign in page should render correctly', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(
      page.getByRole('heading', { name: 'Welcome back' })
    ).toBeVisible();
  });
});
