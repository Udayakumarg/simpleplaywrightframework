import 'tsconfig-paths/register';
import { defineConfig, devices } from "@playwright/test";

const browserName = (process.env.BROWSER as "chromium" | "firefox" | "webkit") || "chromium";

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/*.ts"],   // ✅ only run TypeScript tests
  projects: [
    {
      name: browserName,
      use: {
        browserName,
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
