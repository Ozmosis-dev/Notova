const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    const outputDir = path.join(process.cwd(), 'product_assets');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
        const timestamp = Date.now();
        const email = `demo_${timestamp}@example.com`;
        const password = 'Password123!';

        console.log(`Attempting signup with ${email}...`);
        // Navigate to signup
        await page.goto('http://localhost:3000/signup');
        await page.waitForLoadState('networkidle');

        // Fill signup form
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.fill('input[name="confirmPassword"]', password);

        await page.click('button[type="submit"]');

        // Wait for navigation to dashboard
        await page.waitForURL('http://localhost:3000/', { timeout: 15000 });
        console.log('Logged in successfully!');

        // 1. Desktop Screenshot
        console.log('Taking Desktop Screenshot...');
        await page.setViewportSize({ width: 1920, height: 1080 });
        // Wait for content to load properly
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(outputDir, 'desktop_dashboard.png'), fullPage: false });

        // 2. Mobile Screenshot
        console.log('Taking Mobile Screenshot...');
        // Create new context for mobile
        const iphone = devices['iPhone 13'];
        const mobileContext = await browser.newContext({
            ...iphone
        });
        // Copy cookies to maintain session
        const cookies = await context.cookies();
        await mobileContext.addCookies(cookies);

        const mobilePage = await mobileContext.newPage();
        await mobilePage.goto('http://localhost:3000/');
        await mobilePage.waitForLoadState('networkidle');
        await mobilePage.waitForTimeout(3000);
        await mobilePage.screenshot({ path: path.join(outputDir, 'mobile_dashboard.png') });

        await mobileContext.close();

        console.log('Screenshots saved.');

    } catch (error) {
        console.error('Error during capture:', error);
    } finally {
        await browser.close();
    }
})();
