import { test as base, FrameLocator, expect, Page } from '@playwright/test';

async function loginAndEnsureChildren(page: Page) {
  // Go to login
  await page.goto('/kbiacal/login');

  // If already logged in (middleware redirected us away), skip login
  if (page.url().includes('/login')) {
    await page.fill('#email', process.env.TEST_EMAIL!);
    await page.fill('#password', process.env.TEST_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(url => {
      const path = new URL(url).pathname;
      return path.startsWith('/kbiacal') && path !== '/kbiacal/login';
    }, { timeout: 15000 });
  }

  // If on setup page, ensure children exist before going to scheduler
  if (page.url().includes('/kbiacal/setup')) {
    await page.locator('h1:has-text("Family Setup")').waitFor({ timeout: 10000 });

    const existingChildren = await page.locator('input[placeholder="Name"]').count();
    if (existingChildren < 2) {
      if (existingChildren === 0) {
        await page.click('text=+ Add child');
        await page.locator('input[placeholder="Name"]').first().waitFor();
        await page.locator('input[placeholder="Name"]').first().fill('TestChild');
      }
      await page.click('text=+ Add child');
      const nameInputs = page.locator('input[placeholder="Name"]');
      await nameInputs.last().fill('TestChild2');
    }

    await page.click('text=Save & Continue');
    await page.waitForURL(/\/kbiacal$/, { timeout: 15000 });
  }

  // Now we should be on /kbiacal with the scheduler
  if (!page.url().endsWith('/kbiacal')) {
    await page.goto('/kbiacal');
  }
}

type SchedulerFixtures = {
  scheduler: FrameLocator;
};

export const test = base.extend<SchedulerFixtures>({
  scheduler: async ({ page }, use) => {
    await loginAndEnsureChildren(page);

    const frame = page.frameLocator('iframe[title="KBIACal Scheduler"]');

    // Wait for initApp() to complete — child tabs are generated after family data loads
    await frame.locator('#childTabs .child-tab').first().waitFor({ timeout: 30000 });

    await use(frame);
  },
});

export { expect };
