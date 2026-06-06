import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "simple-playwright-framework";

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton:  Locator;
  readonly errorAlert:    Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.$("input[name='username']");
    this.passwordInput = this.$("input[name='password']");
    this.submitButton  = this.$("button[type='submit']");
    this.errorAlert    = this.$(".oxd-alert-content");
  }

  async signIn(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoginFailed(): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
  }

  async isReady(): Promise<boolean> {
    return this.usernameInput.isVisible();
  }
}
