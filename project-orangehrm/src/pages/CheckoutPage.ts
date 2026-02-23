import { BasePage } from "./BasePage";

/**
 * Sauce Demo Checkout Page Object
 * Handles checkout flow (step 1, step 2, and completion)
 */
export class CheckoutPage extends BasePage {
  // Step 1 Selectors
  private readonly FIRST_NAME_INPUT = '[data-test="firstName"]';
  private readonly LAST_NAME_INPUT = '[data-test="lastName"]';
  private readonly POSTAL_CODE_INPUT = '[data-test="postalCode"]';
  private readonly CONTINUE_BUTTON = '[data-test="continue"]';
  private readonly CANCEL_BUTTON = '[data-test="cancel"]';
  private readonly ERROR_MESSAGE = '[data-test="error"]';

  // Step 2 Selectors
  private readonly SUMMARY_SUBTITLE = '[data-test="summary-subtitle"]';
  private readonly FINISH_BUTTON = '[data-test="finish"]';

  // Completion Selectors
  private readonly COMPLETE_HEADER = '[data-test="complete-header"]';
  private readonly COMPLETE_TEXT = '[data-test="complete-text"]';
  private readonly BACK_HOME_BUTTON = '[data-test="back-home"]';

  /**
   * Wait for checkout step 1 page to load
   */
  async waitForCheckoutStep1(): Promise<void> {
    console.log(`[POM:CheckoutPage] Waiting for checkout step 1`);
    await this.waitForElement(this.FIRST_NAME_INPUT);
  }

  /**
   * Fill checkout information (Step 1)
   */
  async fillCheckoutInfo(
    firstName: string,
    lastName: string,
    zipCode: string
  ): Promise<void> {
    console.log(
      `[POM:CheckoutPage] Filling checkout info: ${firstName} ${lastName} ${zipCode}`
    );
    await this.page.fill(this.FIRST_NAME_INPUT, firstName);
    await this.page.fill(this.LAST_NAME_INPUT, lastName);
    await this.page.fill(this.POSTAL_CODE_INPUT, zipCode);
  }

  /**
   * Fill only first name
   */
  async fillFirstName(firstName: string): Promise<void> {
    console.log(`[POM:CheckoutPage] Filling first name: ${firstName}`);
    await this.page.fill(this.FIRST_NAME_INPUT, firstName);
  }

  /**
   * Fill only last name
   */
  async fillLastName(lastName: string): Promise<void> {
    console.log(`[POM:CheckoutPage] Filling last name: ${lastName}`);
    await this.page.fill(this.LAST_NAME_INPUT, lastName);
  }

  /**
   * Fill only postal code
   */
  async fillPostalCode(zipCode: string): Promise<void> {
    console.log(`[POM:CheckoutPage] Filling postal code: ${zipCode}`);
    await this.page.fill(this.POSTAL_CODE_INPUT, zipCode);
  }

  /**
   * Click continue button
   */
  async clickContinue(): Promise<void> {
    console.log(`[POM:CheckoutPage] Clicking continue button`);
    await this.page.click(this.CONTINUE_BUTTON);
  }

  /**
   * Click cancel button
   */
  async clickCancel(): Promise<void> {
    console.log(`[POM:CheckoutPage] Clicking cancel button`);
    await this.page.click(this.CANCEL_BUTTON);
  }

  /**
   * Check if error message is displayed
   */
  async isErrorDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.ERROR_MESSAGE);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.isErrorDisplayed()) {
      return await this.getElementText(this.ERROR_MESSAGE);
    }
    return null;
  }

  /**
   * Wait for checkout step 2 page to load
   */
  async waitForCheckoutStep2(): Promise<void> {
    console.log(`[POM:CheckoutPage] Waiting for checkout step 2`);
    await this.waitForElement(this.SUMMARY_SUBTITLE);
  }

  /**
   * Click finish button
   */
  async clickFinish(): Promise<void> {
    console.log(`[POM:CheckoutPage] Clicking finish button`);
    await this.page.click(this.FINISH_BUTTON);
  }

  /**
   * Wait for order completion
   */
  async waitForOrderCompletion(): Promise<void> {
    console.log(`[POM:CheckoutPage] Waiting for order completion`);
    await this.waitForElement(this.COMPLETE_HEADER);
  }

  /**
   * Get completion message
   */
  async getCompletionMessage(): Promise<string | null> {
    return await this.getElementText(this.COMPLETE_HEADER);
  }

  /**
   * Click back home button
   */
  async clickBackHome(): Promise<void> {
    console.log(`[POM:CheckoutPage] Clicking back home button`);
    await this.page.click(this.BACK_HOME_BUTTON);
  }

  /**
   * Clear all input fields
   */
  async clearInputs(): Promise<void> {
    console.log(`[POM:CheckoutPage] Clearing input fields`);
    await this.page.fill(this.FIRST_NAME_INPUT, "");
    await this.page.fill(this.LAST_NAME_INPUT, "");
    await this.page.fill(this.POSTAL_CODE_INPUT, "");
  }
}
