import { test } from "@project/fixtures";
import { initAuthSession } from "simple-playwright-framework";
import { providerRegistry } from "@project/auth";

test("login as admin with auth storage @smoke", async ({ page, envConfig, td, dashboardPage }) => {
  await page.goto(envConfig.baseUrl);

  await initAuthSession(
    page,
    envConfig.authStorage,
    { username: td.users.admin.username, password: td.users.admin.password },
    providerRegistry
  );

  await dashboardPage.expectLoaded();
});
