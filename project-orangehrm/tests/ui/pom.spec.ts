import { test, expect } from "@framework";
import { LoginPage, ProductsPage } from "@project/src/pages";

test.describe("Sauce Demo - UI Tests with POM", () => {
  test.describe("Login Tests", () => {
    test("login with valid credentials @smoke @pom @ui", async ({ page, envConfig, td }) => {
      const loginPage = new LoginPage(page, envConfig);

      await loginPage.goToBaseUrl();
      await loginPage.login(td.validCredentials.username, td.validCredentials.password);
      await loginPage.waitForLoginSuccess();

      expect(page.url()).toContain("inventory");
    });

    test("login with invalid credentials @pom @ui", async ({ page, envConfig, td }) => {
      const loginPage = new LoginPage(page, envConfig);

      await loginPage.goToBaseUrl();
      await loginPage.login(td.invalidCredentials.username, td.invalidCredentials.password);

      const hasError = await loginPage.isErrorDisplayed();
      expect(hasError).toBe(true);

      const errorMsg = await loginPage.getErrorMessage();
      expect(errorMsg).toContain("Username and password");
    });

    test("login with locked out user @pom @ui", async ({ page, envConfig, td }) => {
      const loginPage = new LoginPage(page, envConfig);

      await loginPage.goToBaseUrl();
      await loginPage.login(td.lockedUser.username, td.lockedUser.password);

      const hasError = await loginPage.hasErrorMessage("locked out");
      expect(hasError).toBe(true);
    });

    test("logout functionality @pom @ui", async ({ page, envConfig, td }) => {
      const loginPage = new LoginPage(page, envConfig);
      const productsPage = new ProductsPage(page, envConfig);

      // Login
      await loginPage.goToBaseUrl();
      await loginPage.login(td.validCredentials.username, td.validCredentials.password);
      await loginPage.waitForLoginSuccess();

      // Logout
      await productsPage.logout();

      // Verify redirected to login page
      expect(page.url()).toContain(envConfig.baseUrl);
    });
  });

  test.describe("Products and Sorting", () => {
    test.beforeEach(async ({ page, envConfig, td }) => {
      const loginPage = new LoginPage(page, envConfig);
      await loginPage.goToBaseUrl();
      await loginPage.login(td.validCredentials.username, td.validCredentials.password);
      await loginPage.waitForLoginSuccess();
    });

    test("verify products are displayed @pom @ui", async ({ page, envConfig }) => {
      const productsPage = new ProductsPage(page, envConfig);
      await productsPage.waitForProductsPage();

      const count = await productsPage.getProductCount();
      expect(count).toBeGreaterThan(0);
    });

    test("sort products by Name A to Z @pom @ui @sort", async ({ page, envConfig, td }) => {
      const productsPage = new ProductsPage(page, envConfig);
      await productsPage.waitForProductsPage();

      // Get products before sort
      const productsBefore = await productsPage.getProductNames();

      // Sort
      const sortOption = td.sortOptions.find((s: any) => s.name === "Name (A to Z)");
      if (sortOption) {
        await productsPage.sortBy(sortOption.name);
      }

      // Get products after sort
      const productsAfter = await productsPage.getProductNames();

      // Verify order - first product should be 'Backpack'
      expect(productsAfter[0]).toContain("Backpack");
    });
  });

  test.describe("Shopping Cart", () => {
    test.beforeEach(async ({ page, envConfig, td }) => {
      const loginPage = new LoginPage(page, envConfig);
      await loginPage.goToBaseUrl();
      await loginPage.login(td.validCredentials.username, td.validCredentials.password);
      await loginPage.waitForLoginSuccess();
    });

    test("add product to cart @pom @ui @cart", async ({ page, envConfig, td }) => {
      const productsPage = new ProductsPage(page, envConfig);
      await productsPage.waitForProductsPage();

      const productToAdd = td.productsToAdd[0];
      await productsPage.addProductToCart(productToAdd);

      const count = await productsPage.getCartBadgeCount();
      expect(count).toBe(1);
    });

    test("add multiple products to cart @pom @ui @cart", async ({ page, envConfig, td }) => {
      const productsPage = new ProductsPage(page, envConfig);
      await productsPage.waitForProductsPage();

      for (const product of td.productsToAdd) {
        await productsPage.addProductToCart(product);
      }

      const count = await productsPage.getCartBadgeCount();
      expect(count).toBe(td.productsToAdd.length);
    });

    test("remove product from cart @pom @ui @cart", async ({ page, envConfig, td }) => {
      const productsPage = new ProductsPage(page, envConfig);
      const { CartPage } = await import("@project/src/pages");

      await productsPage.waitForProductsPage();

      // Add product
      const productToAdd = td.productsToAdd[0];
      await productsPage.addProductToCart(productToAdd);

      // Go to cart
      await productsPage.clickCart();
      await page.waitForURL(/cart/);

      const cartPage = new CartPage(page, envConfig);
      await cartPage.waitForCartPage();

      // Remove product
      await cartPage.removeFromCart(productToAdd);

      const isEmpty = await cartPage.isCartEmpty();
      expect(isEmpty).toBe(true);
    });
  });
});
