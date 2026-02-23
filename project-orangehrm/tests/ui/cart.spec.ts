import { test, expect } from "@framework";

test.describe("Sauce Demo - Shopping Cart", () => {
  test.beforeEach(async ({ page, envConfig, td }) => {
    // Login before each test
    await page.goto(envConfig.baseUrl);
    await page.fill('input[data-test="username"]', td.loginCredentials.username);
    await page.fill('input[data-test="password"]', td.loginCredentials.password);
    await page.click('input[data-test="login-button"]');
    await page.waitForURL(/inventory/);
  });

  test("add single product to cart @cart @smoke", async ({ page }) => {
    // Add first product to cart
    const addToCartButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').first();
    await addToCartButton.click();

    // Verify cart counter is updated
    const cartCounter = page.locator('[data-test="shopping-cart-badge"]');
    await expect(cartCounter).toContainText("1");
  });

  test("add multiple products to cart @cart", async ({ page, td }) => {
    // Add first product
    const firstProduct = td.productsToAdd[0];
    await page.locator(`[data-test="add-to-cart-${firstProduct.toLowerCase().replace(/\s+/g, "-")}"]`).first().click();

    // Add second product
    const secondProduct = td.productsToAdd[1];
    await page.locator(`[data-test="add-to-cart-${secondProduct.toLowerCase().replace(/\s+/g, "-")}"]`).first().click();

    // Verify cart counter shows 2 items
    const cartCounter = page.locator('[data-test="shopping-cart-badge"]');
    await expect(cartCounter).toContainText("2");
  });

  test("remove product from cart @cart", async ({ page, td }) => {
    // Add product to cart
    const productToAdd = td.productsToAdd[0];
    await page.locator(`[data-test="add-to-cart-${productToAdd.toLowerCase().replace(/\s+/g, "-")}"]`).first().click();

    // Verify cart counter is 1
    const cartCounter = page.locator('[data-test="shopping-cart-badge"]');
    await expect(cartCounter).toContainText("1");

    // Click to open cart
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.waitForURL(/cart/);

    // Remove product from cart
    const removeButton = page.locator('[data-test="remove-sauce-labs-backpack"]').first();
    await removeButton.click();

    // Verify cart counter is removed or shows 0
    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    const badgeVisible = await cartBadge.isVisible();

    if (badgeVisible) {
      expect(await cartBadge.textContent()).toBe("0");
    }

    // Verify cart is empty
    const cartItems = page.locator('[data-test="cart-item"]');
    expect(await cartItems.count()).toBe(0);
  });

  test("view cart @cart", async ({ page, td }) => {
    // Add product to cart
    const productToAdd = td.productsToAdd[0];
    await page.locator(`[data-test="add-to-cart-${productToAdd.toLowerCase().replace(/\s+/g, "-")}"]`).first().click();

    // Click cart link
    await page.locator('[data-test="shopping-cart-link"]').click();

    // Verify cart page
    await expect(page).toHaveURL(/cart/);
    await expect(page.locator('[data-test="cart-list"]')).toBeVisible();

    // Verify product is in cart
    const cartItems = page.locator('[data-test="cart-item"]');
    expect(await cartItems.count()).toBeGreaterThan(0);
  });

  test("proceed to checkout from cart @cart", async ({ page, td }) => {
    // Add product to cart
    const productToAdd = td.productsToAdd[0];
    await page.locator(`[data-test="add-to-cart-${productToAdd.toLowerCase().replace(/\s+/g, "-")}"]`).first().click();

    // Click cart link
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.waitForURL(/cart/);

    // Click checkout button
    await page.locator('[data-test="checkout"]').click();

    // Verify checkpoint page
    await expect(page).toHaveURL(/checkout-step-one/);
  });
});
