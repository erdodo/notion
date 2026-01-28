import { test as setup } from '@playwright/test';
import { testUserEmail } from '@/lib/auth';

setup('authenticate', async ({ page, context }) => {
  // Mock NextAuth session
  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: 'test-session-token',
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      expires: Date.now() / 1000 + 3600,
    },
  ]);

  // Navigate to documents to verify auth works
  await page.goto('/documents');
  await page.waitForLoadState('networkidle');

  // Save storage state
  await page.context().storageState({ path: '.auth/user.json' });
});
