import { Page } from "@playwright/test";
import type { EnvConfig } from "@framework/types/env";

/**
 * Base Page Object class
 * Provides common functionality for all page objects
 */
export class BasePage {
  protected page: Page;
  protected envConfig: EnvConfig;
  protected baseUrl: string;

  constructor(page: Page, envConfig: EnvConfig) {
    this.page = page;
    this.envConfig = envConfig;
    this.baseUrl = envConfig.baseUrl;
  }

  /**
   * Navigate to the base URL
   */
  async goToBaseUrl(): Promise<void> {
    console.log(`[POM] Navigating to ${this.baseUrl}`);
    await this.page.goto(this.baseUrl);
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string): Promise<void> {
    const url = `${this.baseUrl}${path}`;
    console.log(`[POM] Navigating to ${url}`);
    await this.page.goto(url);
  }

  /**
   * Wait for URL to match pattern
   */
  async waitForURL(urlPattern: RegExp | string): Promise<void> {
    console.log(`[POM] Waiting for URL: ${urlPattern}`);
    await this.page.waitForURL(urlPattern);
  }

  /**
   * Get current URL
   */
  getCurrentURL(): string {
    return this.page.url();
  }

  /**
   * Check if element exists
   */
  async elementExists(selector: string): Promise<boolean> {
    const count = await this.page.locator(selector).count();
    return count > 0;
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isVisible().catch(() => false);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout: number = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * Get element text
   */
  async getElementText(selector: string): Promise<string | null> {
    return await this.page.locator(selector).textContent();
  }

  /**
   * Get all elements text
   */
  async getAllElementsText(selector: string): Promise<string[]> {
    const elements = await this.page.locator(selector).all();
    const texts: string[] = [];
    for (const element of elements) {
      const text = await element.textContent();
      if (text) texts.push(text);
    }
    return texts;
  }

  /**
   * Wait for timeout
   */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }
}
