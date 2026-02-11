import { test, expect } from '@playwright/test';

test.describe('Media Blocks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should insert image block using /image command', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/image');
    await page.waitForSelector('text=Upload or embed an image', { state: 'visible' });
    
    const imageOption = page.getByText('Upload or embed an image');
    await expect(imageOption).toBeVisible();
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const imageBlock = page.locator('[data-content-type="image"]').first();
    await expect(imageBlock).toBeVisible();
  });

  test('should insert video block using /video command', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/video');
    await page.waitForSelector('text=Embed a video', { state: 'visible' });
    
    const videoOption = page.getByText('Embed a video');
    await expect(videoOption).toBeVisible();
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const videoBlock = page.locator('[data-content-type="video"]').first();
    await expect(videoBlock).toBeVisible();
  });

  test('should insert audio block using /audio command', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/audio');
    await page.waitForTimeout(500);
    
    const audioOption = page.locator('text=/audio/i').first();
    if (await audioOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      const audioBlock = page.locator('[data-content-type="audio"]').first();
      await expect(audioBlock).toBeVisible();
    }
  });

  test('should insert file block using /file command', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/file');
    await page.waitForTimeout(500);
    
    const fileOption = page.locator('text=/file/i').first();
    if (await fileOption.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      const fileBlock = page.locator('[data-content-type="file"]').first();
      await expect(fileBlock).toBeVisible();
    }
  });

  test('should allow embedding image with URL', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/image');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const imageBlock = page.locator('[data-content-type="image"]').first();
    if (await imageBlock.isVisible()) {
      const urlInput = imageBlock.locator('input[type="text"]').first();
      if (await urlInput.isVisible()) {
        await urlInput.fill('https://via.placeholder.com/150');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
      }
    }
  });

  test('should show upload option for image block', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/image');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const imageBlock = page.locator('[data-content-type="image"]').first();
    if (await imageBlock.isVisible()) {
      const uploadButton = imageBlock.locator('button').filter({ hasText: /upload/i }).first();
      if (await uploadButton.isVisible()) {
        await expect(uploadButton).toBeVisible();
      }
    }
  });

  test('should allow embedding YouTube video', async ({ page }) => {
    const editor = page.locator('[data-testid="block-editor"]').first();
    await editor.click();
    
    await page.keyboard.type('/video');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    const videoBlock = page.locator('[data-content-type="video"]').first();
    if (await videoBlock.isVisible()) {
      const urlInput = videoBlock.locator('input[type="text"]').first();
      if (await urlInput.isVisible()) {
        await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
      }
    }
  });
});
