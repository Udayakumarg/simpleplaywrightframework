import { test } from "@project/fixtures";
import { scenarioLoader, initAuthSession } from "simple-playwright-framework";
import { providerRegistry } from "@project/auth";

const scenarios = scenarioLoader(__filename);

test.describe.parallel("Login scenarios", () => {
  for (const sc of scenarios) {
    const tagSuffix = (sc.tags ?? []).map((t: string) => `@${t}`).join(" ");
    test(`${sc.name} ${tagSuffix}`.trim(), async ({ page, envConfig, loginPage, dashboardPage }) => {
      await page.goto(envConfig.baseUrl);

      await initAuthSession(
        page,
        envConfig.authStorage,
        { username: sc.username, password: sc.password },
        providerRegistry
      );

      if (sc.expected === "success") {
        await dashboardPage.expectLoaded();
      } else {
        await loginPage.expectLoginFailed();
      }
    });
  }
});
