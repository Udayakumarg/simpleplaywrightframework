import "tsconfig-paths/register";
import { defineConfig, devices } from "@playwright/test";

const browserName =
  (process.env.BROWSER as "chromium" | "firefox" | "webkit") || "chromium";

export default defineConfig({
  workers: 1,
  testDir: "./tests",
  testMatch: ["**/*.spec.ts", "**/*.test.ts"],
  reporter: [["html", { open: "never" }]], 
  projects: [
    {
      name: browserName,
      // Run tests in headed mode
      use: {
        browserName,
        ...devices["Desktop Chrome"],
        headless: false,
        navigationTimeout: 60 * 1000,
        actionTimeout: 10 * 1000,
      },
    },
  ],
});
