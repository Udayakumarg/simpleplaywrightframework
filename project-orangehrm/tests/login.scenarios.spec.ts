import { test, expect, scenarioLoader } from "@framework";
import { providerRegistry } from "@project/auth"; // project registry
import { initAuthSession } from "@framework/utils/auth-storage";


const scenarios = scenarioLoader(__filename);

test.describe.parallel("Login scenarios", () => {
  for (const sc of scenarios) {
    test(`Scenario: ${sc.name}`, async ({ page, envConfig }) => {
      await page.goto(envConfig.baseUrl);

      await initAuthSession( page, envConfig.authStorage!, { username: sc.username, password: sc.password }, providerRegistry );
      
      if (sc.expected === "success") {
        await expect(page).toHaveURL("**/dashboard");
      } else {
        await expect(page.locator(".oxd-alert-content")).toBeVisible();
      }
    });
  }
});
