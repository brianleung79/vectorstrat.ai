import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/kbiacal/login');
  if (!page.url().includes('/login')) return;
  await page.fill('#email', process.env.TEST_EMAIL!);
  await page.fill('#password', process.env.TEST_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/kbiacal(?!\/login)/);
}

async function goToSetup(page: Page) {
  await login(page);
  await page.goto('/kbiacal/setup');
  await page.locator('h1:has-text("Family Setup")').waitFor({ timeout: 15000 });
}

test.describe('Family Setup', () => {
  test('setup page loads with Family Setup heading', async ({ page }) => {
    await goToSetup(page);
    await expect(page.locator('text=Family Setup')).toBeVisible();
    await expect(page.locator('text=Add your children')).toBeVisible();
  });

  test('add and remove a child', async ({ page }) => {
    await goToSetup(page);

    // Count initial children
    const initialCount = await page.locator('input[placeholder="Name"]').count();

    // Add a child
    await page.click('text=+ Add child');
    const newCount = await page.locator('input[placeholder="Name"]').count();
    expect(newCount).toBe(initialCount + 1);

    // Fill in the new child's name
    const lastNameInput = page.locator('input[placeholder="Name"]').last();
    await lastNameInput.fill('TempChild');

    // Remove the child we just added (click the last X button)
    const removeButtons = page.locator('[title="Remove"]');
    await removeButtons.last().click();

    // Count should be back to initial
    const afterRemoveCount = await page.locator('input[placeholder="Name"]').count();
    expect(afterRemoveCount).toBe(initialCount);
  });

  test('save children and reload persists them', async ({ page }) => {
    await goToSetup(page);

    // Ensure at least one child exists
    const childCount = await page.locator('input[placeholder="Name"]').count();
    if (childCount === 0) {
      await page.click('text=+ Add child');
      await page.locator('input[placeholder="Name"]').first().fill('TestChild');
      await page.locator('input[title="Age"]').first().fill('10');
    }

    // Get current child names
    const nameInputs = page.locator('input[placeholder="Name"]');
    const count = await nameInputs.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      names.push(await nameInputs.nth(i).inputValue());
    }

    // Save
    await page.click('text=Save & Continue');
    await page.waitForURL(/\/kbiacal/, { timeout: 30000 });

    // Go back to setup
    await goToSetup(page);

    // Verify same children are present
    const reloadedInputs = page.locator('input[placeholder="Name"]');
    const reloadedCount = await reloadedInputs.count();
    expect(reloadedCount).toBe(count);

    for (let i = 0; i < reloadedCount; i++) {
      expect(await reloadedInputs.nth(i).inputValue()).toBe(names[i]);
    }
  });

  test('setup page shows Family Sharing section', async ({ page }) => {
    await goToSetup(page);
    await expect(page.locator('text=Family Sharing')).toBeVisible();
    await expect(page.locator('text=Create Invite Link')).toBeVisible();
  });

  test('navigate from setup to scheduler', async ({ page }) => {
    await goToSetup(page);
    await page.click('text=Back to scheduler');
    await page.waitForURL(/\/kbiacal$/);
    await expect(page.locator('iframe[title="KBIACal Scheduler"]')).toBeVisible();
  });
});
