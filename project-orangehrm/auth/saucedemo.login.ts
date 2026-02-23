import { Page } from "@playwright/test";
import { AuthProvider } from "@framework/fixtures/src/types/auth";

/**
 * Sauce Demo Login Provider
 * Implements the AuthProvider interface for Sauce Demo authentication
 * Supports standard_user, problem_user, performance_glitch_user, locked_out_user, etc.
 */
export class SauceDemoLogin implements AuthProvider {
  private creds: { username: string; password: string };

  constructor(creds: { username: string; password: string }) {
    this.creds = creds;
  }

  async login(page: Page): Promise<void> {
    console.log(`[Framework] SauceDemoLogin: Logging in as ${this.creds.username}`);

    // Fill username field
    await page.fill('input[data-test="username"]', this.creds.username);

    // Fill password field
    await page.fill('input[data-test="password"]', this.creds.password);

    // Click login button
    await page.click('input[data-test="login-button"]');

    // Wait for either successful login or error message
    try {
      // Try to wait for inventory page (successful login)
      await page.waitForURL(/inventory/, { timeout: 5000 });
      console.log(`[Framework] SauceDemoLogin: Successfully logged in as ${this.creds.username}`);
    } catch {
      // Check if there's an error message (e.g., locked out, invalid credentials)
      const errorElement = page.locator('[data-test="error"]');
      const isVisible = await errorElement.isVisible().catch(() => false);

      if (isVisible) {
        const errorMessage = await errorElement.textContent();
        console.log(`[Framework] SauceDemoLogin: Login error for ${this.creds.username}: ${errorMessage}`);
        // Error message is visible but we still allow the test to proceed
        // (test may be testing error scenarios)
      }
    }
  }
}
