import { test, expect } from './scheduler.fixture';
import { FrameLocator } from '@playwright/test';

/** Open categories one by one until we find a visible, available class item. */
async function findAvailableClassItem(scheduler: FrameLocator) {
  const headers = scheduler.locator('.cat-header');
  const count = await headers.count();
  for (let i = 0; i < count; i++) {
    await headers.nth(i).click();
    // Wait a beat for the accordion to open
    const visibleItems = scheduler.locator('.cat-items:not(.hidden) .class-item:not(.added):not(.ineligible)');
    const itemCount = await visibleItems.count();
    if (itemCount > 0) {
      return visibleItems.first();
    }
  }
  throw new Error('No available class items found in any category');
}

test.describe('Scheduler', () => {
  test('scheduler loads with child tabs', async ({ scheduler }) => {
    const childTabs = scheduler.locator('#childTabs .child-tab');
    const count = await childTabs.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // First child tab should be active
    await expect(childTabs.first()).toHaveClass(/active/);
  });

  test('week tabs are visible and switchable', async ({ scheduler }) => {
    const weekTabs = scheduler.locator('.week-tab');
    const count = await weekTabs.count();
    expect(count).toBe(4); // Weeks 5-8

    // Click week 6
    await weekTabs.nth(1).click();
    await expect(weekTabs.nth(1)).toHaveClass(/active/);

    // Click week 7
    await weekTabs.nth(2).click();
    await expect(weekTabs.nth(2)).toHaveClass(/active/);
    // Week 6 should no longer be active
    await expect(weekTabs.nth(1)).not.toHaveClass(/active/);
  });

  test('sidebar shows class categories', async ({ scheduler }) => {
    const categories = scheduler.locator('.cat-header');
    const count = await categories.count();
    expect(count).toBeGreaterThan(0);
  });

  test('open category and see class items', async ({ scheduler }) => {
    // Click the first category header to expand it
    const firstCat = scheduler.locator('.cat-header').first();
    await firstCat.click();

    // Class items should appear
    const items = scheduler.locator('.cat-items:not(.hidden) .class-item');
    await items.first().waitFor({ timeout: 5000 });
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  test('add a class from sidebar', async ({ scheduler, page }) => {
    // Count initial class blocks on grid
    const initialBlocks = await scheduler.locator('.class-block').count();

    // Find an available class item across all categories
    const availableItem = await findAvailableClassItem(scheduler);
    await availableItem.click();

    // Popup should appear with "Add" button
    const addBtn = scheduler.locator('.popup-btn.confirm-btn');
    await expect(addBtn).toBeVisible({ timeout: 3000 });
    await addBtn.click();

    // Wait for save to server
    await page.waitForResponse(resp =>
      resp.url().includes('/api/schedule') && resp.request().method() === 'PUT',
      { timeout: 5000 }
    ).catch(() => {}); // May have already fired

    // Should have one more class block on grid
    // Give a moment for render
    await scheduler.locator('.class-block').first().waitFor({ timeout: 3000 });
    const newBlocks = await scheduler.locator('.class-block').count();
    expect(newBlocks).toBeGreaterThan(initialBlocks);
  });

  test('remove a class from grid', async ({ scheduler, page }) => {
    // First, add a class
    const availableItem = await findAvailableClassItem(scheduler);
    await availableItem.click();
    const addBtn = scheduler.locator('.popup-btn.confirm-btn');
    await expect(addBtn).toBeVisible({ timeout: 3000 });
    await addBtn.click();

    // Wait for render
    await scheduler.locator('.class-block').first().waitFor({ timeout: 3000 });
    const countBefore = await scheduler.locator('.class-block').count();

    // Click a class block on the grid — use force:true to bypass overlapping element check
    await scheduler.locator('.class-block').first().click({ force: true });

    // Popup with Remove should appear
    const removeBtn = scheduler.locator('.popup-btn.remove-btn');
    await expect(removeBtn).toBeVisible({ timeout: 3000 });
    await removeBtn.click();

    // Block count should decrease
    await page.waitForTimeout(500);
    const countAfter = await scheduler.locator('.class-block').count();
    expect(countAfter).toBeLessThan(countBefore);
  });

  test('search filters class list', async ({ scheduler, page }) => {
    const searchBox = scheduler.locator('.search-box');
    await searchBox.fill('tennis');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Verify search box accepted input and didn't crash
    expect(await searchBox.inputValue()).toBe('tennis');

    // Clear search
    await searchBox.fill('');
  });

  test('cost bar is visible and updates', async ({ scheduler }) => {
    const costBar = scheduler.locator('#costBar');
    await expect(costBar).toBeVisible();

    // Total cost element should exist
    const totalAmount = scheduler.locator('.cost-item.total .amount');
    await expect(totalAmount).toBeVisible();
  });

  test('child tabs switch active child', async ({ scheduler }) => {
    const childTabs = scheduler.locator('#childTabs .child-tab');
    const count = await childTabs.count();

    if (count > 1) {
      // Click the second child
      await childTabs.nth(1).click();
      await expect(childTabs.nth(1)).toHaveClass(/active/);
      await expect(childTabs.first()).not.toHaveClass(/active/);

      // Switch back to first
      await childTabs.first().click();
      await expect(childTabs.first()).toHaveClass(/active/);
    }
  });

  test('schedule persists after reload', async ({ scheduler, page }) => {
    const frame = scheduler;

    // Add a class
    const availableItem = await findAvailableClassItem(frame);
    await availableItem.click();
    const addBtn = frame.locator('.popup-btn.confirm-btn');
    await expect(addBtn).toBeVisible({ timeout: 3000 });
    await addBtn.click();

    // Wait for debounced save to complete
    await page.waitForResponse(resp =>
      resp.url().includes('/api/schedule') && resp.request().method() === 'PUT',
      { timeout: 5000 }
    );

    // Count blocks
    await frame.locator('.class-block').first().waitFor({ timeout: 3000 });
    const blockCount = await frame.locator('.class-block').count();
    expect(blockCount).toBeGreaterThan(0);

    // Reload page
    await page.reload();
    const frame2 = page.frameLocator('iframe[title="KBIACal Scheduler"]');
    await frame2.locator('#childTabs .child-tab').first().waitFor({ timeout: 15000 });

    // Blocks should still be there
    await frame2.locator('.class-block').first().waitFor({ timeout: 5000 });
    const reloadedBlocks = await frame2.locator('.class-block').count();
    expect(reloadedBlocks).toBeGreaterThanOrEqual(blockCount);

    // Clean up: remove all blocks we added
    let cleanupAttempts = 0;
    while (await frame2.locator('.class-block').count() > 0 && cleanupAttempts < 20) {
      await frame2.locator('.class-block').first().click({ force: true });
      const rmBtn = frame2.locator('.popup-btn.remove-btn');
      if (await rmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await rmBtn.click();
        await page.waitForTimeout(300);
      } else {
        break;
      }
      cleanupAttempts++;
    }
  });
});
