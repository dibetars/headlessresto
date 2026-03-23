import { test, expect } from '@playwright/test';

test('verify POS Terminal feature for owner', async ({ page }) => {
  // Login first
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test.admin@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Sign In")');
  await expect(page).toHaveURL(/\/dashboard/);

  // Navigate to POS Terminal
  // Find the POS Terminal link in the sidebar or navigate directly
  await page.goto('/dashboard/pos');

  // Verify POS Terminal content
  await expect(page.locator('h2:has-text("Ticket")')).toBeVisible();
  
  // Wait for loading to finish if there's a loading state
  // Based on the code, there's a 'loading' state but no explicit loading spinner shown in the snippet
  // Let's check for some UI elements that should be present
  // The categories might not be loaded yet if the DB is empty, but "Ticket" should be there
  
  // Check for search input
  await expect(page.locator('input[placeholder*="Search dishes, drinks, appetizers..."]')).toBeVisible();
});
