import { test, expect } from "@framework";

test.describe("Sauce Demo - Login Tests", () => {
  test("login with valid credentials @smoke @login", async ({ page, envConfig, td }) => {
    await page.goto(envConfig.baseUrl);

    // Fill login form
    await page.fill('input[data-test="username"]', td.validCredentials.username);
    await page.fill('input[data-test="password"]', td.validCredentials.password);

    // Click login button
    await page.click('input[data-test="login-button"]');

    // Verify successful login
    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('[data-test="title"]')).toContainText("Products");
  });

  test("login with invalid credentials @login", async ({ page, envConfig, td }) => {
    await page.goto(envConfig.baseUrl);

    // Fill login form with invalid credentials
    await page.fill('input[data-test="username"]', td.invalidCredentials.username);
    await page.fill('input[data-test="password"]', td.invalidCredentials.password);

    // Click login button
    await page.click('input[data-test="login-button"]');

    // Verify error message is displayed
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText("Username and password");
  });

  test("login with locked out user @login", async ({ page, envConfig, td }) => {
    await page.goto(envConfig.baseUrl);

    // Fill login form with locked out user
    await page.fill('input[data-test="username"]', td.lockedUser.username);
    await page.fill('input[data-test="password"]', td.lockedUser.password);

    // Click login button
    await page.click('input[data-test="login-button"]');

    // Verify locked out error message
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText("locked out");
  });

  test("logout functionality @login", async ({ page, envConfig, td }) => {
    // Login first
    await page.goto(envConfig.baseUrl);
    await page.fill('input[data-test="username"]', td.validCredentials.username);
    await page.fill('input[data-test="password"]', td.validCredentials.password);
    await page.click('input[data-test="login-button"]');

    // Wait for inventory page
    await expect(page).toHaveURL(/inventory/);

    // Open the sidebar menu
    await page.click('[data-test="bm-menu-button"]');
    await page.waitForTimeout(500);

    // Click logout button
    await page.click('[data-test="logout-sidebar-link"]');

    // Verify redirected to login page
    await expect(page).toHaveURL(/\//);
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });
});
