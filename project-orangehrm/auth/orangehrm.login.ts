import { Page } from "@playwright/test";
import { AuthProvider, Creds } from "simple-playwright-framework";

export class OrangeHRMLogin implements AuthProvider {
  constructor(private creds: Creds) {}

  async login(page: Page): Promise<void> {
    await page.fill("input[name='username']", this.creds.username);
    await page.fill("input[name='password']", this.creds.password);
    await page.click("button[type='submit']");
    await page.waitForURL("**/dashboard/**");
  }
}
