import { test, expect } from '@playwright/test';

test('login as test admin', async ({ page }) => {
  await page.goto('/login');

  // Fill in login details
  await page.fill('input[name="email"]', 'test.admin@example.com');
  await page.fill('input[name="password"]', 'password123'); // Assuming password is password123 as it's common for test setups

  // Click sign in button
  await page.click('button:has-text("Sign In")');

  // Check if we are redirected to the dashboard
  await expect(page).toHaveURL(/\/dashboard/);
  
  // Verify dashboard content for owner role
  await expect(page.locator('text=Dashboard')).toBeVisible();
});
