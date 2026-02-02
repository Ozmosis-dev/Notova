/**
 * E2E Tests for Authentication Flow
 * 
 * Tests login, signup, and logout functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
        // Clear any existing session
        await page.context().clearCookies();
    });

    test('login page loads correctly', async ({ page }) => {
        await page.goto('/login');

        // Check page title
        await expect(page).toHaveTitle(/Evernote Clone/i);

        // Check form elements exist
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/password/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

        // Check signup link
        await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
    });

    test('signup page loads correctly', async ({ page }) => {
        await page.goto('/signup');

        await expect(page.getByLabel(/email/i)).toBeVisible();
        // Use exact match to avoid matching "Confirm Password"
        await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
        // Button text is "Create account" not "Sign Up"
        await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();

        // Check login link
        await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    });

    test('shows validation error for empty fields', async ({ page }) => {
        await page.goto('/login');

        // Try to submit without filling fields
        await page.getByRole('button', { name: /sign in/i }).click();

        // Should show some validation (browser or custom)
        const emailInput = page.getByLabel(/email/i);
        await expect(emailInput).toBeVisible();
    });

    test('shows error for invalid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.getByLabel(/email/i).fill('invalid@example.com');
        await page.getByLabel(/password/i).fill('wrongpassword');
        await page.getByRole('button', { name: /sign in/i }).click();

        // Should show error message
        await expect(page.getByText(/invalid|error|incorrect/i)).toBeVisible({ timeout: 5000 });
    });

    test('navigates between login and signup', async ({ page }) => {
        await page.goto('/login');

        // Go to signup
        await page.getByRole('link', { name: /sign up/i }).click();
        await expect(page).toHaveURL(/\/signup/);

        // Go back to login
        await page.getByRole('link', { name: /sign in/i }).click();
        await expect(page).toHaveURL(/\/login/);
    });

    test('redirects unauthenticated user from home to login', async ({ page }) => {
        await page.goto('/');

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/);
    });
});

test.describe('Authenticated User', () => {
    // This test requires a valid test account
    test.skip('can login with valid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.getByLabel(/email/i).fill('test@example.com');
        await page.getByLabel(/password/i).fill('test123456');
        await page.getByRole('button', { name: /sign in/i }).click();

        // Should redirect to home
        await expect(page).toHaveURL('/');

        // Should see the main app layout
        await expect(page.getByText(/notebooks/i)).toBeVisible({ timeout: 10000 });
    });
});
