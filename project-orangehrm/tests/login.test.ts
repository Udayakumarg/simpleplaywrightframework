import { test, expect } from "@framework/fixtures";

test("login with valid user", async ({ page, envConfig, td }) => {
  await page.fill('input[name="username"]', td.users.admin.username);
  await page.fill('input[name="password"]', td.users.admin.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
});


