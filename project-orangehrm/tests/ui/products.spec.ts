import { test, expect } from "@framework";

test.describe("Sauce Demo - Product Listing and Sorting", () => {
  test.beforeEach(async ({ page, envConfig, td }) => {
    // Login before each test
    await page.goto(envConfig.baseUrl);
    await page.fill('input[data-test="username"]', td.loginCredentials.username);
    await page.fill('input[data-test="password"]', td.loginCredentials.password);
    await page.click('input[data-test="login-button"]');
    await page.waitForURL(/inventory/);
  });

  test("verify products are displayed @products", async ({ page }) => {
    // Verify products container is visible
    const productContainer = page.locator('[data-test="inventory"]');
    await expect(productContainer).toBeVisible();

    // Verify at least 6 products are displayed
    const productItems = page.locator('[data-test="inventory-item"]');
    const count = await productItems.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test("sort products by Name (A to Z) @products @sort", async ({ page, td }) => {
    // Open sort dropdown
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.click();

    // Select Name (A to Z)
    const sortOption = td.sortOptions[0];
    await page.locator(`text=${sortOption.name}`).click();

    // Wait for products to re-render
    await page.waitForTimeout(500);

    // Verify products are sorted correctly
    const productNames = page.locator('[data-test="inventory-item-name"]');
    const firstProduct = await productNames.first().textContent();
    expect(firstProduct).toBe("Sauce Labs Backpack");
  });

  test("sort products by Name (Z to A) @products @sort", async ({ page, td }) => {
    // Open sort dropdown
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.click();

    // Select Name (Z to A)
    const sortOption = td.sortOptions[1];
    await page.locator(`text=${sortOption.name}`).click();

    // Wait for products to re-render
    await page.waitForTimeout(500);

    // Verify products are sorted correctly
    const productNames = page.locator('[data-test="inventory-item-name"]');
    const firstProduct = await productNames.first().textContent();
    expect(firstProduct).toBe("Test.allTheThings() T-Shirt");
  });

  test("sort products by Price (Low to High) @products @sort", async ({ page, td }) => {
    // Open sort dropdown
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.click();

    // Select Price (Low to High)
    const sortOption = td.sortOptions[2];
    await page.locator(`text=${sortOption.name}`).click();

    // Wait for products to re-render
    await page.waitForTimeout(500);

    // Verify products are sorted by price (lowest first)
    const productPrices = page.locator('[data-test="inventory-item-price"]');
    const firstPrice = await productPrices.first().textContent();
    expect(firstPrice).toContain("$9.99");
  });

  test("sort products by Price (High to Low) @products @sort", async ({ page, td }) => {
    // Open sort dropdown
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await sortDropdown.click();

    // Select Price (High to Low)
    const sortOption = td.sortOptions[3];
    await page.locator(`text=${sortOption.name}`).click();

    // Wait for products to re-render
    await page.waitForTimeout(500);

    // Verify products are sorted by price (highest first)
    const productPrices = page.locator('[data-test="inventory-item-price"]');
    const firstPrice = await productPrices.first().textContent();
    expect(firstPrice).toContain("$49.99");
  });

  test("click on product to view details @products", async ({ page }) => {
    // Click on first product
    const firstProduct = page.locator('[data-test="inventory-item"]').first();
    const productName = await firstProduct.locator('[data-test="inventory-item-name"]').textContent();
    await firstProduct.locator('[data-test="inventory-item-name"]').click();

    // Verify product details page
    await expect(page).toHaveURL(/inventory-item/);
    const detailTitle = page.locator('[data-test="inventory-details-name"]');
    await expect(detailTitle).toContainText(productName || "");
  });
});
