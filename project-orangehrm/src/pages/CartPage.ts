import { BasePage } from "./BasePage";

/**
 * Sauce Demo Cart Page Object
 * Handles shopping cart operations
 */
export class CartPage extends BasePage {
  // Selectors
  private readonly CART_LIST = '[data-test="cart-list"]';
  private readonly CART_ITEM = '[data-test="cart-item"]';
  private readonly CART_ITEM_NAME = '[data-test="inventory-item-name"]';
  private readonly CART_ITEM_PRICE = '[data-test="inventory-item-price"]';
  private readonly CHECKOUT_BUTTON = '[data-test="checkout"]';
  private readonly CONTINUE_SHOPPING = '[data-test="continue-shopping"]';
  private readonly REMOVE_BUTTON_TEMPLATE = '[data-test="remove-{id}"]';

  /**
   * Wait for cart page to load
   */
  async waitForCartPage(): Promise<void> {
    console.log(`[POM:CartPage] Waiting for cart page to load`);
    await this.waitForElement(this.CART_LIST);
  }

  /**
   * Get cart items count
   */
  async getCartItemsCount(): Promise<number> {
    console.log(`[POM:CartPage] Getting cart items count`);
    return await this.page.locator(this.CART_ITEM).count();
  }

  /**
   * Get all cart item names
   */
  async getCartItemNames(): Promise<string[]> {
    console.log(`[POM:CartPage] Getting all cart item names`);
    return await this.getAllElementsText(`${this.CART_ITEM} ${this.CART_ITEM_NAME}`);
  }

  /**
   * Check if cart is empty
   */
  async isCartEmpty(): Promise<boolean> {
    console.log(`[POM:CartPage] Checking if cart is empty`);
    const count = await this.getCartItemsCount();
    return count === 0;
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(productName: string): Promise<void> {
    const productId = this.normalizeProductName(productName);
    const selector = this.REMOVE_BUTTON_TEMPLATE.replace("{id}", productId);
    console.log(`[POM:CartPage] Removing ${productName} from cart`);
    await this.page.click(selector).catch(() => {
      console.warn(`[POM:CartPage] Could not find remove button for ${productName}`);
    });
  }

  /**
   * Click checkout button
   */
  async clickCheckout(): Promise<void> {
    console.log(`[POM:CartPage] Clicking checkout button`);
    await this.page.click(this.CHECKOUT_BUTTON);
  }

  /**
   * Click continue shopping button
   */
  async clickContinueShopping(): Promise<void> {
    console.log(`[POM:CartPage] Clicking continue shopping button`);
    await this.page.click(this.CONTINUE_SHOPPING);
  }

  /**
   * Get total price of all items
   */
  async getTotalPrice(): Promise<number> {
    console.log(`[POM:CartPage] Getting total price`);
    const prices = await this.getAllElementsText(this.CART_ITEM_PRICE);
    let total = 0;
    for (const price of prices) {
      const numStr = price.replace("$", "").trim();
      total += parseFloat(numStr);
    }
    return total;
  }

  /**
   * Normalize product name to lowercase with dashes
   */
  private normalizeProductName(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-");
  }
}
