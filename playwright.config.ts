import { defineConfig, devices } from "@playwright/test";

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  expect: {
    timeout: 5_000,
  },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  outputDir: "test-results/playwright",
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 5"] },
    },
  ],
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : "list",
  retries: process.env.CI ? 2 : 0,
  testDir: "./tests/e2e",
  timeout: 20_000,
  use: {
    baseURL,
    channel: "chromium",
    headless: process.platform === "win32" ? false : undefined,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${port}`,
    cwd: "apps/web",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    url: baseURL,
  },
  workers: process.env.CI ? 2 : undefined,
});
