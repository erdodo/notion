import { test } from '@playwright/test';

test.describe('Automations', () => {
  test('automations menu should be accessible in database view', async ({
    page,
  }) => {
    await page.goto('/documents/test');
  });
});
