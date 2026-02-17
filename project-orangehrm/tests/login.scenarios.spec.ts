import { test, expect, scenarioLoader } from "@framework/fixtures";

const scenarios = scenarioLoader(__filename);

test.describe.parallel("Login scenarios", () => {
  for (const sc of scenarios) {
    test(`Scenario: ${sc.name}`, async ({ page, envConfig }) => {
      await page.goto(envConfig.baseUrl);
      await page.fill('input[name="username"]', sc.username);
      await page.fill('input[name="password"]', sc.password);
      await page.click('button[type="submit"]');

      if (sc.expected === "success") {
        await expect(page).toHaveURL(/dashboard/);
      } else {
        await expect(page.locator(".oxd-alert-content")).toBeVisible();
      }
    });
  }
});
