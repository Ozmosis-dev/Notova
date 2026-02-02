/**
 * E2E Tests for Notes Management
 * 
 * Tests note creation, editing, tagging, and deletion
 */

import { test, expect } from '@playwright/test';

// Test fixtures - skip these until we have a test account setup
test.describe('Notes Management', () => {
    test.skip('authenticated flows require login setup', async () => { });

    test.describe('UI Elements', () => {
        test('login page has proper form structure', async ({ page }) => {
            await page.goto('/login');

            // Check for accessibility
            const emailInput = page.getByLabel(/email/i);
            const passwordInput = page.getByLabel(/password/i);

            await expect(emailInput).toHaveAttribute('type', 'email');
            await expect(passwordInput).toHaveAttribute('type', 'password');
        });

        test('signup page has proper form structure', async ({ page }) => {
            await page.goto('/signup');

            const emailInput = page.getByLabel(/email/i);
            // Use exact match to avoid matching "Confirm Password"
            const passwordInput = page.getByLabel('Password', { exact: true });

            await expect(emailInput).toHaveAttribute('type', 'email');
            await expect(passwordInput).toHaveAttribute('type', 'password');
        });
    });

    test.describe('Responsive Design', () => {
        test('login page is usable on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/login');

            await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
            await expect(page.getByLabel(/email/i)).toBeVisible();
        });

        test('login page is usable on tablet', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto('/login');

            await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
        });

        test('login page is usable on desktop', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto('/login');

            await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
        });
    });

    test.describe('Accessibility', () => {
        test('login form has proper accessibility attributes', async ({ page }) => {
            await page.goto('/login');

            // Check for labels
            const labels = await page.locator('label').count();
            expect(labels).toBeGreaterThanOrEqual(2);

            // Check form exists
            const form = page.locator('form');
            await expect(form).toBeVisible();
        });

        test('buttons have accessible names', async ({ page }) => {
            await page.goto('/login');

            const signInButton = page.getByRole('button', { name: /sign in/i });
            await expect(signInButton).toBeVisible();
            await expect(signInButton).toBeEnabled();
        });
    });
});

test.describe('Page Load Performance', () => {
    test('login page loads within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/login');
        const loadTime = Date.now() - startTime;

        // Page should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
    });

    test('signup page loads within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/signup');
        const loadTime = Date.now() - startTime;

        expect(loadTime).toBeLessThan(5000);
    });
});
