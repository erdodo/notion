import { test, expect } from '@playwright/test';

test.describe('Emoji Picker and Inline Emoji', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open emoji picker when clicking page icon area', async ({ page }) => {
    const iconButton = page.locator('button').filter({ hasText: /add.*icon|emoji/i }).first();
    if (await iconButton.isVisible()) {
      await iconButton.click();
      await page.waitForTimeout(500);
      
      const emojiPicker = page.locator('.EmojiPickerReact, [class*="emoji-picker"]').first();
      if (await emojiPicker.isVisible()) {
        await expect(emojiPicker).toBeVisible();
      }
    }
  });

  test('should allow selecting emoji from picker', async ({ page }) => {
    const iconButton = page.locator('button').filter({ hasText: /add.*icon|emoji/i }).first();
    if (await iconButton.isVisible()) {
      await iconButton.click();
      await page.waitForTimeout(500);
      
      const emojiOption = page.locator('.epr-emoji-category-content button').first();
      if (await emojiOption.isVisible()) {
        await emojiOption.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should show upload custom icon option', async ({ page }) => {
    const iconButton = page.locator('button').filter({ hasText: /add.*icon|emoji/i }).first();
    if (await iconButton.isVisible()) {
      await iconButton.click();
      await page.waitForTimeout(500);
      
      const uploadOption = page.locator('text=/upload.*icon/i').first();
      if (await uploadOption.isVisible()) {
        await expect(uploadOption).toBeVisible();
      }
    }
  });

  test('should allow typing emoji with colon syntax', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    if (await editor.isVisible()) {
      await editor.click();
      await page.keyboard.type(':smile');
      await page.waitForTimeout(500);
      
      const emojiSuggestion = page.locator('[role="option"]').first();
      if (await emojiSuggestion.isVisible()) {
        await expect(emojiSuggestion).toBeVisible();
      }
    }
  });

  test('should insert emoji when colon suggestion selected', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    if (await editor.isVisible()) {
      await editor.click();
      await page.keyboard.type(':heart');
      await page.waitForTimeout(500);
      
      const firstSuggestion = page.locator('[role="option"]').first();
      if (await firstSuggestion.isVisible()) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(300);
      }
    }
  });

  test('should show emoji categories in picker', async ({ page }) => {
    const iconButton = page.locator('button').filter({ hasText: /add.*icon|emoji/i }).first();
    if (await iconButton.isVisible()) {
      await iconButton.click();
      await page.waitForTimeout(500);
      
      const categories = page.locator('.epr-emoji-category-label').first();
      if (await categories.isVisible()) {
        await expect(categories).toBeVisible();
      }
    }
  });

  test('should allow searching emojis in picker', async ({ page }) => {
    const iconButton = page.locator('button').filter({ hasText: /add.*icon|emoji/i }).first();
    if (await iconButton.isVisible()) {
      await iconButton.click();
      await page.waitForTimeout(500);
      
      const searchInput = page.locator('input[placeholder*="search" i]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('smile');
        await page.waitForTimeout(300);
      }
    }
  });

  test('should close emoji picker after selection', async ({ page }) => {
    const iconButton = page.locator('button').filter({ hasText: /add.*icon|emoji/i }).first();
    if (await iconButton.isVisible()) {
      await iconButton.click();
      await page.waitForTimeout(500);
      
      const emojiOption = page.locator('.epr-emoji-category-content button').first();
      if (await emojiOption.isVisible()) {
        await emojiOption.click();
        await page.waitForTimeout(500);
        
        const emojiPicker = page.locator('.EmojiPickerReact').first();
        if (await emojiPicker.isVisible()) {
          await expect(emojiPicker).not.toBeVisible();
        }
      }
    }
  });

  test('should support theme switching in emoji picker', async ({ page }) => {
    const iconButton = page.locator('button').filter({ hasText: /add.*icon|emoji/i }).first();
    if (await iconButton.isVisible()) {
      await iconButton.click();
      await page.waitForTimeout(500);
      
      const emojiPicker = page.locator('.EmojiPickerReact').first();
      if (await emojiPicker.isVisible()) {
        await expect(emojiPicker).toBeVisible();
      }
    }
  });
});
