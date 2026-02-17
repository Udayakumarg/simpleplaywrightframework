import 'tsconfig-paths/register';
import { defineConfig, devices } from "@playwright/test";

const browserName = (process.env.BROWSER as "chromium" | "firefox" | "webkit") || "chromium";

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/*.ts"],   // ✅ only run TypeScript tests
  projects: [
    {
      name: browserName,
      // Run tests in headed mode
      use: {
        browserName,
        ...devices["Desktop Chrome"],
        headless: false,
        navigationTimeout: 20 * 1000,
      },
    },
  ],
});
