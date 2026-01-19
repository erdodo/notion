import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('should redirect unauthenticated user to sign in', async ({ page }) => {
        // Skip this test if TEST_MODE is enabled because middleware bypasses auth
        if (process.env.TEST_MODE === "true") {
            test.skip();
            return;
        }
        await page.goto('/documents');
        await expect(page).toHaveURL(/.*sign-in/);
    });

    test('sign in page should render correctly', async ({ page }) => {
        await page.goto('/sign-in');

        // Check for essential elements
        // Note: Since actual auth provider login (Google) is external, we mostly check if our UI is present
        await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
        // Assuming there is a generic "Log in" or similar text/button
        // We might need to adjust selectors based on actual UI
    });
});
