import { test as setup, expect } from '@playwright/test';

setup('authenticate and ensure family exists', async ({ page }) => {
  // Login
  await page.goto('/kbiacal/login');
  await page.fill('#email', process.env.TEST_EMAIL!);
  await page.fill('#password', process.env.TEST_PASSWORD!);
  await page.click('button[type="submit"]');

  // Wait for redirect AWAY from login page specifically
  await page.waitForURL(url => {
    const path = new URL(url).pathname;
    return path.startsWith('/kbiacal') && path !== '/kbiacal/login';
  }, { timeout: 15000 });

  // If we landed on setup page, create a test child
  if (page.url().includes('/kbiacal/setup')) {
    await page.locator('h1:has-text("Family Setup")').waitFor({ timeout: 10000 });

    const existingChildren = await page.locator('input[placeholder="Name"]').count();

    if (existingChildren === 0) {
      await page.click('text=+ Add child');
      await page.locator('input[placeholder="Name"]').first().waitFor();
      await page.locator('input[placeholder="Name"]').first().fill('TestChild');
      // Age defaults to 5 from addChild(), which is valid

      await page.click('text=Save & Continue');
      await page.waitForURL(/\/kbiacal$/, { timeout: 15000 });
    }
  }
});
