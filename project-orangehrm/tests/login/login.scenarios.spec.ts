import { test, expect, scenarioLoader, initAuthSession } from "@framework";
import { providerRegistry } from "@project/auth"; // project registry

const scenarios = scenarioLoader(__filename);

test.describe.parallel("Login scenarios", () => {
  for (const sc of scenarios) {
    const tags = (sc.tags ?? []).map((t) => `@${t}`).join(" ");
    test(`Scenario: ${sc.name} ${tags}`, async ({ page, envConfig }) => {
      await page.goto(envConfig.baseUrl);

      await initAuthSession(
        page,
        envConfig.authStorage!,
        { username: sc.username, password: sc.password },
        providerRegistry,
      );

      if (sc.expected === "success") {
        await expect(page).toHaveURL(/.*dashboard.*/);
      } else {
        await expect(page.locator(".oxd-alert-content")).toBeVisible();
      }
    });
  }
});
