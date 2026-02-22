import { test, expect } from "@framework";

test("login with valid Admin user @smoke @dryrun", async ({ page, envConfig, td }) => {
  console.log("Base URL is", envConfig.baseUrl);
  await page.goto(envConfig.baseUrl);
  await page.fill('input[name="username"]', td.users.admin.username);
  await page.fill('input[name="password"]', td.users.admin.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
});


test.skip("login with valid Employee user", async ({ page, envConfig, td }) => {
  await page.goto(envConfig.baseUrl);
  await page.fill('input[name="username"]', td.users.employee.username);
  await page.fill('input[name="password"]', td.users.employee.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
});
