import { Page } from "@playwright/test";
import { AuthProvider } from "@framework/fixtures/src/fixtures/auth.fixture"; // framework contract

export class OrangeHRMLogin implements AuthProvider {
  private creds: { username: string; password: string };

  constructor(creds: { username: string; password: string }) {
    this.creds = creds;
  }

  async login(page: Page): Promise<void> {
    await page.fill("input[name='username']", this.creds.username);
    await page.fill("input[name='password']", this.creds.password);
    await page.click("button[type='submit']");
    await page.waitForURL("**/dashboard/index");
  }
}
