import { test, expect, initAuthSession } from "@framework";
import { providerRegistry } from "@project/auth"; // project registry

test("login with valid Admin user with Auth Storage @smoke @dryrun", async ({
  page,
  envConfig,
  td,
}) => {
  console.log("Base URL is", envConfig.baseUrl);

  // Navigate to base URL
  await page.goto(envConfig.baseUrl);

  console.log("Logging in with user", td.users.admin.username);
  console.log("Logging in with password", td.users.admin.password);
  // Initialize auth session using config (authStorage.provider)
  await initAuthSession(
    page,
    envConfig.authStorage!,
    { username: td.users.admin.username, password: td.users.admin.password },
    providerRegistry,
  );

  // Verify we landed on dashboard
  await expect(page).toHaveURL(/dashboard/);
});
