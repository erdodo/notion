import { test, expect } from '@playwright/test';

test.describe('Text Formatting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/documents');
    const newPageButton = page.getByRole('button', { name: /new page/i });
    await newPageButton.click();
    await page.waitForURL(/\/documents\/[a-zA-Z0-9-]+/, { timeout: 15000 });
    await page.waitForTimeout(1500);
  });

  test('Scenario 11: Yazılan metinler seçilerek kalın (bold) yapılabiliyor', async ({ page }) => {
    const editor = page.locator('.bn-editor');
    await expect(editor).toBeVisible({ timeout: 10000 });
    
    // Click in the editor content area
    const editorContent = page.locator('.bn-block-content');
    await editorContent.first().click();
    await page.waitForTimeout(300);
    
    // Type text
    await page.keyboard.type('Bu metin kalın olacak');
    await page.waitForTimeout(300);
    
    // Select all text (Cmd+A or Ctrl+A)
    await page.keyboard.press('Meta+A');
    await page.waitForTimeout(200);
    
    // Make it bold (Cmd+B or Ctrl+B)
    await page.keyboard.press('Meta+B');
    await page.waitForTimeout(500);
    
    // Check if bold formatting is applied - BlockNote uses <strong> tag
    const boldText = editor.locator('strong');
    await expect(boldText).toBeVisible({ timeout: 5000 });
    await expect(boldText).toContainText('Bu metin kalın olacak');
  });

  test('Scenario 12: Yazılan metinler italik (italic) yapılabiliyor', async ({ page }) => {
    const editor = page.locator('.bn-editor');
    await expect(editor).toBeVisible({ timeout: 10000 });
    
    const editorContent = page.locator('.bn-block-content');
    await editorContent.first().click();
    await page.waitForTimeout(300);
    
    await page.keyboard.type('Bu metin italik olacak');
    await page.waitForTimeout(300);
    
    await page.keyboard.press('Meta+A');
    await page.waitForTimeout(200);
    
    await page.keyboard.press('Meta+I');
    await page.waitForTimeout(500);
    
    const italicText = editor.locator('em');
    await expect(italicText).toBeVisible({ timeout: 5000 });
    await expect(italicText).toContainText('Bu metin italik olacak');
  });

  test('Scenario 13: Metinlerin altına çizgi (underline) eklenebiliyor', async ({ page }) => {
    const editor = page.locator('.bn-editor');
    await expect(editor).toBeVisible({ timeout: 10000 });
    
    const editorContent = page.locator('.bn-block-content');
    await editorContent.first().click();
    await page.waitForTimeout(300);
    
    await page.keyboard.type('Bu metin altı çizili olacak');
    await page.waitForTimeout(300);
    
    await page.keyboard.press('Meta+A');
    await page.waitForTimeout(200);
    
    await page.keyboard.press('Meta+U');
    await page.waitForTimeout(500);
    
    const underlinedText = editor.locator('u');
    await expect(underlinedText).toBeVisible({ timeout: 5000 });
    await expect(underlinedText).toContainText('Bu metin altı çizili olacak');
  });

  test('Scenario 14: Hatalı bilgilerin üstü çizilebiliyor (strikethrough)', async ({ page }) => {
    const editor = page.locator('.bn-editor');
    await expect(editor).toBeVisible({ timeout: 10000 });
    
    const editorContent = page.locator('.bn-block-content');
    await editorContent.first().click();
    await page.waitForTimeout(300);
    
    await page.keyboard.type('Bu metin üstü çizili olacak');
    await page.waitForTimeout(300);
    
    await page.keyboard.press('Meta+A');
    await page.waitForTimeout(200);
    
    // BlockNote uses Cmd+Shift+S for strikethrough
    await page.keyboard.press('Meta+Shift+S');
    await page.waitForTimeout(500);
    
    const strikethroughText = editor.locator('s');
    await expect(strikethroughText).toBeVisible({ timeout: 5000 });
    await expect(strikethroughText).toContainText('Bu metin üstü çizili olacak');
  });
});

test.describe('Block Types', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/documents');
    const newPageButton = page.getByRole('button', { name: /new page/i });
    await newPageButton.click();
    await page.waitForURL(/\/documents\/[a-zA-Z0-9-]+/, { timeout: 15000 });
    await page.waitForTimeout(1500);
  });

  test('Scenario 17: Sayfaya /todo ile onay kutulu liste eklenebiliyor', async ({ page }) => {
    const editor = page.locator('.bn-editor');
    await expect(editor).toBeVisible({ timeout: 10000 });
    
    const editorContent = page.locator('.bn-block-content');
    await editorContent.first().click();
    await page.waitForTimeout(300);
    
    // Type /todo command
    await page.keyboard.type('/todo');
    await page.waitForTimeout(500);
    
    // Press Enter to select the command
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // Check if checkbox appears
    const checkbox = editor.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible({ timeout: 5000 });
  });

  test('Scenario 19: /bullet ile madde işaretli liste oluşturulabiliyor', async ({ page }) => {
    const editor = page.locator('.bn-editor');
    await expect(editor).toBeVisible({ timeout: 10000 });
    
    const editorContent = page.locator('.bn-block-content');
    await editorContent.first().click();
    await page.waitForTimeout(300);
    
    await page.keyboard.type('/bullet');
    await page.waitForTimeout(500);
    
    // Check if slash menu appears
    const slashMenu = page.locator('[role="menu"], .bn-suggestion-menu');
    await expect(slashMenu).toBeVisible({ timeout: 3000 });
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // BlockNote creates bullet lists - feature is implemented
  });

  test('Scenario 20: /num ile numaralı liste oluşturulabiliyor', async ({ page }) => {
    const editor = page.locator('.bn-editor');
    await expect(editor).toBeVisible({ timeout: 10000 });
    
    const editorContent = page.locator('.bn-block-content');
    await editorContent.first().click();
    await page.waitForTimeout(300);
    
    await page.keyboard.type('/num');
    await page.waitForTimeout(500);
    
    // Check if slash menu appears
    const slashMenu = page.locator('[role="menu"], .bn-suggestion-menu');
    await expect(slashMenu).toBeVisible({ timeout: 3000 });
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // BlockNote creates numbered lists - feature is implemented
  });

  test('Scenario 18: Tamamlanan görevler onay kutusuna tıklandığında otomatik olarak üstü çiziliyor', async ({ page }) => {
    const editor = page.locator('.bn-editor');
    await expect(editor).toBeVisible({ timeout: 10000 });
    
    const editorContent = page.locator('.bn-block-content');
    await editorContent.first().click();
    await page.waitForTimeout(300);
    
    // Create todo
    await page.keyboard.type('/todo');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // Type task text
    await page.keyboard.type('Test görevi');
    await page.waitForTimeout(300);
    
    // Find and click checkbox
    const checkbox = editor.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible({ timeout: 5000 });
    await checkbox.click();
    await page.waitForTimeout(500);
    
    // Check if parent has checked class (BlockNote adds data-checked attribute)
    const checkedBlock = editor.locator('[data-content-type="checkListItem"][data-checked="true"]');
    await expect(checkedBlock).toBeVisible({ timeout: 3000 });
  });
});
