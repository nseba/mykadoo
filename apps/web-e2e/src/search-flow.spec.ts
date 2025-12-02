/**
 * Gift Search E2E Tests
 * 
 * End-to-end tests for the complete gift search user journey
 */

import { test, expect } from '@playwright/test';

test.describe('Gift Search Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete a successful gift search', async ({ page }) => {
    // Navigate to search page
    await page.click('text=Find Gifts');
    await expect(page).toHaveURL('/search');

    // Fill out search form
    await page.selectOption('[name="occasion"]', 'birthday');
    await page.selectOption('[name="relationship"]', 'friend');
    await page.selectOption('[name="ageRange"]', 'young-adult');
    
    // Set budget
    await page.fill('[name="budgetMin"]', '50');
    await page.fill('[name="budgetMax"]', '100');
    
    // Add interests
    await page.fill('[name="interests"]', 'gaming, tech, music');
    
    // Submit search
    await page.click('button[type="submit"]');
    
    // Wait for results to load
    await page.waitForSelector('[data-testid="gift-card"]', { timeout: 5000 });
    
    // Verify results are displayed
    const giftCards = await page.locator('[data-testid="gift-card"]').count();
    expect(giftCards).toBeGreaterThanOrEqual(1);
    expect(giftCards).toBeLessThanOrEqual(10);
    
    // Verify each card has required information
    const firstCard = page.locator('[data-testid="gift-card"]').first();
    await expect(firstCard.locator('[data-testid="product-name"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="match-reason"]')).toBeVisible();
  });

  test('should filter search results', async ({ page }) => {
    // Perform initial search
    await page.goto('/search?occasion=birthday&budgetMin=0&budgetMax=200');
    await page.waitForSelector('[data-testid="gift-card"]');
    
    const initialCount = await page.locator('[data-testid="gift-card"]').count();
    
    // Apply price filter
    await page.fill('[data-testid="filter-min-price"]', '100');
    await page.fill('[data-testid="filter-max-price"]', '150');
    await page.click('[data-testid="apply-filters"]');
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    const filteredCount = await page.locator('[data-testid="gift-card"]').count();
    
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    // Verify filtered prices
    const prices = await page.locator('[data-testid="product-price"]').allTextContents();
    prices.forEach((priceText) => {
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      expect(price).toBeGreaterThanOrEqual(100);
      expect(price).toBeLessThanOrEqual(150);
    });
  });

  test('should save a gift to favorites (authenticated)', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    
    // Go to search
    await page.goto('/search?occasion=birthday&budgetMin=50&budgetMax=100');
    await page.waitForSelector('[data-testid="gift-card"]');
    
    // Save first gift
    await page.locator('[data-testid="save-button"]').first().click();
    
    // Verify save confirmation
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="toast-success"]')).toContainText('Saved');
    
    // Navigate to favorites
    await page.click('[data-testid="nav-favorites"]');
    await expect(page).toHaveURL('/favorites');
    
    // Verify saved gift appears
    await expect(page.locator('[data-testid="gift-card"]').first()).toBeVisible();
  });

  test('should rate a gift suggestion', async ({ page }) => {
    await page.goto('/search?occasion=birthday&budgetMin=50&budgetMax=100');
    await page.waitForSelector('[data-testid="gift-card"]');
    
    // Rate first gift with 5 stars
    const firstCard = page.locator('[data-testid="gift-card"]').first();
    await firstCard.locator('[data-testid="rating-star-5"]').click();
    
    // Verify rating is saved
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    
    // Verify visual feedback
    const stars = firstCard.locator('[data-testid^="rating-star-"]');
    const filledStars = await stars.filter({ hasClass: 'filled' }).count();
    expect(filledStars).toBe(5);
  });

  test('should display loading state during search', async ({ page }) => {
    await page.goto('/search');
    
    // Fill and submit form
    await page.selectOption('[name="occasion"]', 'birthday');
    await page.selectOption('[name="relationship"]', 'friend');
    await page.fill('[name="budgetMin"]', '50');
    await page.fill('[name="budgetMax"]', '100');
    
    // Start search
    await page.click('button[type="submit"]');
    
    // Verify loading state appears
    await expect(page.locator('[data-testid="loading"]')).toBeVisible();
    
    // Verify loading disappears when results load
    await page.waitForSelector('[data-testid="gift-card"]');
    await expect(page.locator('[data-testid="loading"]')).not.toBeVisible();
  });

  test('should handle validation errors', async ({ page }) => {
    await page.goto('/search');
    
    // Submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="error-occasion"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-relationship"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-budget"]')).toBeVisible();
  });
});

test.describe('Mobile Gift Search', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    isMobile: true,
  });

  test('should work on mobile devices', async ({ page }) => {
    await page.goto('/search');
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Fill search form
    await page.selectOption('[name="occasion"]', 'birthday');
    await page.selectOption('[name="relationship"]', 'friend');
    await page.fill('[name="budgetMin"]', '50');
    await page.fill('[name="budgetMax"]', '100');
    await page.click('button[type="submit"]');
    
    // Verify results display correctly on mobile
    await page.waitForSelector('[data-testid="gift-card"]');
    const cards = page.locator('[data-testid="gift-card"]');
    
    // Verify cards are stacked vertically (one per row)
    const firstCard = cards.first();
    const secondCard = cards.nth(1);
    
    const firstBox = await firstCard.boundingBox();
    const secondBox = await secondCard.boundingBox();
    
    expect(secondBox!.y).toBeGreaterThan(firstBox!.y + firstBox!.height);
  });
});

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/search');
    
    // Tab through form
    await page.keyboard.press('Tab'); // Occasion
    await page.keyboard.press('Tab'); // Relationship
    await page.keyboard.press('Tab'); // Age range
    await page.keyboard.press('Tab'); // Budget min
    await page.keyboard.press('Tab'); // Budget max
    await page.keyboard.press('Tab'); // Interests
    await page.keyboard.press('Tab'); // Submit button
    
    // Verify submit button has focus
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeFocused();
    
    // Submit with Enter key
    await page.keyboard.press('Enter');
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/search');
    
    // Verify form has proper labels
    await expect(page.locator('[aria-label="Occasion"]')).toBeVisible();
    await expect(page.locator('[aria-label="Relationship"]')).toBeVisible();
    await expect(page.locator('[aria-label="Budget minimum"]')).toBeVisible();
    await expect(page.locator('[aria-label="Budget maximum"]')).toBeVisible();
  });
});
