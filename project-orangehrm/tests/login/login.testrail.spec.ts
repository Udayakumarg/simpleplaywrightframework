// project-orangehrm/tests/login.testrail.spec.ts
import { test, expect } from "@framework";

test.skip("Login scenario linked to TestRail case C1234", async ({ page, envConfig, testrail }) => {
  await page.goto(envConfig.baseUrl);
  await page.fill('input[name="username"]', 'Admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');

  try {
    await expect(page).toHaveURL(/dashboard/);
    if (testrail) {
      await testrail.addResult(1234, 1, "Login passed ✅"); // status_id 1 = Passed
    }
  } catch (err) {
    if (testrail) {
      await testrail.addResult(1234, 5, "Login failed ❌"); // status_id 5 = Failed
    }
    throw err;
  }
});
