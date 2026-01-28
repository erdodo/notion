import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './src/app/__tests__/e2e',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: 1,
    reporter: 'html',

    use: {
        baseURL: 'http://127.0.0.1:3000',
        trace: 'on-first-retry',
        storageState: '.auth/user.json',
    },
    projects: [
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            dependencies: ['setup'],
        },
    ],
    webServer: {
        command: 'TEST_MODE=true npm run dev',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
    timeout: 10000,
});
