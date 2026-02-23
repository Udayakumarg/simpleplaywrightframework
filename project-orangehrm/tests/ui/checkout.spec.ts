import { test, expect } from "@framework";

test.describe("Sauce Demo - Checkout Flow", () => {
  test.beforeEach(async ({ page, envConfig, td }) => {
    // Login before each test
    await page.goto(envConfig.baseUrl);
    await page.fill('input[data-test="username"]', td.loginCredentials.username);
    await page.fill('input[data-test="password"]', td.loginCredentials.password);
    await page.click('input[data-test="login-button"]');
    await page.waitForURL(/inventory/);
  });

  test("complete checkout with valid information @checkout @smoke", async ({ page, td }) => {
    // Add products to cart
    for (const product of td.productsToAdd) {
      const productId = product.toLowerCase().replace(/\s+/g, "-");
      await page.locator(`[data-test="add-to-cart-${productId}"]`).first().click();
    }

    // Go to cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.waitForURL(/cart/);

    // Click checkout
    await page.locator('[data-test="checkout"]').click();
    await page.waitForURL(/checkout-step-one/);

    // Fill checkout information
    await page.fill('[data-test="firstName"]', td.checkoutInfo.firstName);
    await page.fill('[data-test="lastName"]', td.checkoutInfo.lastName);
    await page.fill('[data-test="postalCode"]', td.checkoutInfo.zipCode);

    // Click continue
    await page.locator('[data-test="continue"]').click();

    // Verify on checkout step 2
    await expect(page).toHaveURL(/checkout-step-two/);
    await expect(page.locator('[data-test="summary-subtitle"]')).toBeVisible();
  });

  test("complete full checkout flow @checkout", async ({ page, td }) => {
    // Add products to cart
    for (const product of td.productsToAdd) {
      const productId = product.toLowerCase().replace(/\s+/g, "-");
      await page.locator(`[data-test="add-to-cart-${productId}"]`).first().click();
    }

    // Go to cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.waitForURL(/cart/);

    // Click checkout
    await page.locator('[data-test="checkout"]').click();
    await page.waitForURL(/checkout-step-one/);

    // Fill checkout information
    await page.fill('[data-test="firstName"]', td.checkoutInfo.firstName);
    await page.fill('[data-test="lastName"]', td.checkoutInfo.lastName);
    await page.fill('[data-test="postalCode"]', td.checkoutInfo.zipCode);

    // Click continue
    await page.locator('[data-test="continue"]').click();
    await page.waitForURL(/checkout-step-two/);

    // Verify order summary
    const cartList = page.locator('[data-test="cart-list"]');
    await expect(cartList).toBeVisible();

    // Click finish
    await page.locator('[data-test="finish"]').click();

    // Verify order completion
    await expect(page).toHaveURL(/checkout-complete/);
    await expect(page.locator('[data-test="complete-header"]')).toContainText("Thank you");
  });

  test("validated checkout - missing first name @checkout", async ({ page, td }) => {
    // Add product to cart
    const productId = td.productsToAdd[0].toLowerCase().replace(/\s+/g, "-");
    await page.locator(`[data-test="add-to-cart-${productId}"]`).first().click();

    // Go to cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.waitForURL(/cart/);

    // Click checkout
    await page.locator('[data-test="checkout"]').click();
    await page.waitForURL(/checkout-step-one/);

    // Fill only last name and zip code
    await page.fill('[data-test="lastName"]', td.checkoutInfo.lastName);
    await page.fill('[data-test="postalCode"]', td.checkoutInfo.zipCode);

    // Click continue
    await page.locator('[data-test="continue"]').click();

    // Verify error message
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText("First Name");
  });

  test("validated checkout - missing last name @checkout", async ({ page, td }) => {
    // Add product to cart
    const productId = td.productsToAdd[0].toLowerCase().replace(/\s+/g, "-");
    await page.locator(`[data-test="add-to-cart-${productId}"]`).first().click();

    // Go to cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.waitForURL(/cart/);

    // Click checkout
    await page.locator('[data-test="checkout"]').click();
    await page.waitForURL(/checkout-step-one/);

    // Fill only first name and zip code
    await page.fill('[data-test="firstName"]', td.checkoutInfo.firstName);
    await page.fill('[data-test="postalCode"]', td.checkoutInfo.zipCode);

    // Click continue
    await page.locator('[data-test="continue"]').click();

    // Verify error message
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText("Last Name");
  });

  test("validated checkout - missing postal code @checkout", async ({ page, td }) => {
    // Add product to cart
    const productId = td.productsToAdd[0].toLowerCase().replace(/\s+/g, "-");
    await page.locator(`[data-test="add-to-cart-${productId}"]`).first().click();

    // Go to cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.waitForURL(/cart/);

    // Click checkout
    await page.locator('[data-test="checkout"]').click();
    await page.waitForURL(/checkout-step-one/);

    // Fill only first name and last name
    await page.fill('[data-test="firstName"]', td.checkoutInfo.firstName);
    await page.fill('[data-test="lastName"]', td.checkoutInfo.lastName);

    // Click continue
    await page.locator('[data-test="continue"]').click();

    // Verify error message
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText("Postal Code");
  });

  test("cancel checkout @checkout", async ({ page, td }) => {
    // Add product to cart
    const productId = td.productsToAdd[0].toLowerCase().replace(/\s+/g, "-");
    await page.locator(`[data-test="add-to-cart-${productId}"]`).first().click();

    // Go to cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.waitForURL(/cart/);

    // Click checkout
    await page.locator('[data-test="checkout"]').click();
    await page.waitForURL(/checkout-step-one/);

    // Click cancel
    await page.locator('[data-test="cancel"]').click();

    // Verify back to inventory
    await expect(page).toHaveURL(/inventory/);
  });
});
