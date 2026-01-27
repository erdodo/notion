import { test, expect } from '@playwright/test';

test.describe('Document Management', () => {
  test('guest trying to create document redirects to login', async ({
    page,
  }) => {
    await page.goto('/documents?guest=true');
    await expect(page).toHaveURL(/.*sign-in/);
  });
});
