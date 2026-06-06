import { test, expect } from "@project/fixtures";

test("login as admin @smoke", async ({ page, envConfig, td, loginPage, dashboardPage }) => {
  await page.goto(envConfig.baseUrl);
  await loginPage.signIn(td.users.admin.username, td.users.admin.password);
  await dashboardPage.expectLoaded();
});

test.skip("login as employee", async ({ page, envConfig, td, loginPage, dashboardPage }) => {
  await page.goto(envConfig.baseUrl);
  await loginPage.signIn(td.users.employee.username, td.users.employee.password);
  await dashboardPage.expectLoaded();
});
