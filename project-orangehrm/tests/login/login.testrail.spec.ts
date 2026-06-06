import { test } from "@project/fixtures";

test.skip("Login linked to TestRail case C1234", async ({
  page, envConfig, td, loginPage, dashboardPage, testrail,
}) => {
  await page.goto(envConfig.baseUrl);
  await loginPage.signIn(td.users.admin.username, td.users.admin.password);

  try {
    await dashboardPage.expectLoaded();
    await testrail.addResult(1234, 1, "Login passed");
  } catch (err) {
    await testrail.addResult(1234, 5, `Login failed: ${(err as Error).message}`);
    throw err;
  }
});
