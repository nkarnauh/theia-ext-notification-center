import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    testMatch: '**/*.spec.ts',
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    workers: 1,
    retries: process.env.CI ? 1 : 0,
    timeout: 90_000,
    expect: {
        timeout: 10_000
    },
    use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
        screenshot: 'only-on-failure',
        viewport: { width: 1920, height: 1080 }
    },
    webServer: {
        command: 'npm run start:browser',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 180_000
    }
});
