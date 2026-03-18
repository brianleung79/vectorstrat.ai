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

  // Ensure we're on setup page to verify children
  if (!page.url().includes('/kbiacal/setup')) {
    await page.goto('/kbiacal/setup');
  }
  await page.locator('h1:has-text("Family Setup")').waitFor({ timeout: 10000 });

  const existingChildren = await page.locator('input[placeholder="Name"]').count();

  if (existingChildren < 2) {
    // Ensure first child exists
    if (existingChildren === 0) {
      await page.click('text=+ Add child');
      await page.locator('input[placeholder="Name"]').first().waitFor();
      await page.locator('input[placeholder="Name"]').first().fill('TestChild');
    }
    // Add second child
    await page.click('text=+ Add child');
    const nameInputs = page.locator('input[placeholder="Name"]');
    await nameInputs.last().fill('TestChild2');
  }

  await page.click('text=Save & Continue');
  await page.waitForURL(/\/kbiacal$/, { timeout: 15000 });
});
