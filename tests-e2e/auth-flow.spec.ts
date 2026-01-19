
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

    test.describe('Sign In Page', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/sign-in');
        });

        test('should render sign in page correctly', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
            await expect(page.getByText('Sign in to continue to your workspace')).toBeVisible();
            await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
            await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
        });

        test('should navigate to sign up page', async ({ page }) => {
            await page.click('text=Sign up');
            await expect(page).toHaveURL(/\/sign-up/);
            await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
        });

        test('google button should be clickable', async ({ page }) => {
            const googleButton = page.getByRole('button', { name: 'Continue with Google' });
            await expect(googleButton).toBeEnabled();
            // We verify it's a button and exists. 
            // Clicking it would redirect to Google, which we might not want to fully automate here without mocks,
            // but we can verify it's the correct element type.
        });
    });

    test.describe('Sign Up Page', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/sign-up');
        });

        test('should render sign up page correctly', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
            await expect(page.getByText('Get started with your workspace')).toBeVisible();
            await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
            await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
        });

        test('should navigate to sign in page', async ({ page }) => {
            await page.click('text=Sign in');
            await expect(page).toHaveURL(/\/sign-in/);
            await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
        });

        test('google button should be clickable', async ({ page }) => {
            const googleButton = page.getByRole('button', { name: 'Continue with Google' });
            await expect(googleButton).toBeEnabled();
        });
    });
});
