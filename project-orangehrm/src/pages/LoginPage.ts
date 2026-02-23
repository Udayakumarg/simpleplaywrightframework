import { BasePage } from "./BasePage";

/**
 * Sauce Demo Login Page Object
 * Handles all login-related interactions
 */
export class LoginPage extends BasePage {
  // Selectors
  private readonly USERNAME_INPUT = 'input[data-test="username"]';
  private readonly PASSWORD_INPUT = 'input[data-test="password"]';
  private readonly LOGIN_BUTTON = 'input[data-test="login-button"]';
  private readonly ERROR_MESSAGE = '[data-test="error"]';

  /**
   * Fill username field
   */
  async fillUsername(username: string): Promise<void> {
    console.log(`[POM:LoginPage] Filling username: ${username}`);
    await this.page.fill(this.USERNAME_INPUT, username);
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string): Promise<void> {
    console.log(`[POM:LoginPage] Filling password`);
    await this.page.fill(this.PASSWORD_INPUT, password);
  }

  /**
   * Click login button
   */
  async clickLogin(): Promise<void> {
    console.log(`[POM:LoginPage] Clicking login button`);
    await this.page.click(this.LOGIN_BUTTON);
  }

  /**
   * Login with credentials
   */
  async login(username: string, password: string): Promise<void> {
    console.log(`[POM:LoginPage] Logging in as ${username}`);
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  /**
   * Wait for successful login (redirected to inventory)
   */
  async waitForLoginSuccess(): Promise<void> {
    console.log(`[POM:LoginPage] Waiting for successful login`);
    await this.waitForURL(/inventory/);
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
   * Check if specific error is displayed
   */
  async hasErrorMessage(text: string): Promise<boolean> {
    const errorMsg = await this.getErrorMessage();
    return errorMsg?.includes(text) ?? false;
  }

  /**
   * Clear all input fields
   */
  async clearInputs(): Promise<void> {
    console.log(`[POM:LoginPage] Clearing input fields`);
    await this.page.fill(this.USERNAME_INPUT, "");
    await this.page.fill(this.PASSWORD_INPUT, "");
  }
}
