import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login with valid credentials redirects to scheduler', async ({ page }) => {
    // Clear auth state for this test
    await page.context().clearCookies();

    await page.goto('/kbiacal/login');
    await page.fill('#email', process.env.TEST_EMAIL!);
    await page.fill('#password', process.env.TEST_PASSWORD!);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/kbiacal(?:\/setup)?$/);
    // Should land on either /kbiacal or /kbiacal/setup (both are valid post-login)
    expect(page.url()).toMatch(/\/kbiacal/);
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto('/kbiacal/login');
    await page.fill('#email', process.env.TEST_EMAIL!);
    await page.fill('#password', 'wrongpassword123');
    await page.click('button[type="submit"]');

    // Error message should appear
    const error = page.locator('.text-red-300');
    await expect(error).toBeVisible({ timeout: 10000 });
    await expect(error).toContainText(/invalid|credentials|password/i);
  });

  test('unauthenticated visit to /kbiacal redirects to login', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto('/kbiacal');
    await page.waitForURL(/\/kbiacal\/login/);
    expect(page.url()).toContain('/kbiacal/login');
  });

  test('unauthenticated visit to /kbiacal/setup redirects to login', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto('/kbiacal/setup');
    await page.waitForURL(/\/kbiacal\/login/);
    expect(page.url()).toContain('/kbiacal/login');
  });

  test('sign out redirects to login', async ({ page }) => {
    // Login first
    await page.goto('/kbiacal/login');
    await page.fill('#email', process.env.TEST_EMAIL!);
    await page.fill('#password', process.env.TEST_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(url => {
      const path = new URL(url).pathname;
      return path.startsWith('/kbiacal') && path !== '/kbiacal/login';
    }, { timeout: 15000 });

    // Go to setup page which has a Sign out button
    await page.goto('/kbiacal/setup');
    await page.locator('text=Sign out').waitFor({ timeout: 15000 });

    // Click sign out button
    await page.click('text=Sign out');

    await page.waitForURL(/\/kbiacal\/login/, { timeout: 15000 });
    expect(page.url()).toContain('/kbiacal/login');
  });

  test('unauthenticated API calls return 401 or redirect', async ({ request }) => {
    // /api/schedule should fail without auth
    const scheduleRes = await request.get('/api/schedule');
    expect([401, 403]).toContain(scheduleRes.status());

    // /api/family should fail without auth
    const familyRes = await request.get('/api/family');
    expect([401, 403]).toContain(familyRes.status());
  });
});
