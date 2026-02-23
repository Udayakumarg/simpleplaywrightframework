import { BasePage } from "./BasePage";

/**
 * Sauce Demo Products Page Object
 * Handles product listing, filtering, and sorting
 */
export class ProductsPage extends BasePage {
  // Selectors
  private readonly PRODUCTS_CONTAINER = '[data-test="inventory"]';
  private readonly PRODUCT_ITEM = '[data-test="inventory-item"]';
  private readonly PRODUCT_NAME = '[data-test="inventory-item-name"]';
  private readonly PRODUCT_PRICE = '[data-test="inventory-item-price"]';
  private readonly SORT_DROPDOWN = '[data-test="product-sort-container"]';
  private readonly ADD_TO_CART_BUTTON_TEMPLATE = '[data-test="add-to-cart-{id}"]';
  private readonly REMOVE_BUTTON_TEMPLATE = '[data-test="remove-{id}"]';
  private readonly CART_LINK = '[data-test="shopping-cart-link"]';
  private readonly CART_BADGE = '[data-test="shopping-cart-badge"]';
  private readonly TITLE = '[data-test="title"]';
  private readonly MENU_BUTTON = '[data-test="bm-menu-button"]';
  private readonly LOGOUT_LINK = '[data-test="logout-sidebar-link"]';

  /**
   * Wait for products page to load
   */
  async waitForProductsPage(): Promise<void> {
    console.log(`[POM:ProductsPage] Waiting for products page to load`);
    await this.waitForElement(this.PRODUCTS_CONTAINER);
  }

  /**
   * Get all product names
   */
  async getProductNames(): Promise<string[]> {
    console.log(`[POM:ProductsPage] Getting all product names`);
    return await this.getAllElementsText(`${this.PRODUCT_ITEM} ${this.PRODUCT_NAME}`);
  }

  /**
   * Get product count
   */
  async getProductCount(): Promise<number> {
    console.log(`[POM:ProductsPage] Getting product count`);
    return await this.page.locator(this.PRODUCT_ITEM).count();
  }

  /**
   * Sort products by option
   */
  async sortBy(sortOption: string): Promise<void> {
    console.log(`[POM:ProductsPage] Sorting by: ${sortOption}`);
    await this.page.click(this.SORT_DROPDOWN);
    await this.page.waitForTimeout(300);
    await this.page.locator(`text=${sortOption}`).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Add product to cart by name
   */
  async addProductToCart(productName: string): Promise<void> {
    const productId = this.normalizeProductName(productName);
    const selector = this.ADD_TO_CART_BUTTON_TEMPLATE.replace("{id}", productId);
    console.log(`[POM:ProductsPage] Adding product to cart: ${productName}`);
    await this.page.click(selector).catch(() => {
      console.warn(`[POM:ProductsPage] Could not find add button for ${productName} with selector ${selector}`);
    });
  }

  /**
   * Remove product from cart by name
   */
  async removeProductFromCart(productName: string): Promise<void> {
    const productId = this.normalizeProductName(productName);
    const selector = this.REMOVE_BUTTON_TEMPLATE.replace("{id}", productId);
    console.log(`[POM:ProductsPage] Removing product: ${productName}`);
    await this.page.click(selector).catch(() => {
      console.warn(`[POM:ProductsPage] Could not find remove button for ${productName}`);
    });
  }

  /**
   * Get cart badge count
   */
  async getCartBadgeCount(): Promise<number> {
    const text = await this.getElementText(this.CART_BADGE);
    return parseInt(text || "0", 10);
  }

  /**
   * Click on cart
   */
  async clickCart(): Promise<void> {
    console.log(`[POM:ProductsPage] Clicking cart link`);
    await this.page.click(this.CART_LINK);
  }

  /**
   * Click on product to view details
   */
  async clickProduct(index: number = 0): Promise<void> {
    console.log(`[POM:ProductsPage] Clicking product at index ${index}`);
    const products = this.page.locator(this.PRODUCT_ITEM);
    await products.nth(index).click();
  }

  /**
   * Open sidebar menu
   */
  async openMenu(): Promise<void> {
    console.log(`[POM:ProductsPage] Opening sidebar menu`);
    await this.page.click(this.MENU_BUTTON);
    await this.page.waitForTimeout(500);
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    console.log(`[POM:ProductsPage] Logging out`);
    await this.openMenu();
    await this.page.click(this.LOGOUT_LINK);
  }

  /**
   * Normalize product name to lowercase with dashes
   */
  private normalizeProductName(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-");
  }
}
